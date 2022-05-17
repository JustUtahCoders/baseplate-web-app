import { BaseplateUUID } from "../DB/Models/SequelizeTSHelpers";

export interface RouteParamsWithCustomerOrg {
  customerOrgId: BaseplateUUID;
  [key: string]: any;
}
