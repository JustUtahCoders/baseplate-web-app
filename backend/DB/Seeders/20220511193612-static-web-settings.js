"use strict";
const { getSampleUserAndCustomerOrg } = require("./20220331215707-sample-user");

module.exports = {
  async up(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    await queryInterface.bulkInsert("StaticWebSettings", [
      {
        customerOrgId: sampleCustomerOrgId,
        defaultCacheControl: null,
        importMapCacheControl: null,
        corsAllowOrigins: null,
        corsExposeHeaders: null,
        corsMaxAge: null,
        corsAllowCredentials: null,
        corsAllowMethods: null,
        auditAccountId: sampleUserId,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const { sampleUserId, sampleCustomerOrgId } =
      await getSampleUserAndCustomerOrg(queryInterface);

    await queryInterface.bulkDelete("StaticWebSettings", {
      customerOrgId: sampleCustomerOrgId,
    });
  },
};
