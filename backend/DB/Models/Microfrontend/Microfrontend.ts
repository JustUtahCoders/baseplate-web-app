import { modelEvents } from "../../../InitDB";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { BelongsToMethods } from "../SequelizeTSHelpers";
import S, {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize";
import { currentSchema } from "./MicrofrontendSchema";
import {
  AuditModel,
  AuditTargetAttributes,
  initAuditModel,
} from "../Audit/Audit";
import { UserModel } from "../User/User";

const { Model } = S;

export class MicrofrontendModel
  extends Model<MicrofrontendAttributes, MicrofrontendCreationAttributes>
  implements
    MicrofrontendAttributes,
    BelongsToMethods<{ customerOrg: string }, CustomerOrgModel>,
    BelongsToMethods<{ auditUser: string }, UserModel>
{
  public id!: number;
  public customerOrgId!: number;
  public name!: string;
  public scope?: string;
  public useCustomerOrgKeyAsScope!: boolean;
  public auditUserId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getCustomerOrg!: BelongsToGetAssociationMixin<CustomerOrgModel>;
  public setCustomerOrg!: BelongsToSetAssociationMixin<
    CustomerOrgModel,
    number
  >;
  public createCustomerOrg!: BelongsToCreateAssociationMixin<CustomerOrgModel>;

  public getAuditUser!: BelongsToGetAssociationMixin<UserModel>;
  public setAuditUser!: BelongsToSetAssociationMixin<UserModel, number>;
  public createAuditUser!: BelongsToCreateAssociationMixin<UserModel>;
}

export interface MicrofrontendAttributes extends AuditTargetAttributes {
  id: number;
  customerOrgId: number;
  // A lowercase string. For example, "navbar" or "settings"
  name: string;
  /*
    The scope is the part of the name after the @ and before the /

    For example, @myscope/myname

    This is a borrowed naming convention from the NPM ecosystem
  */
  scope?: string;
  /*
    Each customer has an orgKey property that can be used as the scope. The orgKey
    is used in baseplate-cloudflare-worker to identify which customer the request is for.
  */
  useCustomerOrgKeyAsScope: boolean;
}

export type MicrofrontendCreationAttributes = Omit<
  MicrofrontendAttributes,
  "id"
>;

export type Microfrontend = MicrofrontendAttributes & DefaultModelAttrs;

export class MicrofrontendAuditModel extends AuditModel<MicrofrontendAttributes> {}

const modelName = "Microfrontend";

initAuditModel(MicrofrontendAuditModel, MicrofrontendModel, modelName);

modelEvents.once("init", (sequelize) => {
  MicrofrontendModel.init(currentSchema, {
    sequelize,
    modelName,
  });
});

modelEvents.once("associate", (sequelize) => {
  MicrofrontendModel.belongsTo(CustomerOrgModel, {
    foreignKey: {
      name: "customerOrgId",
      allowNull: false,
    },
  });

  MicrofrontendModel.belongsTo(UserModel, {
    as: "AuditUser",
    foreignKey: {
      name: "auditUserId",
      allowNull: false,
    },
  });
});
