import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import { UserModel } from "../User/User";
import { EnvironmentModel } from "../Environment/Environment";
import {
  BelongsToMethods,
  BelongsToManyMethods,
  HasManyMethods,
  BaseplateUUID,
  HasOneMethods,
} from "../SequelizeTSHelpers";
import {
  Model,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasOneCreateAssociationMixin,
  HasOneSetAssociationMixin,
  HasOneGetAssociationMixin,
} from "sequelize";
import { initialSchema } from "./CustomerOrgSchema";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";
import { StaticWebSettingsModel } from "./StaticWebSettings";

export class CustomerOrgModel
  extends Model<CustomerOrgAttributes, CustomerOrgCreationAttributes>
  implements
    CustomerOrgAttributes,
    BelongsToMethods<{ billingUser: UserModel }>,
    BelongsToManyMethods<{ user: UserModel }>,
    HasManyMethods<{ environment: EnvironmentModel }>,
    HasOneMethods<{ staticWebSettings: StaticWebSettingsModel }>
{
  declare id: BaseplateUUID;
  declare name: string;
  declare accountEnabled: boolean;
  declare billingUserId: BaseplateUUID;
  declare orgKey: string;
  declare auditAccountId: BaseplateUUID;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getBillingUser: BelongsToGetAssociationMixin<UserModel>;
  declare setBillingUser: BelongsToSetAssociationMixin<UserModel, number>;
  declare createBillingUser: BelongsToCreateAssociationMixin<UserModel>;

  declare getUsers: BelongsToManyGetAssociationsMixin<UserModel>;
  declare countUsers: BelongsToManyCountAssociationsMixin;
  declare hasUser: BelongsToManyHasAssociationMixin<UserModel, number>;
  declare hasUsers: BelongsToManyHasAssociationsMixin<UserModel, number>;
  declare setUsers: BelongsToManySetAssociationsMixin<UserModel, number>;
  declare addUser: BelongsToManyAddAssociationMixin<UserModel, number>;
  declare addUsers: BelongsToManyAddAssociationsMixin<UserModel, number>;
  declare removeUser: BelongsToManyRemoveAssociationMixin<UserModel, number>;
  declare removeUsers: BelongsToManyRemoveAssociationsMixin<UserModel, number>;
  declare createUser: BelongsToManyCreateAssociationMixin<UserModel>;

  declare getEnvironments: HasManyGetAssociationsMixin<EnvironmentModel>;
  declare countEnvironments: HasManyCountAssociationsMixin;
  declare hasEnvironment: HasManyHasAssociationMixin<EnvironmentModel, number>;
  declare hasEnvironments: HasManyHasAssociationsMixin<
    EnvironmentModel,
    number
  >;
  declare setEnvironments: HasManySetAssociationsMixin<
    EnvironmentModel,
    number
  >;
  declare addEnvironment: HasManyAddAssociationMixin<EnvironmentModel, number>;
  declare addEnvironments: HasManyAddAssociationsMixin<
    EnvironmentModel,
    number
  >;
  declare removeEnvironment: HasManyRemoveAssociationMixin<
    EnvironmentModel,
    number
  >;
  declare removeEnvironments: HasManyRemoveAssociationsMixin<
    EnvironmentModel,
    number
  >;
  declare createEnvironment: HasManyCreateAssociationMixin<EnvironmentModel>;

  declare getStaticWebSettings: HasOneGetAssociationMixin<StaticWebSettingsModel>;
  declare setStaticWebSettings: HasOneSetAssociationMixin<
    StaticWebSettingsModel,
    number
  >;
  declare createStaticWebSettings: HasOneCreateAssociationMixin<StaticWebSettingsModel>;
}

export interface CustomerOrgAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  name: BaseplateUUID;
  accountEnabled: boolean;
  billingUserId: BaseplateUUID;
  orgKey: string;
}

export type CustomerOrgCreationAttributes = Omit<CustomerOrgAttributes, "id">;

export type CustomerOrg = CustomerOrgAttributes & DefaultModelAttrs;

export class CustomerOrgAuditModel extends AuditModel<CustomerOrgAttributes> {}

const modelName = "CustomerOrg";

initAuditModel(CustomerOrgAuditModel, CustomerOrgModel, modelName);

modelEvents.once("init", (sequelize) => {
  CustomerOrgModel.init(initialSchema, {
    sequelize,
    modelName,
  });

  CustomerOrgModel.addHook("afterUpsert", async (upsert, options) => {
    const customerOrg = upsert[0] as CustomerOrgModel;
    const { updateCustomerOrgCloudflareSettings } = await import(
      "../CustomerOrgCloudflareSettings"
    );
    await updateCustomerOrgCloudflareSettings(customerOrg);
  });
});

modelEvents.once("associate", (sequelize) => {
  CustomerOrgModel.belongsTo(UserModel, {
    foreignKey: {
      name: "billingUserId",
      allowNull: false,
    },
    as: "billingUser",
  });

  CustomerOrgModel.belongsToMany(UserModel, {
    through: "UserCustomerOrgs",
    foreignKey: "customerOrgId",
    otherKey: "userId",
  });

  CustomerOrgModel.hasMany(EnvironmentModel, {
    foreignKey: "customerOrgId",
  });

  CustomerOrgModel.hasOne(StaticWebSettingsModel, {
    foreignKey: "customerOrgId",
    as: "staticWebSettings",
  });
});
