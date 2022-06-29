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
  let deployment: DeploymentModel | null;

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
        customerOrgId: getCustomerOrg().id,
        cause: DeploymentCause.baseplateWebApp,
        status: DeploymentStatus.success,
        accountId: getUser().id,
        auditAccountId: getUser().id,
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

    expect(deployment!.cause).toBe(DeploymentCause.baseplateWebApp);
    expect(deployment!.status).toBe(DeploymentStatus.success);
  });

  it(`can derive the import map from DeployedMicrofrontend rows`, async () => {
    try {
      deployment = await DeploymentModel.create({
        customerOrgId: getCustomerOrg().id,
        cause: DeploymentCause.baseplateWebApp,
        status: DeploymentStatus.success,
        accountId: getUser().id,
        auditAccountId: getUser().id,
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
      auditAccountId: getUser().id,
      customerOrgId: getCustomerOrg().id,
      name: "navbar",
      useCustomerOrgKeyAsScope: true,
    });

    await deployment.createDeployedMicrofrontend({
      auditAccountId: getUser().id,
      microfrontendId: microfrontend.id,
      deploymentId: deployment.id,
      deploymentChangedMicrofrontend: true,
      bareImportSpecifier: `@${getCustomerOrg().orgKey}/navbar`,
      entryUrl: `https://cdn.baseplate.cloud/${
        getCustomerOrg().orgKey
      }/apps/navbar/navbar.v1.js`,
      trailingSlashUrl: `https://cdn.baseplate.cloud/${
        getCustomerOrg().orgKey
      }/apps/navbar/`,
      alias1: "@test/navbar",
      alias2: "@yoshi/navbar",
    });

    await deployment.createDeployedMicrofrontend({
      auditAccountId: getUser().id,
      microfrontendId: microfrontend.id,
      deploymentId: deployment.id,
      deploymentChangedMicrofrontend: true,
      bareImportSpecifier: `@${getCustomerOrg().orgKey}/settings`,
      entryUrl: `https://cdn.baseplate.cloud/${
        getCustomerOrg().orgKey
      }/apps/settings/settings.v1.js`,
      trailingSlashUrl: `https://cdn.baseplate.cloud/${
        getCustomerOrg().orgKey
      }/apps/settings/`,
    });

    expect(await deployment.deriveImportMap()).toEqual({
      imports: {
        [`@${getCustomerOrg().orgKey}/navbar`]: `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/navbar/navbar.v1.js`,
        [`@${getCustomerOrg().orgKey}/navbar/`]: `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/navbar/`,
        "@test/navbar": `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/navbar/navbar.v1.js`,
        "@test/navbar/": `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/navbar/`,
        "@yoshi/navbar": `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/navbar/navbar.v1.js`,
        "@yoshi/navbar/": `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/navbar/`,
        [`@${
          getCustomerOrg().orgKey
        }/settings`]: `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/settings/settings.v1.js`,
        [`@${
          getCustomerOrg().orgKey
        }/settings/`]: `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/settings/`,
      },
      scopes: {},
    });

    await microfrontend.destroy();
  });
});
