import { body, param } from "express-validator";
import { CustomerOrgModel } from "../../DB/Models/CustomerOrg/CustomerOrg";
import {
  DeployedMicrofrontendCreationAttributes,
  DeployedMicrofrontendModel,
} from "../../DB/Models/DeployedMicrofrontend/DeployedMicrofrontend";
import {
  DeploymentAttributes,
  DeploymentCause,
  DeploymentModel,
  DeploymentStatus,
} from "../../DB/Models/Deployment/Deployment";
import { EnvironmentModel } from "../../DB/Models/Environment/Environment";
import { MicrofrontendModel } from "../../DB/Models/Microfrontend/Microfrontend";
import { router } from "../../Router";
import {
  invalidRequest,
  serverApiError,
  validationResponseMiddleware,
} from "../../Utils/EndpointResponses";
import { writeCloudflareKV } from "./CloudflareKV";
import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";
import {
  checkPermissionsMiddleware,
  PermissionOperator,
} from "../../Utils/IAMUtils";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";

router.post<
  RouteParamsWithCustomerOrg,
  EndpointCreateDeploymentResBody,
  EndpointCreateDeploymentReqBody
>(
  "/api/orgs/:customerOrgId/deployments",

  // Request validation
  param("customerOrgId").isUUID(),
  body("environmentId").isUUID(),
  body("cause").isIn(Object.values(DeploymentCause)),
  body("changedMicrofrontends").isArray(),
  body("changedMicrofrontends.*.microfrontendId").isUUID(),
  body("changedMicrofrontends.*.entryUrl").isString(),
  body("changedMicrofrontends.*.trailingSlashUrl").isString().optional(),
  validationResponseMiddleware,

  // Permissions
  (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      operator: PermissionOperator.or,
      permissionList: [
        { permission: BaseplatePermission.DeployAllMicrofrontends },
        {
          operator: PermissionOperator.and,
          permissionList: req.body.changedMicrofrontends.map(
            (changedMicrofrontend) => ({
              permission: BaseplatePermission.DeployOneMicrofrontend,
              entityId: changedMicrofrontend.microfrontendId,
            })
          ),
        },
      ],
    });
  },

  // Implementation
  async (req, res) => {
    const { customerOrgId } = req.params;
    const { accountId } = req.baseplateAccount;

    const customerOrg = await CustomerOrgModel.findByPk(customerOrgId);

    if (!customerOrg) {
      return invalidRequest(res, `No such customer org '${customerOrgId}'`);
    }

    const environment = await EnvironmentModel.findByPk(req.body.environmentId);

    if (!environment) {
      return invalidRequest(
        res,
        `Invalid environment '${req.body.environmentId}'`
      );
    }

    const deployment = await DeploymentModel.create({
      accountId,
      auditAccountId: accountId,
      cause: req.body.cause,
      environmentId: req.body.environmentId,
      status: DeploymentStatus.pending,
    });

    const allMicrofrontends = await MicrofrontendModel.findAll({
      where: {
        customerOrgId,
      },
    });

    const invalidMicrofrontendIds = req.body.changedMicrofrontends.filter(
      (changedMicrofrontend) => {
        return !allMicrofrontends.some(
          (m) => m.id === changedMicrofrontend.microfrontendId
        );
      }
    );

    if (invalidMicrofrontendIds.length > 0) {
      return invalidRequest(
        res,
        `Invalid microfrontend ids: ${invalidMicrofrontendIds.join(", ")}`
      );
    }

    const unchangedDeployedMicrofrontends: DeployedMicrofrontendCreationAttributes[] =
      (
        await Promise.all(
          allMicrofrontends.map(async (microfrontend) => {
            const changedMicrofrontend = req.body.changedMicrofrontends.find(
              (changedMicrofrontend) =>
                changedMicrofrontend.microfrontendId === microfrontend.id
            );

            if (!changedMicrofrontend) {
              const lastDeployment = await DeployedMicrofrontendModel.findOne({
                where: {
                  microfrontendId: microfrontend.id,
                },
                order: [["createdAt", "DESC"]],
              });

              if (lastDeployment) {
                return {
                  deploymentId: deployment.id,
                  microfrontendId: microfrontend.id,
                  bareImportSpecifier: lastDeployment.bareImportSpecifier,
                  entryUrl: lastDeployment.entryUrl,
                  trailingSlashUrl: lastDeployment.trailingSlashUrl,
                  deploymentChangedMicrofrontend: false,
                  auditAccountId: accountId,
                };
              }
            }

            return null;
          })
        )
      ).filter(Boolean) as DeployedMicrofrontendCreationAttributes[];

    const changedDeployedMicrofrontends: DeployedMicrofrontendCreationAttributes[] =
      req.body.changedMicrofrontends.map((changedMicrofrontend) => {
        const microfrontend = allMicrofrontends.find(
          (microfrontend) =>
            microfrontend.id === changedMicrofrontend.microfrontendId
        ) as MicrofrontendModel;
        const npmScope = microfrontend.useCustomerOrgKeyAsScope
          ? customerOrg.orgKey
          : microfrontend.scope;
        const bareImportSpecifier = `@${npmScope}/${microfrontend.name}`;

        // TODO - confirm entryUrl is publicly reachable
        return {
          auditAccountId: accountId,
          bareImportSpecifier,
          deploymentChangedMicrofrontend: true,
          deploymentId: deployment.id,
          entryUrl: changedMicrofrontend.entryUrl,
          microfrontendId: changedMicrofrontend.microfrontendId,
          trailingSlashUrl: changedMicrofrontend.trailingSlashUrl,
        };
      });

    const allDeployedMicrofrontends = unchangedDeployedMicrofrontends.concat(
      changedDeployedMicrofrontends
    );

    await DeployedMicrofrontendModel.bulkCreate(allDeployedMicrofrontends);

    const importMap = await deployment.deriveImportMap();

    const cloudflareKVKey = `import-map-${customerOrg.orgKey}-${environment.name}-systemjs`;
    const cloudflareResponse = await writeCloudflareKV(
      cloudflareKVKey,
      importMap
    );

    if (cloudflareResponse.success) {
      await deployment.update({
        status: DeploymentStatus.success,
      });

      return res.json({
        deployment: deployment.get({ plain: true }),
      });
    } else {
      console.error("Cloudflare KV Write Error:");
      console.error(cloudflareResponse.errors);

      await deployment.update({
        status: DeploymentStatus.failure,
      });

      return serverApiError(
        res,
        `Error communicating with Cloudflare during deployment. This deployment did not succeed.`
      );
    }
  }
);

export interface EndpointCreateDeploymentReqBody {
  baseplateToken?: BaseplateUUID;
  environmentId: BaseplateUUID;
  cause: DeploymentCause;
  changedMicrofrontends: ChangedMicrofrontend[];
}

interface ChangedMicrofrontend {
  microfrontendId: BaseplateUUID;
  entryUrl: string;
  trailingSlashUrl?: string;
}

export interface EndpointCreateDeploymentResBody {
  deployment: DeploymentAttributes;
}
