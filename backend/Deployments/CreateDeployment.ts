import { JWT } from ".pnpm/google-auth-library@7.14.0/node_modules/google-auth-library";
import { body, validationResult } from "express-validator";
import { CustomerOrgModel } from "../DB/Models/CustomerOrg/CustomerOrg";
import {
  DeployedMicrofrontendCreationAttributes,
  DeployedMicrofrontendModel,
} from "../DB/Models/DeployedMicrofrontend/DeployedMicrofrontend";
import {
  DeploymentAttributes,
  DeploymentCause,
  DeploymentModel,
  DeploymentStatus,
} from "../DB/Models/Deployment/Deployment";
import { EnvironmentModel } from "../DB/Models/Environment/Environment";
import { JWTModel, JWTType } from "../DB/Models/JWT/JWT";
import { MicrofrontendModel } from "../DB/Models/Microfrontend/Microfrontend";
import { router } from "../Router";
import { invalidRequest, serverApiError } from "../Utils/EndpointResponses";
import { writeCloudflareKV } from "./CloudflareKV";

router.post<Record<string, any>, DeploymentAttributes, RequestBody>(
  "/api/deployments",

  body("baseplateToken").isString().optional(),
  body("environmentId").isInt(),
  body("cause").isIn([Object.values(DeploymentCause)]),
  body("changedMicrofrontends").isArray(),
  body("changedMicrofrontends.microfrontendId").isInt(),
  body("changedMicrofrontends.entryUrl").isInt(),
  body("changedMicrofrontends.trailingSlashUrl").isInt().optional(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return invalidRequest(res, errors);
    }

    const userId = 1;
    const customerOrgId = 1;

    const customerOrg = await CustomerOrgModel.findByPk(customerOrgId);

    let baseplateTokenId: number | undefined;

    if (req.body.baseplateToken) {
      const token = await JWTModel.findOne({
        where: {
          jwtType: JWTType.baseplateApiToken,
          token: req.body.baseplateToken,
          userId,
        },
      });

      if (token) {
        baseplateTokenId = token.id;
      } else {
        return invalidRequest(res, `Invalid baseplate token`);
      }
    }

    const environment = await EnvironmentModel.findByPk(req.body.environmentId);

    if (!environment) {
      return invalidRequest(res, `Invalid environment`);
    }

    const deployment = await DeploymentModel.create({
      auditUserId: userId,
      baseplateTokenId,
      cause: req.body.cause,
      environmentId: req.body.environmentId,
      status: DeploymentStatus.pending,
      userId: customerOrgId,
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
                auditUserId: userId,
              };
            }
          }

          return null;
        })
      );

    const changedDeployedMicrofrontends: DeployedMicrofrontendCreationAttributes[] =
      req.body.changedMicrofrontends.map((changedMicrofrontend) => {
        const microfrontend = allMicrofrontends.find(
          (microfrontend) =>
            microfrontend.id === changedMicrofrontend.microfrontendId
        );
        const npmScope = microfrontend.useCustomerOrgKeyAsScope
          ? customerOrg.orgKey
          : microfrontend.scope;
        const bareImportSpecifier = `@${npmScope}/${microfrontend.name}`;

        return {
          auditUserId: userId,
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

      return res.json(deployment.get({ plain: true }));
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

interface RequestBody {
  baseplateToken?: string;
  environmentId: number;
  cause: DeploymentCause;
  changedMicrofrontends: ChangedMicrofrontend[];
}

interface ChangedMicrofrontend {
  microfrontendId: number;
  entryUrl: string;
  trailingSlashUrl?: string;
}
