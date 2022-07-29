import { OrgSettings } from "@baseplate-sdk/utils";
import { body, param } from "express-validator";
import { isInteger } from "lodash-es";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import {
  StaticWebSettings,
  StaticWebSettingsModel,
} from "../../DB/Models/CustomerOrg/StaticWebSettings";
import { router } from "../../Router";
import {
  validationResponseMiddleware,
  serverApiError,
} from "../../Utils/EndpointResponses";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";
import {
  EndpointGetStaticWebSettingsResBody,
  getAllStaticWebSettings,
} from "./GetStaticWebSettings";

router.patch<
  RouteParamsWithCustomerOrg,
  EndpointPatchStaticWebSettingsResBody,
  EndpointPatchStaticWebSettingsReqBody
>(
  `/api/orgs/:customerOrgId/static-web-settings`,

  // Request validation
  param("customerOrgId").isUUID(),
  body("importMapCacheControl").isString().notEmpty().optional(),
  body("staticFiles.cacheControl").isString().notEmpty().optional(),
  body("cors.allowOrigins").isArray().optional(),
  body("cors.allowOrigins.*").isString().notEmpty(),
  body("cors.exposeHeaders").isArray().optional(),
  body("cors.exposeHeaders.*").isString().notEmpty(),
  body("cors.maxAge")
    .isInt()
    .custom((val) => {
      if (!isInteger(val) || val < 0) {
        throw Error(`Must be positive integer`);
      }

      return true;
    })
    .optional(),
  body("cors.allowMethods").isArray().optional(),
  body("cors.allowMethods.*").isString().notEmpty(),
  body("cors.allowHeaders").isArray().optional(),
  body("cors.allowHeaders.*").isString().notEmpty(),
  validationResponseMiddleware,

  // Permissions
  (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ManageCustomerOrgSettings,
    });
  },

  // Implementation
  async (req, res) => {
    const staticWebSettings = await StaticWebSettingsModel.findOne({
      where: {
        customerOrgId: req.params.customerOrgId,
      },
    });

    if (!staticWebSettings) {
      return serverApiError(
        res,
        `Could not find static web settings for organization ${req.params.customerOrgId}`
      );
    }

    const patch: Partial<StaticWebSettings> = {};

    if (req.body.importMapCacheControl) {
      patch.importMapCacheControl = req.body.importMapCacheControl;
    }

    if (req.body.cors) {
      const cors = req.body.cors;
      if (cors.allowCredentials) {
        patch.corsAllowCredentials = cors.allowCredentials;
      }

      if (cors.allowHeaders) {
        patch.corsAllowHeaders = cors.allowHeaders;
      }

      if (cors.allowMethods) {
        patch.corsAllowMethods = cors.allowMethods;
      }

      if (cors.allowOrigins) {
        patch.corsAllowOrigins = cors.allowOrigins;
      }

      if (cors.exposeHeaders) {
        patch.corsExposeHeaders = cors.exposeHeaders;
      }

      if (isInteger(cors.maxAge)) {
        patch.corsMaxAge = cors.maxAge;
      }
    }

    if (req.body.staticFiles?.cacheControl) {
      patch.defaultCacheControl = req.body.staticFiles.cacheControl;
    }

    if (req.body.importMapCacheControl) {
      patch.importMapCacheControl = req.body.importMapCacheControl;
    }

    await staticWebSettings.update(patch);

    const result = await getAllStaticWebSettings(req.params.customerOrgId);

    if (result.success) {
      res.json(result.data);
    } else {
      return serverApiError(
        res,
        "Failed to retrieve static web settings after updating them"
      );
    }
  }
);

export type EndpointPatchStaticWebSettingsReqBody = Omit<
  Omit<RecursivePartial<OrgSettings>, "staticFiles.microfrontendProxy">,
  "orgExists"
>;

export type EndpointPatchStaticWebSettingsResBody =
  EndpointGetStaticWebSettingsResBody;

declare type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};
