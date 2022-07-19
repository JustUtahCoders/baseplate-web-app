import { BaseplateUUID } from "../DB/Models/SequelizeTSHelpers";

export interface AnyRouteParams {
  [key: string]: any;
}

export interface RouteParamsWithCustomerOrg extends AnyRouteParams {
  customerOrgId: BaseplateUUID;
}

export interface RouteParamsWithMicrofrontendId
  extends RouteParamsWithCustomerOrg {
  microfrontendId: BaseplateUUID;
}

export interface RouteParamsWithEnvironmentId
  extends RouteParamsWithCustomerOrg {
  environmentId: BaseplateUUID;
}
