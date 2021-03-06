/*
This is where we will authenticate users.
[x] All server endpoints starting with /api/ that are not related to auth should respond with http 401 whenever the user is not logged in.
[x] This should be an HTTP 302 Found response status from the server when the authentication cookie / token is not found server side.
[x] Until we have login working, this should be turned off when the IS_RUNNING_LOCALLY env variable is set.
*/

import { router } from "../Router";
import cookieSession from "cookie-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { renderWebApp } from "../WebApp/RenderWebApp";
import Keygrip from "keygrip";
import {
  invalidRequest,
  notLoggedIn,
  validationResponseMiddleware,
} from "../Utils/EndpointResponses";
import { User, UserModel } from "../DB/Models/User/User";
import {
  AuthTokenModel,
  AuthTokenType,
} from "../DB/Models/AuthToken/AuthToken";
import {
  BaseplateUUID,
  ModelWithIncludes,
} from "../DB/Models/SequelizeTSHelpers";
import { AccountPermissionModel } from "../DB/Models/IAM/AccountPermission";
import { PermissionModel } from "../DB/Models/IAM/Permission";
import { Strategy as GithubStrategy } from "passport-github";
import { body } from "express-validator";
import { Op } from "sequelize";
import validator from "validator";
import bcrypt from "bcryptjs";
import {
  UserPreferencesAttributes,
  UserPreferencesModel,
} from "../DB/Models/User/UserPreferences";

passport.use(
  new Strategy(async function (email, password, done) {
    try {
      const users = await UserModel.findAll({
        where: {
          email,
        },
      });
      const user = users.find((u) => {
        return u.password && bcrypt.compareSync(password, u.password);
      });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error);
    }
  })
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, cb) => {
      const email = profile.emails?.values[0];
      const names = profile.displayName.split(" ");
      const givenName = names[0] ?? "";
      const familyName = names[1] ?? "";

      let user = await UserModel.findOne({
        where: {
          [Op.or]: [
            {
              githubProfileId: String(profile.id),
            },
            email && {
              email,
            },
          ].filter(Boolean),
        },
      });

      if (user && !user.githubProfileId) {
        await user.update({
          githubProfileId: profile.id,
        });
      }

      if (!user && email && familyName && givenName) {
        user = await UserModel.create({
          email,
          familyName,
          givenName,
          githubProfileId: profile.id,
          password: null,
        });
      }

      if (user) {
        cb(null, user);
      } else {
        cb(null, {
          finishAccountCreation: true,
          frontendQuery: `githubAccessToken=${accessToken}&email=${
            email ?? ""
          }&givenName=${givenName ?? ""}&familyName=${familyName ?? ""}`,
        });
      }
    }
  )
);

router.use(
  cookieSession({
    name: "session",
    keys: Keygrip([process.env.KEYGRIP_SECRET || "keygrip secret"], "sha256"), // using keygrip to generate the keys
    maxAge: 144 * 60 * 60 * 1000, // 144 hours
    secure: false,
  })
);

router.use(passport.initialize());
router.use(passport.session());

router.post("/login", passport.authenticate("local"), (req, res, next) => {
  res.status(200).json({ loginSuccess: true });
});

router.get("/login", renderWebApp);
router.get("/logout", async (req, res) => {
  req.logout();
  res.redirect("/login");
});

router.get("/auth/github", passport.authenticate("github"));
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    const user = req?.session?.passport?.user;
    if (!user) {
      res.redirect("/login");
    } else if (user.finishAccountCreation) {
      res.redirect(`/finish-account-creation?${user.frontendQuery}`);
    } else {
      res.redirect("/console");
    }
  }
);

router.post(
  "/auth/github/finish-account-creation",
  body("githubAccessToken").isString(),
  body("email").isEmail(),
  body("givenName").isString(),
  body("familyName").isString(),
  validationResponseMiddleware,
  async (req, res) => {
    const githubApiResponse = await fetch(`https://api.github.com/user`, {
      headers: {
        Authorization: `token ${req.body.githubAccessToken}`,
      },
    });

    if (!githubApiResponse.ok) {
      return invalidRequest(res, `Invalid github token`);
    }

    const githubUser = await githubApiResponse.json();

    await UserModel.findOrCreate({
      where: {
        githubProfileId: String(githubUser.id),
      },
      defaults: {
        email: req.body.email,
        familyName: req.body.familyName,
        givenName: req.body.givenName,
        githubProfileId: githubUser.id,
        password: null,
      },
    });

    res.json({
      success: true,
    });
  }
);

router.use("/", async (req, res, next) => {
  // Server-side baseplateFetch simulates an http request coming in,
  // but it does it in-memory. In those situations, req.baseplateAccount
  // was already defined once for the initial request and doesn't
  // need to be redefined again
  if (req.baseplateAccount) {
    return next();
  }

  let accountId: string | undefined = req?.session?.passport?.user?.id;
  const isUsingCookie = Boolean(accountId);
  let isUser: boolean = isUsingCookie;
  let baseplateToken: string | undefined;
  let user: UserModel | undefined,
    serviceAccount: AuthTokenModel | undefined,
    isLoggedIn: boolean = false,
    accountPermissionsPromise:
      | Promise<
          ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[]
        >
      | undefined,
    userPreferencesPromise: Promise<UserPreferencesAttributes> | undefined;

  if (req.headers.authorization) {
    if (!req.headers.authorization.toLowerCase().startsWith("token ")) {
      return notLoggedIn(res, [
        `Invalid Authorization header. Value must start with "token "`,
      ]);
    } else {
      baseplateToken = req.headers.authorization.slice("token ".length);
    }
  } else if (req.query.baseplateToken) {
    if (typeof req.query.baseplateToken !== "string") {
      return notLoggedIn(res, [
        `Invalid baseplateToken query param - must be a single value`,
      ]);
    } else {
      baseplateToken = req.query.baseplateToken;
    }
  }

  if (baseplateToken && !validator.isUUID(baseplateToken, 4)) {
    return notLoggedIn(res, [
      `Invalid baseplate token - must be a valid UUIDv4`,
    ]);
  }

  if (baseplateToken) {
    const maybeAuthToken = await AuthTokenModel.findOne({
      where: {
        secretAccessKey: baseplateToken,
      },
    });
    if (maybeAuthToken) {
      if (
        maybeAuthToken.dateRevoked &&
        new Date() > maybeAuthToken.dateRevoked
      ) {
        return notLoggedIn(res, `Baseplate token is expired`);
      }

      isUser = false;
      accountId = maybeAuthToken.id;
      isLoggedIn = true;

      if (maybeAuthToken.authTokenType === AuthTokenType.serviceAccountToken) {
        serviceAccount = maybeAuthToken;
      } else if (
        maybeAuthToken.authTokenType === AuthTokenType.personalAccessToken
      ) {
        if (!maybeAuthToken.userId) {
          return notLoggedIn(
            res,
            `Personal access token not associated with a user`
          );
        }
        accountId = maybeAuthToken.userId;
        isUser = true;
      } else if (
        maybeAuthToken.authTokenType === AuthTokenType.webAppCodeAccess
      ) {
        return notLoggedIn(res, `Invalid baseplate token`);
      }

      // In background, update that the token was used
      maybeAuthToken.update({
        lastUsed: new Date(),
      });
    } else {
      return notLoggedIn(res, `Invalid baseplate token`);
    }
  }

  if (isUser) {
    const maybeUser = await UserModel.findByPk(accountId);

    if (maybeUser) {
      user = maybeUser;
      userPreferencesPromise = UserPreferencesModel.findOrCreate({
        where: {
          userId: user.id,
        },
        defaults: {
          userId: user.id,
          auditAccountId: user.id,
        },
      }).then(([model]) => model.get({ plain: true }));
      isLoggedIn = true;
    } else {
      return notLoggedIn(
        res,
        `Invalid ${baseplateToken ? "personal access token" : "auth cookie"}`
      );
    }
  }

  if (accountId) {
    // Start db query for account permissions, but do not await it here so that
    // we can also concurrently look up the user / authtoken
    accountPermissionsPromise = AccountPermissionModel.findAll({
      where: {
        accountId,
        dateRevoked: {
          [Op.is]: undefined,
        },
      },
      include: {
        model: PermissionModel,
        as: "permission",
      },
    }) as Promise<
      ModelWithIncludes<
        AccountPermissionModel,
        { permission: PermissionModel }
      >[]
    >;
  }

  if (isLoggedIn) {
    req.baseplateAccount = {
      accountId: accountId!,
      isServiceAccount: Boolean(serviceAccount),
      isUser,
      serviceAccount,
      userPreferences: await userPreferencesPromise,
      user,
      accountPermissions: await accountPermissionsPromise!,
    };
    return next();
  }

  // At this point, we know they're not logged in
  if (req.url.startsWith("/api/")) {
    return notLoggedIn(res, `Authentication required to access baseplate api`);
  } else if (req.url.startsWith("/console")) {
    return res.status(302).redirect("/login");
  } else {
    next();
  }
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser<User>(function (user, done) {
  done(null, user);
});
