import "./Health/Health";
// Auth should be first, to prevent showing anything if they're not logged in
import "./Auth/Auth";
import "./Auth/ResetPassword";

// Normal API endpoints
import "./RestAPI/Deployments/CreateDeployment";
import "./RestAPI/OrgSettings/GetThisCustomerOrg";
import "./RestAPI/OrgSettings/GetStaticWebSettings";
import "./RestAPI/Deployments/GetDeploymentCredentials";
import "./RestAPI/Environments/GetEnvironments";
import "./RestAPI/Environments/ReorderEnvironments";
import "./RestAPI/Environments/PatchEnvironment";
import "./RestAPI/Microfrontends/GetMicrofrontends";
import "./RestAPI/Microfrontends/MicrofrontendDownloads";
import "./RestAPI/Microfrontends/MicrofrontendStatuses";
import "./RestAPI/Microfrontends/LatestMicrofrontendDeployments";
import "./RestAPI/Microfrontends/PatchMicrofrontend";
import "./RestAPI/Microfrontends/GetMicrofrontendAccessList";
import "./RestAPI/OrgSettings/GetAllCustomerOrgs";
import "./RestAPI/Microfrontends/MicrofrontendAudit";
import "./RestAPI/OrgSettings/PatchCustomerOrg";
import "./RestAPI/OrgSettings/PatchStaticWebSettings";

// The default API Handler responds with a 404
import "./ApiNotFound";

// Seed debugger
import "./Utils/GetSeedUUIDs";

// WebApp should be at the bottom, as it's the default route
import "./WebApp/WebApp";
