import { modelEvents } from "../../../InitDB";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { CustomerOrgModel } from "../CustomerOrg/CustomerOrg";
import { BaseplateUUID, BelongsToMethods } from "../SequelizeTSHelpers";
import {
  Model,
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

export class MicrofrontendModel
  extends Model<MicrofrontendAttributes, MicrofrontendCreationAttributes>
  implements
    MicrofrontendAttributes,
    BelongsToMethods<{ customerOrg: CustomerOrgModel }>
{
  declare id: BaseplateUUID;
  declare customerOrgId: BaseplateUUID;
  declare name: string;
  declare scope: string;
  declare useCustomerOrgKeyAsScope: boolean;
  declare auditAccountId: BaseplateUUID;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare getCustomerOrg: BelongsToGetAssociationMixin<CustomerOrgModel>;
  declare setCustomerOrg: BelongsToSetAssociationMixin<
    CustomerOrgModel,
    number
  >;
  declare createCustomerOrg: BelongsToCreateAssociationMixin<CustomerOrgModel>;
}

export interface MicrofrontendAttributes extends AuditTargetAttributes {
  id: BaseplateUUID;
  customerOrgId: BaseplateUUID;
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
});
