import S from "sequelize";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const triggerSqlPromise = fs.readFile(
  fileURLToPath(new URL("./AuditTableTrigger.sql", import.meta.url).href),
  "utf-8"
);
const triggerFunctionSqlPromise = fs.readFile(
  fileURLToPath(
    new URL("./AuditTableTriggerFunction.sql", import.meta.url).href
  ),
  "utf-8"
);
const dropTriggerSqlPromise = fs.readFile(
  fileURLToPath(new URL("./DropAuditTableTrigger.sql", import.meta.url).href),
  "utf-8"
);

export function sequelizeOptions(parentModelName) {
  return {
    id: {
      type: S.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    auditUserId: {
      type: S.DataTypes.INTEGER,
      // null necessary for delete
      allowNull: true,
    },
    auditItemId: {
      type: S.DataTypes.INTEGER,
      // null necessary for delete
      allowNull: true,
      // This isn't a foreign key so that we can have this column exist even
      // For DELETE rows
    },
    auditEventType: {
      type: S.DataTypes.STRING,
      allowNull: false,
    },
    auditTimestamp: {
      type: S.DataTypes.DATE,
      allowNull: false,
    },
    oldRowData: {
      type: S.JSONB,
      allowNull: true,
    },
    newRowData: {
      type: S.JSONB,
      allowNull: true,
    },
  };
}

export async function createAuditTable(queryInterface, modelName) {
  await queryInterface.createTable(
    `${modelName}Audit`,
    sequelizeOptions(modelName)
  );

  const triggerFunctionSql = (await triggerFunctionSqlPromise).replace(
    /MODELNAME/g,
    modelName
  );
  await queryInterface.sequelize.query(triggerFunctionSql);

  const triggerSql = (await triggerSqlPromise).replace(/MODELNAME/g, modelName);
  await queryInterface.sequelize.query(triggerSql);
}

export async function dropAuditTable(queryInterface, modelName) {
  const dropTriggerSql = (await dropTriggerSqlPromise).replace(
    /MODELNAME/g,
    modelName
  );
  await queryInterface.sequelize.query(dropTriggerSql);

  await queryInterface.dropTable(`${modelName}Audit`);
}
