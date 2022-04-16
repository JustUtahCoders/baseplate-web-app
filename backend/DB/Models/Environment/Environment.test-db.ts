import {
  dbHelpers,
  sampleCustomerOrg,
  sampleUser,
} from "../../TestHelpers/DBTestHelpers";
import { EnvironmentModel } from "./Environment";

describe("EnvironmentModel", () => {
  let environment: EnvironmentModel | undefined;

  dbHelpers();

  afterEach(async () => {
    if (environment) {
      await environment.destroy();
    }
  });

  const getUser = sampleUser();
  const getCustomerOrg = sampleCustomerOrg(getUser);

  it(`can create and retrieve environments`, async () => {
    const user = getUser();
    const customerOrg = getCustomerOrg();

    environment = await EnvironmentModel.create({
      customerOrgId: customerOrg.id,
      isProd: true,
      name: "prod",
      auditUserId: user.id,
    });

    expect(environment).toBeTruthy();
    expect(environment.name).toBe("prod");

    environment = await EnvironmentModel.findOne({
      where: {
        id: environment.id,
      },
    });

    expect(environment.name).toBe("prod");
    expect(environment.isProd).toBe(true);
  });
});
