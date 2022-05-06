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
import { findUser, findOrCreateGoogleUser } from "../Users/Users";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import Keygrip from "keygrip";
import { notLoggedIn } from "../Utils/EndpointResponses";
import { User, UserModel } from "../DB/Models/User/User";
import { AuthTokenModel } from "../DB/Models/AuthToken/AuthToken";
import {
  BaseplateUUID,
  ModelWithIncludes,
} from "../DB/Models/SequelizeTSHelpers";
import { AccountPermissionModel } from "../DB/Models/IAM/AccountPermission";
import { PermissionModel } from "../DB/Models/IAM/Permission";

let passportStrategy = new Strategy(async function (email, password, done) {
  try {
    let user = await findUser(email, password);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error);
  }
});

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:7600/auth/google/callback",
      },
      async function (accessToken, refreshToken, profile, done) {
        findOrCreateGoogleUser(profile)
          .then((user) => {
            return done(null, user);
          })
          .catch((error) => {
            return done(error);
          });
      }
    )
  );
}

passport.use(passportStrategy);

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

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

router.use("/", async (req, res, next) => {
  const userId = req?.session?.passport?.user?.id;
  const isUsingCookie = Boolean(userId);
  const baseplateToken = req.body.baseplateToken || req.query.baseplateToken;

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
    console.log("Getting account permissions");
    // Start db query for account permissions, but do not await it here so that
    // we can also concurrently look up the user / authtoken
    accountPermissionsPromise = AccountPermissionModel.findAll({
      where: {
        accountId,
        dateRevoked: null,
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
  } else if (req.url.startsWith("/app/")) {
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
