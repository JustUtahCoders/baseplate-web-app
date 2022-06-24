import { param } from "express-validator";
import { CustomerOrgModel } from "../../DB/Models/CustomerOrg/CustomerOrg";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { router } from "../../Router";
import {
  serverApiError,
  validationResponseMiddleware,
} from "../../Utils/EndpointResponses";
import {
  RouteParamsWithCustomerOrg,
  RouteParamsWithMicrofrontendId,
} from "../../Utils/EndpointUtils";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";
import { QueryCommand } from "@aws-sdk/client-timestream-query";
import {
  addTimestreamMFEDownloadsResult,
  timestreamClient,
} from "../../Utils/TimestreamUtils";

router.get<
  RouteParamsWithCustomerOrg,
  EndpointGetMicrofrontendsDownloadsResBody
>(
  `/api/orgs/:customerOrgId/microfrontend-downloads`,

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
    const customerOrg = await CustomerOrgModel.findByPk(
      req.params.customerOrgId
    );

    if (!customerOrg) {
      // Permissions check succeeded, but customerOrg doesn't exist? That's a bug in our code
      return serverApiError(res, `Error retrieving customer org`);
    }
    const microfrontendDownloads = {};

    const [result24Hours, resultWeek, resultPreviousWeek] = await Promise.all([
      timestreamClient.send(
        new QueryCommand({
          QueryString: `select count(*) downloads, microfrontendName from "cloudlare-worker-requests"."dev-web-requests" where microfrontendName IS NOT NULL and measure_name = 'httpStatus' and time > ago(1d) and orgKey = '${customerOrg.orgKey}' GROUP BY microfrontendName`,
        })
      ),
      timestreamClient.send(
        new QueryCommand({
          QueryString: `select count(*) downloads, microfrontendName from "cloudlare-worker-requests"."dev-web-requests" where microfrontendName IS NOT NULL and measure_name = 'httpStatus' and time > ago(7d) and orgKey = '${customerOrg.orgKey}' GROUP BY microfrontendName`,
        })
      ),
      timestreamClient.send(
        new QueryCommand({
          QueryString: `select count(*) downloads, microfrontendName from "cloudlare-worker-requests"."dev-web-requests" where microfrontendName IS NOT NULL and measure_name = 'httpStatus' and time between ago(14d) and ago(7d) and orgKey = '${customerOrg.orgKey}' GROUP BY microfrontendName`,
        })
      ),
    ]);

    const err1 = addTimestreamMFEDownloadsResult(
      "downloadsLast24Hrs",
      result24Hours,
      microfrontendDownloads
    );
    const err2 = addTimestreamMFEDownloadsResult(
      "downloadsLast7Days",
      resultWeek,
      microfrontendDownloads
    );
    const err3 = addTimestreamMFEDownloadsResult(
      "downloads7DaysBefore",
      resultPreviousWeek,
      microfrontendDownloads
    );

    if (err1 || err2 || err3) {
      const errors: string[] = [
        err1 as string,
        err2 as string,
        err3 as string,
      ].filter(Boolean);
      return serverApiError(res, errors);
    }

    res.json({
      microfrontendDownloads,
    });
  }
);

export interface EndpointGetMicrofrontendsDownloadsResBody {
  microfrontendDownloads: {
    [microfrontendName: string]: MicrofrontendDownloads;
  };
}
export interface MicrofrontendDownloads {
  downloadsLast24Hrs: number | null;
  downloadsLast7Days: number | null;
  downloads7DaysBefore: number | null;
}
