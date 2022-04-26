import {
  dbHelpers,
  sampleCustomerOrg,
  sampleEnvironment,
  sampleUser,
} from "../../TestHelpers/DBTestHelpers";
import { MicrofrontendModel } from "../Microfrontend/Microfrontend";
import {
  DeploymentCause,
  DeploymentModel,
  DeploymentStatus,
} from "./Deployment";

describe("DeploymentModel", () => {
  let deployment: DeploymentModel;

  dbHelpers();

  afterEach(async () => {
    if (deployment) {
      await deployment.destroy();
    }
  });

  const getUser = sampleUser();
  const getCustomerOrg = sampleCustomerOrg(getUser);
  const getEnvironment = sampleEnvironment(getUser, getCustomerOrg);

  it(`can create and retrieve deployments`, async () => {
    try {
      deployment = await DeploymentModel.create({
        cause: DeploymentCause.baseplateWebApp,
        status: DeploymentStatus.success,
        auditUserId: getUser().id,
        environmentId: getEnvironment().id,
      });
    } catch (err) {
      console.error(err);
      throw err;
    }

    expect(deployment).toBeTruthy();
    expect(deployment.status).toBe(DeploymentStatus.success);

    deployment = await DeploymentModel.findOne({
      where: {
        id: deployment.id,
      },
    });

    expect(deployment.cause).toBe(DeploymentCause.baseplateWebApp);
    expect(deployment.status).toBe(DeploymentStatus.success);
  });

  it(`can derive the import map from DeployedMicrofrontend rows`, async () => {
    try {
      deployment = await DeploymentModel.create({
        cause: DeploymentCause.baseplateWebApp,
        status: DeploymentStatus.success,
        auditUserId: getUser().id,
        environmentId: getEnvironment().id,
      });
    } catch (err) {
      console.error(err);
      throw err;
    }

    expect(await deployment.deriveImportMap()).toEqual({
      imports: {},
      scopes: {},
    });

    const microfrontend = await MicrofrontendModel.create({
      auditUserId: getUser().id,
      customerOrgId: getCustomerOrg().id,
      name: "navbar",
      useCustomerOrgKeyAsScope: true,
    });

    await deployment.createDeployedMicrofrontend({
      auditUserId: getUser().id,
      microfrontendId: microfrontend.id,
      deploymentChangedMicrofrontend: true,
      bareImportSpecifier: "@convex/navbar",
      entryUrl: "https://cdn.baseplate.cloud/convex/apps/navbar/navbar.v1.js",
      trailingSlashUrl: "https://cdn.baseplate.cloud/convex/apps/navbar/",
    });

    await deployment.createDeployedMicrofrontend({
      auditUserId: getUser().id,
      microfrontendId: microfrontend.id,
      deploymentChangedMicrofrontend: true,
      bareImportSpecifier: "@convex/settings",
      entryUrl:
        "https://cdn.baseplate.cloud/convex/apps/settings/settings.v1.js",
      trailingSlashUrl: "https://cdn.baseplate.cloud/convex/apps/settings/",
    });

    expect(await deployment.deriveImportMap()).toEqual({
      imports: {
        "@convex/navbar":
          "https://cdn.baseplate.cloud/convex/apps/navbar/navbar.v1.js",
        "@convex/navbar/": "https://cdn.baseplate.cloud/convex/apps/navbar/",
        "@convex/settings":
          "https://cdn.baseplate.cloud/convex/apps/settings/settings.v1.js",
        "@convex/settings/":
          "https://cdn.baseplate.cloud/convex/apps/settings/",
      },
      scopes: {},
    });

    await microfrontend.destroy();
  });
});
