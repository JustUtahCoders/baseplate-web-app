import { body, param } from "express-validator";
import { intersection, isUndefined } from "lodash-es";
import { BaseplatePermission } from "../../DB/Models/IAM/Permission";
import { EnvironmentModel } from "../../DB/Models/Environment/Environment";
import { router } from "../../Router";
import {
  invalidRequest,
  serverApiError,
  successNoContent,
  validationResponseMiddleware,
} from "../../Utils/EndpointResponses";
import { RouteParamsWithCustomerOrg } from "../../Utils/EndpointUtils";
import {
  checkPermissionsMiddleware,
  PermissionOperator,
} from "../../Utils/IAMUtils";
import { BaseplateUUID } from "../../DB/Models/SequelizeTSHelpers";
import { sequelize } from "../../../backend/InitDB";

router.patch<
  RouteParamsWithCustomerOrg,
  EndpointPatchEnvironmentsOrderResBody,
  EndpointPatchEnvironmentsOrderReqBody
>(
  `/api/orgs/:customerOrgId/environments/order`,

  // Validation
  param("customerOrgId").isUUID(),
  body("environmentIds").isArray().notEmpty(),
  body("environmentIds.*").isUUID().notEmpty(),
  validationResponseMiddleware,

  // Permissions,
  (req, res, next) => {
    checkPermissionsMiddleware(req, res, next, {
      operator: PermissionOperator.or,
      permissionList: [
        {
          permission: BaseplatePermission.ManageAllEnvironments,
        },
      ],
    });
  },

  async (req, res, next) => {
    const orderedEnvironmentIds = req.body.environmentIds;
    const allEnvironments = await EnvironmentModel.findAll({
      where: {
        customerOrgId: req.params.customerOrgId,
      },
      order: [["pipelineOrder", "ASC"]],
    });
    const allEnvironmentIds = allEnvironments.map(({ id }) => id);

    if (
      orderedEnvironmentIds.length !== allEnvironmentIds.length ||
      intersection(orderedEnvironmentIds, allEnvironmentIds).length !==
        allEnvironmentIds.length
    ) {
      return invalidRequest(
        res,
        "Must include all environment IDs in list to reorder"
      );
    }

    const t = await sequelize.transaction();
    try {
      const updates = allEnvironments.map((env) =>
        env.update(
          {
            pipelineOrder: orderedEnvironmentIds.findIndex(
              (id) => id === env.id
            ),
          },
          { transaction: t }
        )
      );
      await Promise.all(updates);
      await t.commit();
      return successNoContent(res);
    } catch (e) {
      await t.rollback();
      console.log("Error reordering environments");
      console.log(e);
      return serverApiError(res, "Error reordering environments");
    }
  }
);

export type EndpointPatchEnvironmentsOrderReqBody = {
  environmentIds: BaseplateUUID[];
};

export type EndpointPatchEnvironmentsOrderResBody = null;
