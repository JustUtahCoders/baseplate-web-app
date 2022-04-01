import { Options } from "sequelize";
import database from "./Database.json" assert { type: "json" };

const allConfigs: AllDBConfigs = database as AllDBConfigs;

export default allConfigs;

interface AllDBConfigs {
  [key: string]: Options;
}
