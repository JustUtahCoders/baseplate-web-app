import "./Server";

// Export types for all REST endpoints
export { EndpointCreateDeploymentResBody } from "./RestAPI/Deployments/CreateDeployment";
export { EndpointGetDeploymentCredentialsResBody } from "./RestAPI/Deployments/GetDeploymentCredentials";
export { EndpointGetEnvironmentsResBody } from "./RestApi/Environments/GetEnvironments";
export { EndpointGetMicrofrontendsResBody } from "./RestAPI/Microfrontends/GetMicrofrontends";
export { EndpointGetStaticWebSettingsResBody } from "./RestAPI/OrgSettings/GetStaticWebSettings";
export { EndpointGetMyCustomerOrgResBody } from "./RestAPI/OrgSettings/GetThisCustomerOrg";
