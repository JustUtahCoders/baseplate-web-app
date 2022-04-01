const bcrypt = require("bcryptjs");

const sampleUserEmail = "sampleuser@single-spa-foundry.com";

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
};
