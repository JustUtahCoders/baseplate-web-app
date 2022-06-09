import {
  Model,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
} from "sequelize";
import { modelEvents } from "../../../InitDB";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import { UserModel } from "./User";
import { currentSchema } from "./UserPreferencesSchema.js";

export class UserPreferencesModel
  extends Model<UserPreferencesAttributes, UserPreferencesCreationAttributes>
  implements
    UserPreferencesAttributes,
    DefaultModelAttrs,
    BelongsToMethods<{ user: UserModel }>
{
  declare id: BaseplateUUID;
  declare userId: BaseplateUUID;
  declare mostRecentCustomerOrgId?: BaseplateUUID;

  declare auditAccountId: BaseplateUUID;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getUser: BelongsToGetAssociationMixin<UserModel>;
  declare setUser: BelongsToSetAssociationMixin<UserModel, number>;
  declare createUser: BelongsToCreateAssociationMixin<UserModel>;
}

export interface UserPreferencesAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  userId: BaseplateUUID;
  mostRecentCustomerOrgId?: BaseplateUUID;
}

export type UserPreferencesCreationAttributes = Omit<
  UserPreferencesAttributes,
  "id"
>;

export type UserPreferences = UserPreferencesAttributes & DefaultModelAttrs;

export class UserPreferencesAuditModel extends AuditModel<UserPreferencesAttributes> {}

const modelName = "UserPreferences";

initAuditModel(UserPreferencesAuditModel, UserPreferencesModel, modelName);

modelEvents.once("init", (sequelize) => {
  UserPreferencesModel.init(currentSchema, {
    sequelize,
    modelName,
  });
});

modelEvents.once("associate", (sequelize) => {
  UserPreferencesModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "userId",
  });
});
