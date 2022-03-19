import "./Health/Health.js";
// Auth should be first, to prevent showing anything if they're not logged in
import "./Auth/Auth.js";
import "./Auth/ResetPassword.js";

// Normal API endpoints

// The default API Handler responds with a 404
import "./ApiNotFound.js";

// WebApp should be at the bottom, as it's the default route
import "./WebApp/WebApp.js";
