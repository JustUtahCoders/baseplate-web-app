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
import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";

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

    const result = await getAllStaticWebSettings(customerOrgId);

    if (result.success) {
      res.json(result.data);
    } else {
      serverApiError(res, result.message);
    }
  }
);

export async function getAllStaticWebSettings(
  customerOrgId: BaseplateUUID
): Promise<Result<EndpointGetStaticWebSettingsResBody>> {
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
    return {
      success: false,
      message: `Unable to find StaticWebSettings for organization`,
    };
  }

  const environmentSettings: { [key: string]: StaticFileProxySettings } = {};

  environments.forEach((env) => {
    environmentSettings[env.name] = {
      environmentId: env.id,
      host: env.staticWebProxyHost,
      useBaseplateHosting: env.useBaseplateStaticWebHosting,
    };
  });

  return {
    success: true,
    data: {
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
    },
  };
}

type Result<Data> = Ok<Data> | Failure;

interface Ok<Data> {
  success: true;
  data: Data;
}

interface Failure {
  success: false;
  message: string;
}

export type EndpointGetStaticWebSettingsResBody = RecursivePartial<OrgSettings>;

declare type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};
