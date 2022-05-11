import {
  dbHelpers,
  sampleCustomerOrg,
  sampleUser,
} from "../../TestHelpers/DBTestHelpers";
import { StaticWebSettingsModel } from "./StaticWebSettings";

describe("StaticWebSettingsModel", () => {
  let staticWebSettings: StaticWebSettingsModel | undefined;

  dbHelpers();

  afterEach(async () => {
    if (staticWebSettings) {
      await staticWebSettings.destroy();
    }
  });

  const getUser = sampleUser();
  const getCustomerOrg = sampleCustomerOrg(getUser);

  it(`can create and retrieve staticWebSettings`, async () => {
    const user = getUser();
    const customerOrg = getCustomerOrg();

    staticWebSettings = await StaticWebSettingsModel.create({
      customerOrgId: customerOrg.id,
      defaultCacheControl: "public, max-age=500",
      importMapCacheControl: "public, must-revalidate, max-age=0",
      corsAllowOrigins: ["localhost", "example.com"],
      corsExposeHeaders: ["Response-Custom-Header"],
      corsMaxAge: 500,
      corsAllowCredentials: true,
      corsAllowMethods: ["GET", "HEAD", "PUT", "POST"],
      corsAllowHeaders: ["Request-Custom-Header"],
      auditAccountId: user.id,
    });

    expect(staticWebSettings).toBeTruthy();

    staticWebSettings = await StaticWebSettingsModel.findByPk(
      staticWebSettings.id
    );
    expect(staticWebSettings.defaultCacheControl).toEqual(
      "public, max-age=500"
    );
    expect(staticWebSettings.customerOrgId).toEqual(customerOrg.id);

    // jsonb serialization/deserialization tests
    expect(staticWebSettings.corsAllowOrigins).toEqual([
      "localhost",
      "example.com",
    ]);
    expect(staticWebSettings.corsExposeHeaders).toEqual([
      "Response-Custom-Header",
    ]);

    expect(await staticWebSettings.getCustomerOrg()).toBeTruthy();
  });
});
