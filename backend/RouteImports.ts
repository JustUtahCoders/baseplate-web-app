import "./Health/Health";
// Auth should be first, to prevent showing anything if they're not logged in
import "./Auth/Auth";
import "./Auth/ResetPassword";

// Normal API endpoints
import "./RestAPI/Deployments/CreateDeployment";
import "./RestAPI/OrgSettings/GetStaticWebSettings";
import "./RestAPI/Deployments/GetDeploymentCredentials";

// The default API Handler responds with a 404
import "./ApiNotFound";

// Seed debugger
import "./Utils/GetSeedUUIDs";

// WebApp should be at the bottom, as it's the default route
import "./WebApp/WebApp";
