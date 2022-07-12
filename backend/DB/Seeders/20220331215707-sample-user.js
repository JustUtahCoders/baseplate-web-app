const bcrypt = require("bcryptjs");
const dotEnv = require("dotenv");

dotEnv.config({
  path: ".env.dev",
});

let seedOrgKey = process.env.SEED_ORG_KEY;

if (process.env.NODE_ENV === "db-tests") {
  seedOrgKey = "convex";
}

if (!seedOrgKey) {
  throw Error(`SEED_ORG_KEY environment variable required to seed DB`);
}

const orgOwnerUserEmail = "owner@baseplate.cloud";
const mfeOwnerUserEmail = "mfe@baseplate.cloud";
const devUserEmail = "dev@baseplate.cloud";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [orgOwnerUser, mfeOwnerUser, devUser] =
      await queryInterface.bulkInsert(
        "Users",
        [
          {
            givenName: "OrgOwner",
            familyName: "Sample",
            email: orgOwnerUserEmail,
            password: await bcrypt.hash("password", 5),
            githubProfileId: null,
          },
          {
            givenName: "MFEOwner",
            familyName: "Sample",
            email: mfeOwnerUserEmail,
            password: await bcrypt.hash("password", 5),
            githubProfileId: null,
          },
          {
            givenName: "Dev",
            familyName: "Sample",
            email: devUserEmail,
            password: await bcrypt.hash("password", 5),
            githubProfileId: null,
          },
        ],
        {
          returning: true,
        }
      );

    const [insertedCustomerOrg] = await queryInterface.bulkInsert(
      "CustomerOrgs",
      [
        {
          accountEnabled: true,
          billingUserId: orgOwnerUser.id,
          auditAccountId: orgOwnerUser.id,
          name: "Convex Co-op",
          orgKey: seedOrgKey,
        },
      ],
      {
        returning: true,
      }
    );

    await queryInterface.bulkInsert("UserCustomerOrgs", [
      {
        userId: orgOwnerUser.id,
        customerOrgId: insertedCustomerOrg.id,
      },
      {
        userId: mfeOwnerUser.id,
        customerOrgId: insertedCustomerOrg.id,
      },
      {
        userId: devUser.id,
        customerOrgId: insertedCustomerOrg.id,
      },
    ]);

    const baseplateWebAppToken = await queryInterface.rawSelect(
      "AuthTokens",
      {
        where: {
          authTokenType: "webAppCodeAccess",
        },
      },
      ["id"]
    );

    const [personalAccessToken] = await queryInterface.bulkInsert(
      "AuthTokens",
      [
        {
          userId: devUser.id,
          customerOrgId: insertedCustomerOrg.id,
          authTokenType: "personalAccessToken",
          name: "Dev's Personal Token",
          auditAccountId: baseplateWebAppToken,
          lastUsed: null,
          dateRevoked: null,
        },
      ],
      {
        returning: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("CustomerOrgs", {
      name: "Convex Co-op",
    });

    await queryInterface.bulkDelete("Users", {
      email: [orgOwnerUserEmail],
    });
  },

  async getSampleUserAndCustomerOrg(queryInterface) {
    const [sampleCustomerOrg] = await queryInterface.rawSelect(
      "CustomerOrgs",
      {
        where: {
          name: "Convex Co-op",
        },
        plain: false,
      },
      ["id"]
    );

    const [sampleUser] = await queryInterface.rawSelect(
      "Users",
      {
        where: {
          email: orgOwnerUserEmail,
        },
        plain: false,
      },
      ["id"]
    );

    const [mfeOwnerUser] = await queryInterface.rawSelect(
      "Users",
      {
        where: {
          email: mfeOwnerUserEmail,
        },
        plain: false,
      },
      ["id"]
    );

    const [devUser] = await queryInterface.rawSelect(
      "Users",
      {
        where: {
          email: devUserEmail,
        },
        plain: false,
      },
      ["id"]
    );

    return {
      sampleUserId: sampleUser.id,
      mfeOwnerUserId: mfeOwnerUser.id,
      devUserId: devUser.id,
      sampleCustomerOrgId: sampleCustomerOrg.id,
    };
  },
};
