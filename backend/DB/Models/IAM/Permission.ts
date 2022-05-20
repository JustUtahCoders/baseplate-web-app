import { Model } from "sequelize";
import { modelEvents } from "../../../InitDB";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { BaseplateUUID } from "../SequelizeTSHelpers";
import { currentSchema } from "./PermissionSchema";
import { RoleModel } from "./Role";

export class PermissionModel
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes, DefaultModelAttrs
{
  declare id: BaseplateUUID;
  declare name: BaseplatePermission;
  declare humanReadableName: string;
  declare description: string;
  declare requiresEntityId: boolean;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export interface PermissionAttributes {
  id: BaseplateUUID;
  name: BaseplatePermission;
  humanReadableName: string;
  description: string;
  requiresEntityId: boolean;
}

export type PermissionCreationAttributes = Omit<PermissionAttributes, "id">;

export type Permission = PermissionAttributes & DefaultModelAttrs;

export enum BaseplatePermission {
  ViewCustomerOrgSettings = "customerOrgs.settings.view",
  ManageCustomerOrgSettings = "customerOrgs.settings.manage",
  ViewCustomerOrgBilling = "customerOrgs.billing.view",
  ViewCustomerOrgUsers = "customerOrgs.users.view",
  ManageCustomerOrgUsers = "customerOrgs.users.manage",
  ManageCustomerOrgOwner = "customerOrgs.owner.manage",
  ManageAllMicrofrontendOwners = "allMicrofrontends.owner.manage",
  DeployAllMicrofrontends = "allMicrofrontends.deployments.trigger",
  ViewAllMicrofrontendDeployments = "allMicrofrontends.deployments.view",
  ViewAllMicrofrontendUsers = "allMicrofrontends.users.view",
  ManageAllMicrofrontendUsers = "allMicrofrontends.users.manage",
  CreateMicrofrontend = "allMicrofrontends.create",
  ManageAllMicrofrontendSettings = "allMicrofrontends.settings.manage",
  ManageOneMicrofrontendOwner = "microfrontend.owner.manage",
  DeployOneMicrofrontend = "microfrontend.deployments.trigger",
  ManageOneMicrofrontendUsers = "microfrontend.users.manage",
  ManageOneMicrofrontendSettings = "microfrontend.settings.manage",
  ViewAllEnvironments = "allEnvironments.view",
  ManageAllEnvironments = "allEnvironments.manage",
}

modelEvents.once("init", (sequelize) => {
  PermissionModel.init(currentSchema, {
    sequelize,
    modelName: "Permission",
  });
});

modelEvents.once("associate", () => {
  PermissionModel.belongsToMany(RoleModel, {
    through: "RolePermissions",
    as: "roles",
    foreignKey: "permissionId",
  });
});
