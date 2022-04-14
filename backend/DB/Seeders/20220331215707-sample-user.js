const bcrypt = require("bcryptjs");

const sampleUserEmail = "sample@baseplate.cloud";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [insertedUser] = await queryInterface.bulkInsert(
      "Users",
      [
        {
          givenName: "Sample",
          familyName: "User",
          email: sampleUserEmail,
          password: await bcrypt.hash("password", 5),
          googleAuthToken: null,
          createdAt: new Date(),
          updatedAt: new Date(),
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
          billingUserId: insertedUser.id,
          name: "Convex Co-op",
          orgKey: "convex",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        returning: true,
      }
    );

    await queryInterface.bulkInsert("UserCustomerOrgs", [
      {
        userId: insertedUser.id,
        customerOrgId: insertedCustomerOrg.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("CustomerOrgs", {
      name: "Convex Co-op",
    });

    await queryInterface.bulkDelete("Users", {
      email: [sampleUserEmail],
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
          givenName: "Sample",
          familyName: "User",
        },
        plain: false,
      },
      ["id"]
    );

    return {
      sampleUserId: sampleUser.id,
      sampleCustomerOrgId: sampleCustomerOrg.id,
    };
  },
};
