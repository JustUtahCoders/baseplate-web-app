import { param } from "express-validator";
import { CustomerOrgModel } from "../../DB/Models/CustomerOrg/CustomerOrg";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { router } from "../../Router";
import {
  serverApiError,
  validationResponseMiddleware,
} from "../../Utils/EndpointResponses";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";
import {
  TimestreamQueryClient,
  QueryCommand,
  QueryCommandOutput,
} from "@aws-sdk/client-timestream-query";

const client = new TimestreamQueryClient({
  region: "us-east-1",
});

router.get<
  RouteParamsWithCustomerOrg,
  EndpointGetMicrofrontendsDownloadsResBody
>(
  `/api/orgs/:customerOrgId/microfrontends-downloads`,

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
      client.send(
        new QueryCommand({
          QueryString: `select count(*) downloads, microfrontendName from "cloudlare-worker-requests"."dev-web-requests" where microfrontendName IS NOT NULL and measure_name = 'httpStatus' and time > ago(1d) and orgKey = '${customerOrg.orgKey}' GROUP BY microfrontendName`,
        })
      ),
      client.send(
        new QueryCommand({
          QueryString: `select count(*) downloads, microfrontendName from "cloudlare-worker-requests"."dev-web-requests" where microfrontendName IS NOT NULL and measure_name = 'httpStatus' and time > ago(7d) and orgKey = '${customerOrg.orgKey}' GROUP BY microfrontendName`,
        })
      ),
      client.send(
        new QueryCommand({
          QueryString: `select count(*) downloads, microfrontendName from "cloudlare-worker-requests"."dev-web-requests" where microfrontendName IS NOT NULL and measure_name = 'httpStatus' and time between ago(14d) and ago(7d) and orgKey = '${customerOrg.orgKey}' GROUP BY microfrontendName`,
        })
      ),
    ]);

    addTimestreamResult(
      "downloadsLast24Hrs",
      result24Hours,
      microfrontendDownloads
    );
    addTimestreamResult(
      "downloadsLast7Days",
      resultWeek,
      microfrontendDownloads
    );
    addTimestreamResult(
      "downloads7DaysBefore",
      resultPreviousWeek,
      microfrontendDownloads
    );

    res.json({
      microfrontendDownloads,
    });
  }
);

function addTimestreamResult(
  metricName: string,
  result: QueryCommandOutput,
  microfrontendDownloads: EndpointGetMicrofrontendsDownloadsResBody["microfrontendDownloads"]
): string | void {
  if (!result.ColumnInfo || !result.Rows) {
    return `Invalid response from Timestream for ${metricName} - no ColumnInfo or Rows`;
  }

  const microfrontendNameIndex = result.ColumnInfo.findIndex(
    (c) => c.Name === "microfrontendName"
  );
  const downloadsIndex = result.ColumnInfo.findIndex(
    (c) => c.Name === "downloads"
  );

  if (isNaN(microfrontendNameIndex) || isNaN(downloadsIndex)) {
    return `Invalid response from Timestream for ${metricName} - invalid column indices`;
  }

  result.Rows.reduce((acc, row) => {
    const microfrontendName =
      row.Data && row.Data[microfrontendNameIndex].ScalarValue;
    const downloads = row.Data && Number(row.Data[downloadsIndex].ScalarValue);

    if (microfrontendName) {
      if (!acc[microfrontendName]) {
        acc[microfrontendName] = {
          downloadsLast24Hrs: null,
          downloadsLast7Days: null,
          downloads7DaysBefore: null,
        };
      }

      acc[microfrontendName][metricName] = downloads || null;
    }

    return acc;
  }, microfrontendDownloads);
}

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
