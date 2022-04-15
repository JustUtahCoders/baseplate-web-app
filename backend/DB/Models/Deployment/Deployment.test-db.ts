import {
  dbHelpers,
  sampleCustomerOrg,
  sampleEnvironment,
  sampleMicrofrontend,
  sampleUser,
} from "../../TestHelpers/DBTestHelpers";
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
});
