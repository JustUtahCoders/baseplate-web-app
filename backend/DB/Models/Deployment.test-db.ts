import {
  dbHelpers,
  sampleCustomerOrg,
  sampleMicrofrontend,
  sampleUser,
} from "../TestHelpers/DBTestHelpers";
import {
  DeploymentCause,
  DeploymentModel,
  DeploymentStatus,
} from "./Deployment";
import { MicrofrontendModel } from "./Microfrontend";

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
  const getMicrofrontend = sampleMicrofrontend(getCustomerOrg);

  it(`can create and retrieve deployments`, async () => {
    const microfrontend = getMicrofrontend();

    deployment = await DeploymentModel.create({
      cause: DeploymentCause.foundryWebApp,
      microfrontendId: microfrontend.id,
      status: DeploymentStatus.success,
    });

    expect(deployment).toBeTruthy();
    expect(deployment.microfrontendId).toBe(microfrontend.id);

    deployment = await DeploymentModel.findOne({
      where: {
        id: deployment.id,
      },
    });

    expect(deployment.cause).toBe(DeploymentCause.foundryWebApp);
    expect(deployment.status).toBe(DeploymentStatus.success);
  });
});
