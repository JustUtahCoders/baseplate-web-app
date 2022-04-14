import Sequelize from "sequelize";
import bcrypt from "bcryptjs";
import { UserModel } from "../DB/Models/User.js";

const { Op } = Sequelize;

export async function findOrCreateLocalUser(): Promise<UserModel> {
  const users = await UserModel.findAll({
    where: {
      email: "sample@baseplate.cloud",
    },
  });

  let localUser = users.length > 0 ? users[0] : null;

  if (!localUser) {
    throw Error(
      `No local user found. This means your local postgres database has not been properly seeded. To fix, run pnpm exec sequelize-cli db:seed:all`
    );
  }

  return localUser;
}

export async function findOrCreateGoogleUser(profile): Promise<UserModel> {
  const users = await UserModel.findAll({
    where: {
      googleAuthToken: profile.id,
    },
  });

  let googleUser = users.length > 0 ? users[0] : null;

  let userGoogleEmail: string =
    profile.emails.length > 0 ? profile.emails[0].value : null;

  if (!userGoogleEmail) {
    throw Error(`Could not find email address in Google profile`);
  }

  if (!googleUser) {
    googleUser = await UserModel.create({
      givenName: profile.name.givenName,
      familyName: profile.name.familyName,
      email: userGoogleEmail,
      password: null,
      googleAuthToken: profile.id, // googleAuthToken is not a token, it's a Google id
    });
  }

  return googleUser;
}

export async function findUser(email, password): Promise<UserModel | null> {
  const hashpass = await bcrypt.hash(password, 5);
  const user = await findUserByEmail(email);

  if (user) {
    const hash = user.get("password");
    const isValid = bcrypt.compareSync(password, `${hash}`);

    return isValid ? user : null;
  } else {
    return null;
  }
}

export async function findUserByEmail(
  email: string
): Promise<UserModel | null> {
  const users = await UserModel.findAll({
    where: {
      email: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("email")),
        Op.eq,
        email.toLowerCase()
      ),
    },
  });
  return users.length > 0 ? users[0] : null;
}
