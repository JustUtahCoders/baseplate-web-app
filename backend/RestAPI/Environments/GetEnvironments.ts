import { param } from "express-validator";
import {
  Environment,
  EnvironmentAttributes,
  EnvironmentModel,
} from "../../DB/Models/Environment/Environment";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
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
  async (req, res) => {
    const environments = await EnvironmentModel.findAll({
      where: {
        customerOrgId: req.params.customerOrgId,
      },
    });

    res.json({
      environments: environments.map((env) => env.get({ plain: true })),
    });
  }
);

export interface EndpointGetEnvironmentsResBody {
  environments: EnvironmentAttributes[];
}
