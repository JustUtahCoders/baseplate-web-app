import S from "sequelize";
import { modelEvents } from "../../DB";
import { DefaultModelAttrs } from "./DefaultModelAttrs";

const { Model, DataTypes } = S;

export class DeploymentModel
  extends Model<DeploymentAttributes, DeploymentCreationAttributes>
  implements DeploymentAttributes {}

export interface DeploymentAttributes {
  id: number;
}
