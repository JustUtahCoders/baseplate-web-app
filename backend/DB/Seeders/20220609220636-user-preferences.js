"use strict";
const { getSampleUserAndCustomerOrg } = require("./20220331215707-sample-user");

module.exports = {
  async up(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    await queryInterface.bulkInsert("UserPreferences", [
      {
        userId: sampleUserId,
        mostRecentCustomerOrgId: sampleCustomerOrgId,
        auditAccountId: sampleUserId,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    await queryInterface.bulkDelete("UserPreferences", {
      userId: sampleUserId,
    });
  },
};
