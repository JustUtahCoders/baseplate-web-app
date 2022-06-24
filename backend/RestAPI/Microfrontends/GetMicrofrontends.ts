import { param, query } from "express-validator";
import sequelize, { Op } from "sequelize";
import { DeployedMicrofrontendModel } from "../../DB/Models/DeployedMicrofrontend/DeployedMicrofrontend";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import {
  Microfrontend,
  MicrofrontendModel,
} from "../../DB/Models/Microfrontend/Microfrontend";
import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";
import { router } from "../../Router";
import { validationResponseMiddleware } from "../../Utils/EndpointResponses";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";
import { checkPermissionsMiddleware } from "../../Utils/IAMUtils";

router.get<RouteParamsWithCustomerOrg, EndpointGetMicrofrontendsResBody>(
  `/api/orgs/:customerOrgId/microfrontends`,

  // Validation
  param("customerOrgId").isUUID(),
  query("sort")
    .isIn(["deployedAt", "updatedAt"])
    .optional()
    .default("updatedAt"),
  validationResponseMiddleware,

  // Permissions
  async (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      permission: BaseplatePermission.ViewAllMicrofrontendDeployments,
    });
  },

  // Implementation
  async (req, res, next) => {
    res.json(
      await getMicrofrontendsWithDeployedAt(
        req.params.customerOrgId,
        req.query.sort as EndpointGetMicrofrontendsReqQuery["sort"]
      )
    );
  }
);

export async function getMicrofrontendsWithDeployedAt(
  customerOrgId: BaseplateUUID,
  sort: EndpointGetMicrofrontendsReqQuery["sort"]
): Promise<EndpointGetMicrofrontendsResBody> {
  const microfrontends = await MicrofrontendModel.findAll({
    where: {
      customerOrgId,
    },
  });

  const mostRecentDeployments = await DeployedMicrofrontendModel.findAll({
    attributes: [
      [sequelize.fn("max", sequelize.col("createdAt")), "createdAt"],
      "microfrontendId",
    ],
    where: {
      microfrontendId: {
        [Op.in]: microfrontends.map((m) => m.id),
      },
    },
    group: "microfrontendId",
  });

  const microfrontendsWithDeployedAt = microfrontends.map((m) => {
    const mostRecentDeployedMicrofrontend = mostRecentDeployments.find(
      (d) => d.microfrontendId === m.id
    );
    const microfrontend: MicrofrontendWithLastDeployed = {
      ...m.get({ plain: true }),
      deployedAt: mostRecentDeployedMicrofrontend
        ? mostRecentDeployedMicrofrontend.createdAt
        : null,
    };
    return microfrontend;
  });

  const sortedMicrofrontends = microfrontendsWithDeployedAt.sort(
    (first, second) => {
      if (sort === "deployedAt") {
        if (first.deployedAt && second.deployedAt) {
          return first.deployedAt > second.deployedAt ? -1 : 1;
        } else if (first.deployedAt) {
          return 1;
        } else {
          return -1;
        }
      } else {
        return first.updatedAt > second.updatedAt ? -1 : 1;
      }
    }
  );

  return { microfrontends: sortedMicrofrontends };
}

export interface EndpointGetMicrofrontendsReqQuery {
  sort: "deployedAt" | "updatedAt";
}

export type MicrofrontendWithLastDeployed = Microfrontend & {
  deployedAt: Date | null;
};

export interface EndpointGetMicrofrontendsResBody {
  microfrontends: MicrofrontendWithLastDeployed[];
}
