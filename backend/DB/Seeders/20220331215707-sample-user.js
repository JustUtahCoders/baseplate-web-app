const bcrypt = require("bcryptjs");

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
            googleAuthToken: null,
          },
          {
            givenName: "MFEOwner",
            familyName: "Sample",
            email: mfeOwnerUserEmail,
            password: await bcrypt.hash("password", 5),
            googleAuthToken: null,
          },
          {
            givenName: "Dev",
            familyName: "Sample",
            email: devUserEmail,
            password: await bcrypt.hash("password", 5),
            googleAuthToken: null,
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
          orgKey: "convex",
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
          email: mfeOwnerUserEmail,
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
