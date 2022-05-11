import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";
import { router } from "../../Router";
import { OrgSettings, StaticFileProxySettings } from "@baseplate-sdk/utils";
import { param } from "express-validator";
import { validationResponseMiddleware } from "../../Utils/EndpointResponses";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { EnvironmentModel } from "../../DB/Models/Environment/Environment";
import { StaticWebSettingsModel } from "../../DB/Models/CustomerOrg/StaticWebSettings";

router.get<RouteParams, ResBody>(
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

    const environmentSettings: { [key: string]: StaticFileProxySettings } = {};

    environments.forEach((env) => {
      environmentSettings[env.name] = {
        host: env.staticWebProxyHost,
        useBaseplateHosting: env.useBaseplateStaticWebHosting,
      };
    });

    const result: OrgSettings = {
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
    };

    res.json(result);
  }
);

interface RouteParams {
  customerOrgId: BaseplateUUID;
  [key: string]: any;
}

type ResBody = OrgSettings;
