import { Model } from "sequelize";
import { dbReady, sequelize } from "../../InitDB";
import { CustomerOrgModel } from "../Models/CustomerOrg/CustomerOrg";
import { EnvironmentModel } from "../Models/Environment/Environment";
import { MicrofrontendModel } from "../Models/Microfrontend/Microfrontend";
import { UserModel } from "../Models/User/User";
import bcrypt from "bcryptjs";
import { AuthTokenModel, AuthTokenType } from "../Models/AuthToken/AuthToken";
import { RoleModel } from "../Models/IAM/Role";
import { AccountPermissionModel } from "../Models/IAM/AccountPermission";

export function dbHelpers() {
  beforeAll(() => dbReady);
  afterAll(() => {
    sequelize.close();
  });
}

export function sampleUser(): () => UserModel {
  let user: UserModel;

  beforeEach(
    safeCreate(async () => {
      user = await UserModel.create({
        email: "claudiosanchez@coheedandcambria.com",
        givenName: "Claudio",
        familyName: "Sanchez",
        password: await bcrypt.hash("password", 1),
      });
    })
  );

  return () => user;
}

export function sampleCustomerOrg(
  userGetter: () => UserModel
): () => CustomerOrgModel {
  let customerOrg: CustomerOrgModel;

  beforeEach(
    safeCreate(async () => {
      const user = userGetter();

      customerOrg = await CustomerOrgModel.create({
        accountEnabled: true,
        name: "Coheed and Cambria",
        orgKey: new Date().toISOString(),
        billingUserId: user.id,
        auditAccountId: user.id,
      });
    })
  );

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

  return () => microfrontend;
}

export function sampleEnvironment(
  userGetter: () => UserModel,
  customerOrgGetter: () => CustomerOrgModel
): () => EnvironmentModel {
  let environment: EnvironmentModel;

  beforeEach(
    safeCreate(async () => {
      environment = await EnvironmentModel.create({
        name: "prod",
        isProd: true,
        pipelineOrder: 0,
        staticWebProxyHost: "s3://test",
        useBaseplateStaticWebHosting: true,
        auditAccountId: userGetter().id,
        customerOrgId: customerOrgGetter().id,
      });
    })
  );

  return () => environment;
}

export function sampleBaseplateToken(
  getUser: () => UserModel,
  getCustomerOrg: () => CustomerOrgModel
): () => AuthTokenModel {
  let baseplateToken: AuthTokenModel;

  beforeEach(
    safeCreate(async () => {
      await AuthTokenModel.truncate({
        cascade: true,
      });

      baseplateToken = await AuthTokenModel.create({
        customerOrgId: getCustomerOrg().id,
        userId: getUser().id,
        authTokenType: AuthTokenType.baseplateApiToken,
      });

      const role = await RoleModel.findOne({
        where: {
          name: "customerOrgs.owner",
        },
      });

      if (!role) {
        throw Error(`Database is not properly seeded`);
      }

      const rolePermissions = await role.getPermissions();

      AccountPermissionModel.bulkCreate(
        rolePermissions.map((rolePermission) => ({
          accountId: baseplateToken.id,
          auditAccountId: baseplateToken.id,
          customerOrgId: getCustomerOrg().id,
          permissionId: rolePermission.id,
          entityId: null,
          dateRevoked: null,
        }))
      );
    })
  );

  return () => baseplateToken;
}

function safeCreate(fn: () => Promise<void>): () => Promise<void> {
  return async () => {
    try {
      await fn();
    } catch (err) {
      // Better stacktrace
      console.error(err);
      throw err;
    }
  };
}

export function createOrgKey() {
  // We need something unique, this seems like a way to do that
  return new Date().toISOString();
}
