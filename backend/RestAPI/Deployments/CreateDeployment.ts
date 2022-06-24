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
  ImportMap,
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
import { IsURLOptions } from "express-validator/src/options";
import path from "path";

const urlValidations: IsURLOptions = {
  require_host: false,
  require_port: false,
  require_protocol: false,
  require_tld: false,
  require_valid_protocol: false,
  host_whitelist: [],
  allow_protocol_relative_urls: true,
  allow_fragments: false,
  allow_query_components: false,
  allow_trailing_dot: true,
  allow_underscores: true,
};

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
  body("changedMicrofrontends.*.entryUrl")
    .isURL(urlValidations)
    .matches(/^\/.+(?<!\/)$/),
  body("changedMicrofrontends.*.trailingSlashUrl")
    .isURL(urlValidations)
    .matches(/^\/?.*\/$/)
    .optional(),
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
      customerOrgId,
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

        const pathPrefix = `/${customerOrg.orgKey}/apps/${microfrontend.name}`;
        const entryUrl = new URL(
          path.join(pathPrefix, changedMicrofrontend.entryUrl),
          process.env.BASEPLATE_CDN
        ).href;
        const trailingSlashUrl = changedMicrofrontend.trailingSlashUrl
          ? new URL(
              path.join(pathPrefix, changedMicrofrontend.trailingSlashUrl),
              process.env.BASEPLATE_CDN
            ).href
          : undefined;

        return {
          auditAccountId: accountId,
          bareImportSpecifier,
          deploymentChangedMicrofrontend: true,
          deploymentId: deployment.id,
          microfrontendId: changedMicrofrontend.microfrontendId,
          entryUrl,
          trailingSlashUrl,
        };
      });

    // Verify that the entryUrl is publicly reachable
    const publiclyReachableResults = await Promise.allSettled(
      changedDeployedMicrofrontends.map(
        async (changedDeployedMicrofrontend) => {
          try {
            const response = await fetch(changedDeployedMicrofrontend.entryUrl);
            if (!response.ok) {
              // Not throwing an Error, which is unusual, but intentional here
              throw changedDeployedMicrofrontend.entryUrl;
            }
          } catch {
            throw changedDeployedMicrofrontend.entryUrl;
          }
        }
      )
    );

    const unreachableUrls = publiclyReachableResults
      .filter((r) => r.status === "rejected")
      // @ts-ignore
      .map((r) => r.reason);
    if (unreachableUrls.length > 0) {
      // return invalidRequest(res, [
      //   `The following URLs are not publicly reachable, so they cannot be put into the import map created by this deployment`,
      //   ...unreachableUrls,
      // ]);
    }

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
        importMap,
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
  importMap: ImportMap;
}
