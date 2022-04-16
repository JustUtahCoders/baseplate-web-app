import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { modelEvents } from "../../../InitDB";
import { UserModel } from "../User/User";
import { EnvironmentModel } from "../Environment/Environment";
import {
  BelongsToMethods,
  BelongsToManyMethods,
  HasManyMethods,
} from "../SequelizeTSHelpers";
import S, {
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
} from "sequelize";
import { initialSchema } from "./CustomerOrgSchema";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";

const { Model } = S;

export class CustomerOrgModel
  extends Model<CustomerOrgAttributes, CustomerOrgCreationAttributes>
  implements
    CustomerOrgAttributes,
    BelongsToMethods<{ billingUser: string }, UserModel>,
    BelongsToManyMethods<{ user: string }, UserModel>,
    HasManyMethods<{ environment: string }, EnvironmentModel>,
    BelongsToMethods<{ auditUser: string }, UserModel>
{
  public id!: number;
  public name!: string;
  public accountEnabled!: boolean;
  public billingUserId!: number;
  public orgKey!: string;
  public auditUserId!: number;

  public getBillingUser!: BelongsToGetAssociationMixin<UserModel>;
  public setBillingUser!: BelongsToSetAssociationMixin<UserModel, number>;
  public createBillingUser!: BelongsToCreateAssociationMixin<UserModel>;

  public getUsers!: BelongsToManyGetAssociationsMixin<UserModel>;
  public countUsers!: BelongsToManyCountAssociationsMixin;
  public hasUser!: BelongsToManyHasAssociationMixin<UserModel, number>;
  public hasUsers!: BelongsToManyHasAssociationsMixin<UserModel, number>;
  public setUsers!: BelongsToManySetAssociationsMixin<UserModel, number>;
  public addUser!: BelongsToManyAddAssociationMixin<UserModel, number>;
  public addUsers!: BelongsToManyAddAssociationsMixin<UserModel, number>;
  public removeUser!: BelongsToManyRemoveAssociationMixin<UserModel, number>;
  public removeUsers!: BelongsToManyRemoveAssociationsMixin<UserModel, number>;
  public createUser!: BelongsToManyCreateAssociationMixin<UserModel>;

  public getEnvironments!: HasManyGetAssociationsMixin<EnvironmentModel>;
  public countEnvironments!: HasManyCountAssociationsMixin;
  public hasEnvironment!: HasManyHasAssociationMixin<EnvironmentModel, number>;
  public hasEnvironments!: HasManyHasAssociationsMixin<
    EnvironmentModel,
    number
  >;
  public setEnvironments!: HasManySetAssociationsMixin<
    EnvironmentModel,
    number
  >;
  public addEnvironment!: HasManyAddAssociationMixin<EnvironmentModel, number>;
  public addEnvironments!: HasManyAddAssociationsMixin<
    EnvironmentModel,
    number
  >;
  public removeEnvironment!: HasManyRemoveAssociationMixin<
    EnvironmentModel,
    number
  >;
  public removeEnvironments!: HasManyRemoveAssociationsMixin<
    EnvironmentModel,
    number
  >;
  public createEnvironment!: HasManyCreateAssociationMixin<EnvironmentModel>;

  public getAuditUser!: BelongsToGetAssociationMixin<UserModel>;
  public setAuditUser!: BelongsToSetAssociationMixin<UserModel, number>;
  public createAuditUser!: BelongsToCreateAssociationMixin<UserModel>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface CustomerOrgAttributes extends AuditTargetAttributes {
  id: number;
  name: string;
  accountEnabled: boolean;
  billingUserId: number;
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

  CustomerOrgModel.belongsTo(UserModel, {
    as: "AuditUser",
    foreignKey: {
      name: "auditUserId",
      allowNull: false,
    },
  });
});
