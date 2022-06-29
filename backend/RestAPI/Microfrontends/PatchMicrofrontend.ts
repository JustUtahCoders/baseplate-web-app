import { body, param } from "express-validator";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import {
  Microfrontend,
  MicrofrontendCreationAttributes,
  MicrofrontendModel,
} from "../../DB/Models/Microfrontend/Microfrontend";
import { router } from "../../Router";
import {
  invalidRequest,
  validationResponseMiddleware,
} from "../../Utils/EndpointResponses";
import { RouteParamsWithMicrofrontendId } from "../../Utils/EndpointUtils";
import {
  checkPermissionsMiddleware,
  PermissionOperator,
} from "../../Utils/IAMUtils";

router.patch<
  RouteParamsWithMicrofrontendId,
  EndpointPatchMicrofrontendResBody,
  EndpointPatchMicrofrontendReqBody
>(
  `/api/orgs/:customerOrgId/microfrontends/:microfrontendId`,

  // Validation
  param("customerOrgId").isUUID(),
  param("microfrontendId").isUUID(),
  body("name").isString().notEmpty().optional(),
  body("scope").isString().notEmpty().optional({ nullable: true }),
  body("alias1").isString().notEmpty().optional({ nullable: true }),
  body("alias2").isString().notEmpty().optional({ nullable: true }),
  body("alias3").isString().notEmpty().optional({ nullable: true }),
  body("useCustomerOrgKeyAsScope").isBoolean().optional(),
  validationResponseMiddleware,

  // Permissions,
  (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      operator: PermissionOperator.or,
      permissionList: [
        {
          permission: BaseplatePermission.ManageOneMicrofrontendSettings,
          entityId: req.params.microfrontendId,
        },
        {
          permission: BaseplatePermission.ManageAllMicrofrontendSettings,
        },
      ],
    });
  },

  // Implementation
  async (req, res, next) => {
    const microfrontend = await MicrofrontendModel.findByPk(
      req.params.microfrontendId
    );

    if (!microfrontend) {
      return invalidRequest(res, `No such microfrontend`);
    }

    if (microfrontend.customerOrgId !== req.params.customerOrgId) {
      return invalidRequest(
        res,
        `Microfrontend does not belong to org ${req.params.customerOrgId}`
      );
    }

    const shouldHaveCustomScope =
      req.body.useCustomerOrgKeyAsScope === false ||
      (!req.body.hasOwnProperty("useCustomerOrgKeyAsScope") &&
        !microfrontend.useCustomerOrgKeyAsScope);

    if (req.body.scope && !shouldHaveCustomScope) {
      return invalidRequest(
        res,
        `scope may not be set unless useCustomerOrgKeyAsScope is set to true`
      );
    }

    if (
      req.body.useCustomerOrgKeyAsScope === false &&
      !req.body.scope &&
      !microfrontend.scope
    ) {
      return invalidRequest(
        res,
        `When useCustomerOrgKeyAsScope is set to false, scope must be set to a string`
      );
    }

    const patch: Partial<MicrofrontendCreationAttributes> = {
      name: req.body.name,
      scope: req.body.scope,
      useCustomerOrgKeyAsScope: req.body.useCustomerOrgKeyAsScope,
      alias1: req.body.alias1,
      alias2: req.body.alias2,
      alias3: req.body.alias3,
    };

    for (let key in patch) {
      if (!req.body.hasOwnProperty(key)) {
        delete patch[key];
      }
    }

    const updatedMicrofrontend = await microfrontend.update(patch);

    return res.json(updatedMicrofrontend.get({ plain: true }));
  }
);

export type EndpointPatchMicrofrontendReqBody =
  Partial<MicrofrontendCreationAttributes>;

export type EndpointPatchMicrofrontendResBody = Microfrontend;
