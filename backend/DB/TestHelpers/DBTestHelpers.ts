import { dbReady, sequelize } from "../../InitDB";
import { CustomerOrgModel } from "../Models/CustomerOrg";
import { MicrofrontendModel } from "../models/Microfrontend";
import { UserModel } from "../Models/User";

export function dbHelpers() {
  beforeAll(() => dbReady);
  afterAll(() => sequelize.close());
}

export function sampleUser(): () => UserModel {
  let user: UserModel;

  beforeEach(async () => {
    user = await UserModel.create({
      email: "claudiosanchez@coheedandcambria.com",
      givenName: "Claudio",
      familyName: "Sanchez",
    });
  });
  afterEach(async () => {
    user.destroy();
  });

  return () => user;
}

export function sampleCustomerOrg(
  userGetter: () => UserModel
): () => CustomerOrgModel {
  let customerOrg: CustomerOrgModel;

  beforeEach(async () => {
    const user = userGetter();

    customerOrg = await CustomerOrgModel.create({
      accountEnabled: true,
      name: "Coheed and Cambria",
      orgKey: "theheed",
      billingUserId: user.id,
    });
  });

  afterEach(async () => {
    customerOrg.destroy();
  });

  return () => customerOrg;
}

export function sampleMicrofrontend(
  customerOrgGetter: () => CustomerOrgModel
): () => MicrofrontendModel {
  let microfrontend: MicrofrontendModel;

  beforeEach(async () => {
    const customerOrg = customerOrgGetter();

    microfrontend = await MicrofrontendModel.create({
      customerOrgId: customerOrg.id,
      name: "navbar",
      useCustomerOrgKeyAsScope: true,
    });
  });

  afterEach(async () => {
    await microfrontend.destroy();
  });

  return () => microfrontend;
}
