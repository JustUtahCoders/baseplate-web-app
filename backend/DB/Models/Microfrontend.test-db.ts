import {
  dbHelpers,
  sampleCustomerOrg,
  sampleUser,
} from "../TestHelpers/DBTestHelpers";
import { MicrofrontendModel } from "./Microfrontend";

describe("MicrofrontendModel", () => {
  dbHelpers();

  afterEach(async () => {
    if (microfrontend) {
      await microfrontend.destroy();
    }
  });

  const getUser = sampleUser();
  const getCustomerOrg = sampleCustomerOrg(getUser);

  let microfrontend: MicrofrontendModel | undefined;

  it(`can create and retrieve microfrontends`, async () => {
    const customerOrg = getCustomerOrg();

    microfrontend = await MicrofrontendModel.create({
      customerOrgId: customerOrg.id,
      name: "navbar",
      useCustomerOrgKeyAsScope: true,
    });

    expect(microfrontend).toBeTruthy();
    expect(microfrontend.name).toBe("navbar");

    microfrontend = await MicrofrontendModel.findOne({
      where: {
        id: microfrontend.id,
      },
    });

    expect(microfrontend.name).toBe("navbar");
    expect(microfrontend.useCustomerOrgKeyAsScope).toBe(true);
  });
});
