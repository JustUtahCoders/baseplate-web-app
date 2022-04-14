import S from "sequelize";

export default {
  id: {
    type: S.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customerOrgId: {
    type: S.DataTypes.INTEGER,
    references: {
      model: "CustomerOrgs",
      key: "id",
    },
    allowNull: false,
  },
  name: {
    type: S.DataTypes.STRING,
    allowNull: false,
  },
  isProd: {
    type: S.DataTypes.BOOLEAN,
    allowNull: false,
  },
  auditUserId: {
    type: S.DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: S.DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: S.DataTypes.DATE,
    allowNull: false,
  },
};
