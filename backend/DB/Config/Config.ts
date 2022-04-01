import { Options } from "sequelize";
import database from "./Databases.json" assert { type: "json" };

const allConfigs: AllDBConfigs = database as AllDBConfigs;

export default allConfigs;

interface AllDBConfigs {
  [key: string]: Options;
}
