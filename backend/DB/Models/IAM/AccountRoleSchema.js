import S from "sequelize";

const { DataTypes } = S;

/**
 * @type {import('sequelize').ModelAttributes<import('./AccountRole').AccountRoleModel, import('./AccountRole').AccountRole>}
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
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  auditAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Roles",
      key: "id",
    },
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  dateRevoked: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: S.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: S.literal("CURRENT_TIMESTAMP"),
  },
};

export const initialSchema = schema;

export const currentSchema = schema;
