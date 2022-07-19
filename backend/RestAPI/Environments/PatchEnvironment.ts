import { body, param } from "express-validator";
import { isString, isUndefined } from "lodash-es";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import {
  Environment,
  EnvironmentCreationAttributes,
  EnvironmentModel,
} from "../../DB/Models/Environment/Environment";
import { router } from "../../Router";
import {
  invalidRequest,
  validationResponseMiddleware,
} from "../../Utils/EndpointResponses";
import { RouteParamsWithEnvironmentId } from "../../Utils/EndpointUtils";
import {
  checkPermissionsMiddleware,
  PermissionOperator,
} from "../../Utils/IAMUtils";

router.patch<
  RouteParamsWithEnvironmentId,
  EndpointPatchEnvironmentResBody,
  EndpointPatchEnvironmentReqBody
>(
  `/api/orgs/:customerOrgId/environments/:environmentId`,

  // Validation
  param("customerOrgId").isUUID(),
  param("environmentId").isUUID(),
  body("name").isString().notEmpty().optional(),
  body("isProd").isBoolean().optional(),
  body("useBaseplateStaticWebHosting").isBoolean().optional(),
  body("staticWebProxyHost").isString().notEmpty().optional(),
  body("pipelineOrder").isNumeric().optional(),
  validationResponseMiddleware,

  // Permissions,
  (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      operator: PermissionOperator.or,
      permissionList: [
        {
          permission: BaseplatePermission.ManageAllEnvironments,
        },
      ],
    });
  },

  async (req, res, next) => {
    const environment = await EnvironmentModel.findByPk(
      req.params.environmentId
    );

    if (!environment) {
      return invalidRequest(res, `No such environment`);
    }

    if (environment.customerOrgId !== req.params.customerOrgId) {
      return invalidRequest(
        res,
        `Environment does not belong to org ${req.params.customerOrgId}`
      );
    }

    const isUsingBaseplateStaticWebHosting =
      req.body.useBaseplateStaticWebHosting ||
      (isUndefined(req.body.useBaseplateStaticWebHosting) &&
        environment.useBaseplateStaticWebHosting);
    const isModifyingStaticWebProxyHost =
      !isUndefined(req.body.staticWebProxyHost) &&
      req.body.staticWebProxyHost !== environment.staticWebProxyHost;

    if (isModifyingStaticWebProxyHost && isUsingBaseplateStaticWebHosting) {
      return invalidRequest(
        res,
        `staticWebProxyHost may not be modified unless useBaseplateStaticWebHosting is false`
      );
    }

    const patch: Partial<EnvironmentCreationAttributes> = {
      name: req.body.name,
      isProd: req.body.isProd,
      useBaseplateStaticWebHosting: req.body.useBaseplateStaticWebHosting,
      staticWebProxyHost: req.body.staticWebProxyHost,
      pipelineOrder: req.body.pipelineOrder,
    };

    for (let key in patch) {
      if (!req.body.hasOwnProperty(key)) {
        delete patch[key];
      }
    }

    const updatedEnvironment = await environment.update(patch);

    return res.json(updatedEnvironment.get({ plain: true }));
  }
);

export type EndpointPatchEnvironmentReqBody =
  Partial<EnvironmentCreationAttributes>;

export type EndpointPatchEnvironmentResBody = Environment;
