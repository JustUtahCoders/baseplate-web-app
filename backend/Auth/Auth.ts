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
import { AuthTokenModel } from "../DB/Models/AuthToken/AuthToken";
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

passport.use(
  new Strategy(async function (email, password, done) {
    try {
      const user = await UserModel.findAll({
        where: {
          email,
          password,
        },
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
      res.redirect("/app");
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
  const userId = req?.session?.passport?.user?.id;
  const isUsingCookie = Boolean(userId);
  let baseplateToken: string | undefined;

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

  let accountId: BaseplateUUID | undefined = userId || baseplateToken,
    user: UserModel | undefined,
    serviceAccount: AuthTokenModel | undefined,
    isLoggedIn: boolean = false,
    accountPermissionsPromise:
      | Promise<
          ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[]
        >
      | undefined;

  if (accountId) {
    // Start db query for account permissions, but do not await it here so that
    // we can also concurrently look up the user / authtoken
    accountPermissionsPromise = AccountPermissionModel.findAll({
      where: {
        accountId,
        dateRevoked: {
          [Op.is]: null,
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

  if (isUsingCookie) {
    const maybeUser = await UserModel.findByPk(userId);

    if (maybeUser) {
      user = maybeUser;
      isLoggedIn = true;
    } else {
      return notLoggedIn(res, `Invalid auth cookie`);
    }
  } else if (baseplateToken) {
    const maybeAuthToken = await AuthTokenModel.findByPk(baseplateToken);
    if (maybeAuthToken) {
      if (
        maybeAuthToken.dateRevoked &&
        new Date() > maybeAuthToken.dateRevoked
      ) {
        return notLoggedIn(res, `Baseplate token is expired`);
      }
      serviceAccount = maybeAuthToken;
      isLoggedIn = true;
    } else {
      return notLoggedIn(res, `Invalid baseplate token`);
    }
  }

  if (isLoggedIn) {
    req.baseplateAccount = {
      accountId: accountId!,
      isServiceAccount: !isUsingCookie,
      isUser: isUsingCookie,
      serviceAccount,
      user,
      accountPermissions: await accountPermissionsPromise!,
    };
    return next();
  }

  // At this point, we know they're not logged in
  if (req.url.startsWith("/api/")) {
    return notLoggedIn(res, `Authentication required to access baseplate api`);
  } else if (req.url.startsWith("/app")) {
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
