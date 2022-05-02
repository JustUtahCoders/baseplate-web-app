import { Model } from "sequelize";
import { modelEvents } from "../../../InitDB";
import { DefaultModelAttrs } from "../DefaultModelAttrs";
import { BaseplateUUID } from "../SequelizeTSHelpers";
import { currentSchema } from "./PermissionSchema";

export class PermissionModel
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes, DefaultModelAttrs
{
  public id!: BaseplateUUID;
  public name!: string;
  public humanReadableName!: string;
  public description!: string;
  public requiresEntityId!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export interface PermissionAttributes {
  id: BaseplateUUID;
  name: string;
  humanReadableName: string;
  description: string;
  requiresEntityId: boolean;
}

export type PermissionCreationAttributes = Omit<PermissionAttributes, "id">;

export type Permission = PermissionAttributes & DefaultModelAttrs;

modelEvents.once("init", (sequelize) => {
  PermissionModel.init(currentSchema, {
    sequelize,
    modelName: "Permission",
  });
});

modelEvents.once("associate", () => {});
