import { param } from "express-validator";
import sequelize, { Model } from "sequelize";
import { DeployedMicrofrontendModel } from "../../DB/Models/DeployedMicrofrontend/DeployedMicrofrontend";
import { DeploymentModel } from "../../DB/Models/Deployment/Deployment";
import {
  Environment,
  EnvironmentModel,
} from "../../DB/Models/Environment/Environment";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { MicrofrontendModel } from "../../DB/Models/Microfrontend/Microfrontend";
import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";
import { router } from "../../Router";
import { invalidRequest, notFound } from "../../Utils/EndpointResponses";
import { RouteParamsWithMicrofrontendId } from "../../Utils/EndpointUtils";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";

router.get<
  RouteParamsWithMicrofrontendId,
  EndpointGetLatestMicrofrontendDeploymentsResBody
>(
  `/api/orgs/:customerOrgId/microfrontends/:microfrontendId/latest-deployments`,

  // Validation
  param("customerOrgId").isUUID(),
  param("microfrontendId").isUUID(),

  // Permissions
  async (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ViewAllMicrofrontendDeployments,
    });
  },

  // Implementation
  async (req, res, next) => {
    const microfrontend = await MicrofrontendModel.findByPk(
      req.params.microfrontendId
    );

    if (!microfrontend) {
      return notFound(res, `No such microfrontend`);
    }

    if (microfrontend.customerOrgId !== req.params.customerOrgId) {
      return invalidRequest(
        res,
        `Microfrontend doesn't belong to this organization`
      );
    }

    const [environments, latestDeployments] = await Promise.all([
      EnvironmentModel.findAll({
        where: {
          customerOrgId: req.params.customerOrgId,
        },
        order: [["pipelineOrder", "DESC"]],
      }),
      DeployedMicrofrontendModel.findAll({
        attributes: [
          [
            sequelize.fn("max", sequelize.col("Deployment.createdAt")),
            "deployedAt",
          ],
          [sequelize.col("Deployment.environmentId"), "environmentId"],
          [sequelize.fn("count", "*"), "deploymentCount"],
          [sequelize.col("DeployedMicrofrontends.entryUrl"), "entryUrl"],
        ],
        where: {
          microfrontendId: req.params.microfrontendId,
        },
        include: [
          {
            model: DeploymentModel,
          },
        ],
        group: [
          sequelize.col("Deployment.environmentId"),
          sequelize.col("Deployment.id"),
          sequelize.col("DeployedMicrofrontends.entryUrl"),
        ],
      }) as unknown as Model<LatestDeployment>[],
    ]);

    res.json({
      latestEnvironmentDeployments: environments.map((environment) => {
        const latestDeployment = latestDeployments.find(
          (d) => environment.id === d.getDataValue("environmentId")
        );
        return {
          environment,
          latestDeployment: latestDeployment
            ? latestDeployment.getDataValue("deployedAt")
            : null,
          deploymentCount: latestDeployment
            ? Number(latestDeployment.getDataValue("deploymentCount"))
            : 0,
          entryUrl: latestDeployment?.getDataValue("entryUrl") ?? null,
        };
      }),
    });
  }
);

export interface EndpointGetLatestMicrofrontendDeploymentsResBody {
  latestEnvironmentDeployments: LatestEnvironmentDeployment[];
}

interface LatestDeployment {
  deployedAt: Date;
  environmentId: BaseplateUUID;
  deploymentCount: number;
  entryUrl: string | null;
}

interface LatestEnvironmentDeployment {
  environment: Environment;
  latestDeployment: Date | null;
  deploymentCount: number;
  entryUrl: string | null;
}
