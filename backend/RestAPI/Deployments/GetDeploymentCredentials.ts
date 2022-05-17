import { param } from "express-validator";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { router } from "../../Router";
import {
  invalidRequest,
  notFound,
  validationResponseMiddleware,
} from "../../Utils/EndpointResponses";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";
import {
  checkPermissionsMiddleware,
  PermissionOperator,
} from "../../Utils/IAMUtils";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { CustomerOrgModel } from "../../DB/Models/CustomerOrg/CustomerOrg";
import { v4 as uuidv4 } from "uuid";
import { MicrofrontendModel } from "../../DB/Models/Microfrontend/Microfrontend";
import { EnvironmentModel } from "../../DB/Models/Environment/Environment";
import { s3BucketName } from "./S3Utils";

const stsClient = new STSClient({
  region: process.env.AWS_STS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_STS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_STS_SECRET_ACCESS_KEY!,
  },
});

router.get<RouteParams, ResBody>(
  "/api/orgs/:customerOrgId/environments/:environmentId/deployment-credentials",

  // Request validation
  param("customerOrgId").isUUID(),
  param("environmentId").isUUID(),
  validationResponseMiddleware,

  // Permissions
  async (req, res, next) => {
    const allMicrofrontends = await MicrofrontendModel.findAll({
      where: {
        customerOrgId: req.params.customerOrgId,
      },
    });

    if (allMicrofrontends.length === 0) {
      return invalidRequest(
        res,
        `Customer org must have at least one microfrontend.`
      );
    }

    checkPermissionsMiddleware(req, res, next, {
      operator: PermissionOperator.or,
      permissionList: [
        { permission: BaseplatePermission.DeployAllMicrofrontends },
        {
          operator: PermissionOperator.or,
          permissionList: allMicrofrontends.map((mfe) => ({
            permission: BaseplatePermission.DeployOneMicrofrontend,
            entityId: mfe.id,
          })),
        },
      ],
    });
  },

  // implementation
  async (req, res) => {
    const customerOrg = await CustomerOrgModel.findByPk(
      req.params.customerOrgId
    );

    const env = await EnvironmentModel.findByPk(req.params.environmentId);

    if (!env) {
      return notFound(
        res,
        `Environment ${req.params.environmentId} does not exist`
      );
    }

    if (env.customerOrgId !== req.params.customerOrgId) {
      return notFound(
        res,
        `Environment ${req.params.environmentId} does not belong to this customer org`
      );
    }

    const bucketName = s3BucketName(req.params.environmentId);

    const data = await stsClient.send(
      new AssumeRoleCommand({
        // 15 mins
        RoleArn: process.env.AWS_STS_ROLE,
        RoleSessionName: `deploy-org-${
          customerOrg?.orgKey
        }-env-${env.name.slice(0, 4)}-${uuidv4()}`,
        DurationSeconds: 15 * 60,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "VisualEditor0",
              Effect: "Allow",
              Action: ["s3:PutObject"],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        }),
      })
    );

    res.json({
      type: "aws",
      aws: {
        bucket: bucketName,
        region: process.env.AWS_STS_REGION!,
        credentials: {
          accessKeyId: data.Credentials?.AccessKeyId!,
          secretAccessKey: data.Credentials?.SecretAccessKey!,
          sessionToken: data.Credentials?.SessionToken!,
        },
      },
    });
  }
);

interface RouteParams extends RouteParamsWithCustomerOrg {
  environmentId: string;
}

interface ResBody {
  type: "aws";
  aws: {
    bucket: string;
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken: string;
    };
  };
}
