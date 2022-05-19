import { param } from "express-validator";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import {
  MicrofrontendAttributes,
  MicrofrontendModel,
} from "../../DB/Models/Microfrontend/Microfrontend";
import { router } from "../../Router";
import { validationResponseMiddleware } from "../../Utils/EndpointResponses";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";

router.get<RouteParamsWithCustomerOrg, EndpointGetMicrofrontendsResBody>(
  `/api/orgs/:customerOrgId/microfrontends`,

  // Validation
  param("customerOrgId").isUUID(),
  validationResponseMiddleware,

  // Permissions
  async (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ViewAllMicrofrontendDeployments,
    });
  },

  // Implementation
  async (req, res, next) => {
    const microfrontends = await MicrofrontendModel.findAll({
      where: {
        customerOrgId: req.params.customerOrgId,
      },
    });

    res.json({
      microfrontends: microfrontends.map((m) => m.get({ plain: true })),
    });
  }
);

export interface EndpointGetMicrofrontendsResBody {
  microfrontends: MicrofrontendAttributes[];
}
