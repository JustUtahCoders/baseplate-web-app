import "./Server";

// Export types for all REST endpoints
export {
  EndpointCreateDeploymentResBody,
  EndpointCreateDeploymentReqBody,
} from "./RestAPI/Deployments/CreateDeployment";
export { EndpointGetDeploymentCredentialsResBody } from "./RestAPI/Deployments/GetDeploymentCredentials";
export { EndpointGetEnvironmentsResBody } from "./RestAPI/Environments/GetEnvironments";
export { EndpointGetMicrofrontendsResBody } from "./RestAPI/Microfrontends/GetMicrofrontends";
export { EndpointGetStaticWebSettingsResBody } from "./RestAPI/OrgSettings/GetStaticWebSettings";
export { EndpointGetMyCustomerOrgResBody } from "./RestAPI/OrgSettings/GetThisCustomerOrg";
