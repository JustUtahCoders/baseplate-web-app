import { User, UserModel } from "../DB/Models/User/User";
import { router } from "../Router";
import S from "sequelize";
import { BaseplateUUID } from "../DB/Models/SequelizeTSHelpers";
import {
  CustomerOrg,
  CustomerOrgModel,
} from "../DB/Models/CustomerOrg/CustomerOrg";
import {
  Environment,
  EnvironmentModel,
} from "../DB/Models/Environment/Environment";
import {
  Microfrontend,
  MicrofrontendModel,
} from "../DB/Models/Microfrontend/Microfrontend";
import {
  AuthTokenModel,
  AuthTokenType,
} from "../DB/Models/AuthToken/AuthToken";

if (process.env.IS_RUNNING_LOCALLY) {
  router.get<void, ResBody>("/seeds", async (req, res, next) => {
    const users = await UserModel.findAll({
      where: {
        email: {
          [S.Op.in]: [
            "owner@baseplate.cloud",
            "mfe@baseplate.cloud",
            "dev@baseplate.cloud",
          ],
        },
      },
    });

    const customerOrg = await CustomerOrgModel.findOne({
      where: {
        orgKey: process.env.SEED_ORG_KEY,
      },
    });

    const ownerUser = users.find((u) => u.email === "owner@baseplate.cloud");
    const devUser = users.find((u) => u.email === "dev@baseplate.cloud");

    if (!ownerUser) {
      throw Error(`Unable to find owner user - was DB seeded?`);
    }

    const serviceAccountToken = await AuthTokenModel.findOne({
      where: {
        customerOrgId: customerOrg!.id,
        userId: ownerUser!.id,
        authTokenType: AuthTokenType.serviceAccountToken,
      },
    });

    const devUserPersonalAccessToken = await AuthTokenModel.findOne({
      where: {
        customerOrgId: customerOrg!.id,
        userId: devUser!.id,
        authTokenType: AuthTokenType.personalAccessToken,
      },
    });

    const environments = await EnvironmentModel.findAll({
      where: {
        customerOrgId: customerOrg!.id,
      },
    });

    const microfrontends = await MicrofrontendModel.findAll({
      where: {
        customerOrgId: customerOrg!.id,
      },
    });

    res.json({
      serviceAccountSecretAccessKey: serviceAccountToken!.secretAccessKey,
      devUserPersonalAccessSecretAccessKey:
        devUserPersonalAccessToken!.secretAccessKey,
      customerOrg: {
        id: customerOrg!.id,
      },
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
      })),
      environments: environments.map((e) => ({
        id: e.id,
        name: e.name,
      })),
      microfrontends: microfrontends.map((m) => ({
        id: m.id,
        name: m.name,
      })),
    });
  });
}

interface ResBody {
  serviceAccountSecretAccessKey: BaseplateUUID;
  devUserPersonalAccessSecretAccessKey: BaseplateUUID;
  users: PartialUser[];
  customerOrg: { id: CustomerOrg["id"] };
  environments: PartialEnvironment[];
  microfrontends: PartialMicrofrontend[];
}

interface PartialUser {
  id: User["id"];
  email: User["email"];
}

interface PartialEnvironment {
  id: Environment["id"];
  name: Environment["name"];
}

interface PartialMicrofrontend {
  id: Microfrontend["id"];
  name: Microfrontend["name"];
}
