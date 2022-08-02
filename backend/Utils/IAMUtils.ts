import { NextFunction, Request, Response } from "express";
import { AuthTokenModel } from "../DB/Models/AuthToken/AuthToken";
import { CustomerOrgModel } from "../DB/Models/CustomerOrg/CustomerOrg";
import { AccountPermissionModel } from "../DB/Models/IAM/AccountPermission";
import {
  BaseplatePermission,
  PermissionModel,
} from "../DB/Models/IAM/Permission";
import {
  BaseplateUUID,
  ModelWithIncludes,
} from "../DB/Models/SequelizeTSHelpers";
import { UserModel } from "../DB/Models/User/User";
import { UserPreferencesAttributes } from "../DB/Models/User/UserPreferences";
import { notAuthorized, notFound } from "./EndpointResponses";

export function findMissingPermissions(
  accountPermissions: ModelWithIncludes<
    AccountPermissionModel,
    { permission: PermissionModel }
  >[],
  customerOrgId: BaseplateUUID,
  requiredPermissions: RequiredPermissions
): string[] {
  const missingPermissions: string[] = [];

  recurseRequiredPermissions(requiredPermissions, missingPermissions);

  return missingPermissions;

  function recurseRequiredPermissions(
    thisPermission: RequiredPermissions,
    missingPermissions: string[]
  ): void {
    if (isSimplePermission(thisPermission)) {
      const p = thisPermission as SimpleRequiredPermission;
      const hasPermission = accountPermissions.some((accountP) => {
        const permissionNameMatches = p.permission === accountP.permission.name;
        const customerOrgMatches = accountP.customerOrgId === customerOrgId;
        const entityIdMatches =
          !accountP.permission.requiresEntityId ||
          accountP.entityId === p.entityId;
        const isRevoked = accountP.dateRevoked
          ? accountP.dateRevoked < new Date()
          : false;

        return (
          permissionNameMatches &&
          customerOrgMatches &&
          entityIdMatches &&
          !isRevoked
        );
      });

      if (!hasPermission) {
        missingPermissions.push(`Missing permission ${p.permission}`);
      }
    } else {
      const p = thisPermission as CompoundRequiredPermission;
      if (p.operator === PermissionOperator.and) {
        p.permissionList.forEach((childPermission) => {
          recurseRequiredPermissions(childPermission, missingPermissions);
        });
      } else if (p.operator === PermissionOperator.or) {
        const atLeastOnePermission = p.permissionList.some(
          (childPermission) => {
            const childMissingPermissions: string[] = [];
            recurseRequiredPermissions(
              childPermission,
              childMissingPermissions
            );
            return childMissingPermissions.length === 0;
          }
        );

        if (!atLeastOnePermission) {
          missingPermissions.push(
            `Missing one of the following permissions: ${p.permissionList
              .map((per) =>
                isSimplePermission(per)
                  ? (per as SimpleRequiredPermission).permission
                  : "[compound permission]"
              )
              .join(", ")}`
          );
        }
      } else {
        throw Error(`Unknown PermissionOperator '${p.operator}'`);
      }
    }
  }
}

export async function checkPermissionsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  requiredPermissions: RequiredPermissions
) {
  const customerOrgId: string = req.params.customerOrgId!;
  const customerOrg = await CustomerOrgModel.findByPk(customerOrgId);

  if (!customerOrg) {
    return notFound(res, `No such organization with id ${customerOrgId}`);
  }

  if (!customerOrg.accountEnabled && !["GET", "HEAD"].includes(req.method)) {
    return notAuthorized(res, [`Organization's account is disabled`]);
  }

  const missingPermissions = findMissingPermissions(
    req.baseplateAccount.accountPermissions,
    customerOrgId,
    requiredPermissions
  );

  if (missingPermissions.length > 0) {
    notAuthorized(res, missingPermissions);
  } else {
    next();
  }
}

function isSimplePermission(requiredPermission: RequiredPermissions) {
  return Boolean((requiredPermission as SimpleRequiredPermission)?.permission);
}

export interface BaseplateAccount {
  accountId: string;
  isUser: boolean;
  isServiceAccount: boolean;
  accountPermissions: ModelWithIncludes<
    AccountPermissionModel,
    { permission: PermissionModel }
  >[];
  userPreferences?: UserPreferencesAttributes;
  user?: UserModel;
  serviceAccount?: AuthTokenModel;
}

export type RequiredPermissions =
  | SimpleRequiredPermission
  | CompoundRequiredPermission;

export interface SimpleRequiredPermission {
  permission: BaseplatePermission;
  entityId?: BaseplateUUID;
}

export interface CompoundRequiredPermission {
  permissionList: (SimpleRequiredPermission | RequiredPermissions)[];
  operator: PermissionOperator;
}

export enum PermissionOperator {
  or = "or",
  and = "and",
}
