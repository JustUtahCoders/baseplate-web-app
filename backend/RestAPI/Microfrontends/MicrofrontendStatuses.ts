import { QueryCommand } from "@aws-sdk/client-timestream-query";
import { param } from "express-validator";
import { CustomerOrgModel } from "../../DB/Models/CustomerOrg/CustomerOrg";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { MicrofrontendModel } from "../../DB/Models/Microfrontend/Microfrontend";
import { router } from "../../Router";
import {
  invalidRequest,
  notFound,
  serverApiError,
} from "../../Utils/EndpointResponses";
import { RouteParamsWithMicrofrontendId } from "../../Utils/EndpointUtils";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";
import {
  getSingleTimestreamResult,
  timestreamClient,
} from "../../Utils/TimestreamUtils";

router.get<
  RouteParamsWithMicrofrontendId,
  EndpointGetMicrofrontendActiveResBody
>(
  `/api/orgs/:customerOrgId/microfrontends/:microfrontendId/statuses`,

  // Validation
  param("customerOrgId").isUUID(),
  param("microfrontendId").isUUID(),

  // Permissions
  async (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ViewAllMicrofrontendDeployments,
    });
  },

  // Implementation
  async (req, res, next) => {
    const [customerOrg, microfrontend] = await Promise.all([
      CustomerOrgModel.findByPk(req.params.customerOrgId),
      MicrofrontendModel.findByPk(req.params.microfrontendId),
    ]);

    if (!customerOrg) {
      // Permissions check succeeded, but customerOrg doesn't exist? That's a bug in our code
      return serverApiError(res, `Error retrieving customer org`);
    }

    if (!microfrontend) {
      return notFound(res, `No such microfrontend`);
    }

    if (microfrontend.customerOrgId !== customerOrg.id) {
      return invalidRequest(
        res,
        `Microfrontend does not belong to customer org`
      );
    }

    const timestreamResult = await timestreamClient.send(
      new QueryCommand({
        QueryString: `select microfrontendName from "cloudlare-worker-requests"."dev-web-requests" where orgKey = '${customerOrg.orgKey}' and microfrontendName = '${microfrontend.name}' and measure_name = 'httpStatus' LIMIT 1`,
      })
    );

    let resultData;
    try {
      resultData = getSingleTimestreamResult(
        timestreamResult,
        "microfrontendName"
      );
    } catch (err) {
      return serverApiError(res, err.message);
    }

    res.json({
      isActive: Boolean(resultData),
    });
  }
);

export type EndpointGetMicrofrontendActiveResBody = {
  isActive: boolean;
};
