import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./Microfrontend').MicrofrontendModel, import('./Microfrontend').MicrofrontendAttributes>}
 */
const schema = {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: S.literal("gen_random_uuid()"),
    primaryKey: true,
  },
  customerOrgId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "CustomerOrgs",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scope: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  useCustomerOrgKeyAsScope: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  auditUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
};

export const initialSchema = schema;

export const currentSchema = schema;
