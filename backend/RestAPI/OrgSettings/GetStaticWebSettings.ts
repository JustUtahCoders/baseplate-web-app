import { router } from "../../Router";
import { OrgSettings, StaticFileProxySettings } from "@baseplate-sdk/utils";
import { param } from "express-validator";
import {
  serverApiError,
  validationResponseMiddleware,
} from "../../Utils/EndpointResponses";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { EnvironmentModel } from "../../DB/Models/Environment/Environment";
import { StaticWebSettingsModel } from "../../DB/Models/CustomerOrg/StaticWebSettings";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";

router.get<RouteParamsWithCustomerOrg, EndpointGetStaticWebSettingsResBody>(
  "/api/orgs/:customerOrgId/static-web-settings",

  // Request validation
  param("customerOrgId").isUUID(),
  validationResponseMiddleware,

  // Permissions
  (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ViewCustomerOrgSettings,
    });
  },

  // Implementation
  async (req, res) => {
    const { customerOrgId } = req.params;

    const [environments, staticWebSettings] = await Promise.all([
      EnvironmentModel.findAll({
        where: {
          customerOrgId,
        },
      }),
      StaticWebSettingsModel.findOne({
        where: {
          customerOrgId,
        },
      }),
    ]);

    if (!staticWebSettings) {
      return serverApiError(
        res,
        `Unable to find StaticWebSettings for organization`
      );
    }

    const environmentSettings: { [key: string]: StaticFileProxySettings } = {};

    environments.forEach((env) => {
      environmentSettings[env.name] = {
        environmentId: env.id,
        host: env.staticWebProxyHost,
        useBaseplateHosting: env.useBaseplateStaticWebHosting,
      };
    });

    res.json({
      cors: {
        allowCredentials: staticWebSettings.corsAllowCredentials,
        allowHeaders: staticWebSettings.corsAllowHeaders,
        allowMethods: staticWebSettings.corsAllowMethods,
        allowOrigins: staticWebSettings.corsAllowOrigins,
        exposeHeaders: staticWebSettings.corsExposeHeaders,
        maxAge: staticWebSettings.corsMaxAge,
      },
      importMapCacheControl: staticWebSettings.importMapCacheControl,
      orgExists: true,
      staticFiles: {
        cacheControl: staticWebSettings.defaultCacheControl,
        microfrontendProxy: {
          environments: environmentSettings,
        },
      },
    });
  }
);

export type EndpointGetStaticWebSettingsResBody = RecursivePartial<OrgSettings>;

declare type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};
