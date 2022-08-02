import { body, param } from "express-validator";
import { isNull, isUndefined } from "lodash-es";
import {
  CustomerOrg,
  CustomerOrgModel,
} from "../../DB/Models/CustomerOrg/CustomerOrg";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { router } from "../../Router";
import { validationResponseMiddleware } from "../../Utils/EndpointResponses";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";

router.patch<
  RouteParamsWithCustomerOrg,
  EndpointPatchCustomerOrgResBody,
  EndpointPatchCustomerOrgReqBody
>(
  `/api/orgs/:customerOrgId`,

  // Validation
  param("customerOrgId").isUUID(),
  body("name").isString().notEmpty().optional(),
  body("orgKey").isString().notEmpty().optional(),
  validationResponseMiddleware,

  // Permissions
  (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ManageCustomerOrgSettings,
    });
  },

  // Implementation
  async (req, res, next) => {
    const customerOrg = await CustomerOrgModel.findByPk(
      req.params.customerOrgId
    );

    const patch: Partial<CustomerOrg> = {};

    for (let key in req.body) {
      if (!isNull(req.body[key]) && !isUndefined(req.body[key])) {
        patch[key] = req.body[key];
      }
    }

    const updatedCustomerOrg = await customerOrg!.update(patch);

    res.json(updatedCustomerOrg.toJSON());
  }
);

export type EndpointPatchCustomerOrgReqBody = Partial<{
  name: string;
  orgKey: string;
}>;

export type EndpointPatchCustomerOrgResBody = CustomerOrg;
