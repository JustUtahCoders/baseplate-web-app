import { Model } from "sequelize";
import { dbReady, sequelize } from "../../InitDB";
import { CustomerOrgModel } from "../Models/CustomerOrg/CustomerOrg";
import { EnvironmentModel } from "../Models/Environment/Environment";
import { MicrofrontendModel } from "../Models/Microfrontend/Microfrontend";
import { UserModel } from "../Models/User/User";
import bcrypt from "bcryptjs";
import { AuthTokenModel, AuthTokenType } from "../Models/AuthToken/AuthToken";

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
      password: await bcrypt.hash("password", 1),
    });
  });
  afterEach(() => safeDestroy(user));

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
      auditAccountId: user.id,
    });
  });

  afterEach(() => safeDestroy(customerOrg));

  return () => customerOrg;
}

export function sampleMicrofrontend(
  userGetter: () => UserModel,
  customerOrgGetter: () => CustomerOrgModel
): () => MicrofrontendModel {
  let microfrontend: MicrofrontendModel;

  beforeEach(async () => {
    const customerOrg = customerOrgGetter();

    microfrontend = await MicrofrontendModel.create({
      customerOrgId: customerOrg.id,
      name: "navbar",
      useCustomerOrgKeyAsScope: true,
      auditAccountId: userGetter().id,
    });
  });

  afterEach(() => safeDestroy(microfrontend));

  return () => microfrontend;
}

export function sampleEnvironment(
  userGetter: () => UserModel,
  customerOrgGetter: () => CustomerOrgModel
): () => EnvironmentModel {
  let environment: EnvironmentModel;

  beforeEach(async () => {
    environment = await EnvironmentModel.create({
      name: "prod",
      isProd: true,
      auditAccountId: userGetter().id,
      customerOrgId: customerOrgGetter().id,
    });
  });

  afterEach(() => safeDestroy(environment));

  return () => environment;
}

export function sampleBaseplateToken(
  getUser: () => UserModel,
  getCustomerOrg: () => CustomerOrgModel
): () => AuthTokenModel {
  let baseplateToken: AuthTokenModel;

  beforeEach(async () => {
    baseplateToken = await AuthTokenModel.create({
      customerOrgId: getCustomerOrg().id,
      userId: getUser().id,
      authTokenType: AuthTokenType.baseplateApiToken,
    });
  });

  afterEach(() => safeDestroy(baseplateToken));

  return () => baseplateToken;
}

async function safeDestroy(mod: Model) {
  try {
    await mod.destroy();
  } catch (err) {
    // Better stacktrace
    console.error(err);
    throw err;
  }
}
