import { param } from "express-validator";
import sequelize, { Op } from "sequelize";
import { DeploymentModel } from "../../DB/Models/Deployment/Deployment";
import {
  Environment,
  EnvironmentModel,
} from "../../DB/Models/Environment/Environment";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";
import { router } from "../../Router";
import { validationResponseMiddleware } from "../../Utils/EndpointResponses";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";

router.get<RouteParamsWithCustomerOrg, EndpointGetEnvironmentsResBody>(
  `/api/orgs/:customerOrgId/environments`,

  // Validation
  param("customerOrgId").isUUID(),
  validationResponseMiddleware,

  // Permissions
  async (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ViewAllEnvironments,
    });
  },

  // Implementation
  async (req, res, next) => {
    res.json(await getEnvironmentsWithDeployedAt(req.params.customerOrgId));
  }
);

export async function getEnvironmentsWithDeployedAt(
  customerOrgId: BaseplateUUID
): Promise<EndpointGetEnvironmentsResBody> {
  const [environments, mostRecentDeployments] = await Promise.all([
    EnvironmentModel.findAll({
      where: {
        customerOrgId,
      },
      order: [["pipelineOrder", "ASC"]],
    }),
    DeploymentModel.findAll({
      attributes: [
        [sequelize.fn("max", sequelize.col("createdAt")), "createdAt"],
        "environmentId",
      ],
      where: {
        customerOrgId,
      },
      group: "environmentId",
    }),
  ]);

  const environmentsWithDeployedAt = environments.map((m) => {
    const mostRecentDeployedEnvironment = mostRecentDeployments.find(
      (d) => d.environmentId === m.id
    );
    const environment: EnvironmentWithLastDeployed = {
      ...m.get({ plain: true }),
      deployedAt: mostRecentDeployedEnvironment
        ? mostRecentDeployedEnvironment.createdAt
        : null,
    };
    return environment;
  });

  return { environments: environmentsWithDeployedAt };
}

export interface EndpointGetEnvironmentsResBody {
  environments: Environment[];
}

export type EnvironmentWithLastDeployed = Environment & {
  deployedAt: Date | null;
};
