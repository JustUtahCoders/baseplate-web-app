import dayjs from "dayjs";
import { param } from "express-validator";
import sequelize, { Model } from "sequelize";
import { DeployedMicrofrontendModel } from "../../DB/Models/DeployedMicrofrontend/DeployedMicrofrontend";
import { DeploymentModel } from "../../DB/Models/Deployment/Deployment";
import { EnvironmentModel } from "../../DB/Models/Environment/Environment";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import {
  Microfrontend,
  MicrofrontendAuditModel,
} from "../../DB/Models/Microfrontend/Microfrontend";
import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";
import { router } from "../../Router";
import { validationResponseMiddleware } from "../../Utils/EndpointResponses";
import { RouteParamsWithMicrofrontendId } from "../../Utils/EndpointUtils";
import {
  checkPermissionsMiddleware,
  PermissionOperator,
} from "../../Utils/IAMUtils";
import {
  AuditItem,
  AuditItemKind,
  BaseplateDBAuditItem,
  DeploymentAuditItem,
} from "../Audit/AuditTypes";
import { getBaseplateCodeReleaseAuditItems } from "../Audit/GithubReleaseAudits";

router.get<
  RouteParamsWithMicrofrontendId,
  EndpointGetMicrofrontendAuditResBody
>(
  "/api/orgs/:customerOrgId/microfrontends/:microfrontendId/audits",

  // Validation
  param("customerOrgId").isUUID(),
  param("microfrontendId").isUUID(),
  validationResponseMiddleware,

  // Permissions,
  (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ViewAllMicrofrontendDeployments,
    });
  },

  // Implementation
  async (req, res, next) => {
    const [
      baseplateReleaseItems,
      microfrontendAuditResults,
      deployedMicrofrontendResults,
    ] = await Promise.all([
      getBaseplateCodeReleaseAuditItems(),
      MicrofrontendAuditModel.findAll({
        where: {
          auditItemId: req.params.microfrontendId,
        },
        order: [["auditTimestamp", "DESC"]],
      }),
      DeployedMicrofrontendModel.findAll({
        where: {
          microfrontendId: req.params.microfrontendId,
          deploymentChangedMicrofrontend: true,
        },
        order: [[sequelize.col("DeployedMicrofrontends.updatedAt"), "DESC"]],
        include: [
          {
            model: DeploymentModel,
            attributes: ["environmentId"],
            include: [
              {
                model: EnvironmentModel,
                attributes: ["name"],
              },
            ],
          },
        ],
      }),
    ]);

    const microfrontendAuditItems: BaseplateDBAuditItem<Microfrontend>[] =
      microfrontendAuditResults.map((r) => ({
        kind: AuditItemKind.baseplateDB,
        modelName: "microfrontend",
        ...r.get({ plain: true }),
      }));

    const deploymentAuditItems: DeploymentAuditItem[] =
      deployedMicrofrontendResults.map((d) => {
        // @ts-ignore
        const deployment = d.Deployment as DeploymentModel;
        // @ts-ignore
        const environment = deployment.Environment as EnvironmentModel;
        return {
          id: d.id,
          kind: AuditItemKind.deployment,
          auditTimestamp: d.updatedAt,
          deploymentId: d.deploymentId,
          environmentId: deployment.environmentId,
          environmentName: environment.name,
        };
      });

    const allItems = [
      ...baseplateReleaseItems,
      ...microfrontendAuditItems,
      ...deploymentAuditItems,
    ].sort((first, second) =>
      dayjs(first.auditTimestamp).isAfter(second.auditTimestamp) ? -1 : 1
    );

    res.json({
      auditItems: allItems,
    });
  }
);

export interface EndpointGetMicrofrontendAuditResBody {
  auditItems: AuditItem<Microfrontend>[];
}
