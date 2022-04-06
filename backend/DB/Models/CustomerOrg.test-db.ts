import { dbHelpers, sampleUser } from "../TestHelpers/DBTestHelpers";
import { CustomerOrgModel } from "./CustomerOrg";

describe("CustomerOrgModel", () => {
  dbHelpers();
  const getUser = sampleUser();
  let customerOrg: CustomerOrgModel | undefined;

  afterEach(async () => {
    if (customerOrg) {
      await customerOrg.destroy();
    }
  });

  it(`can create and retrieve customerOrgs`, async () => {
    const user = getUser();

    customerOrg = await CustomerOrgModel.create({
      accountEnabled: true,
      name: "Coheed and Cambria",
      orgKey: "theheed",
      billingUserId: user.id,
    });

    expect(customerOrg).toBeTruthy();
    expect(customerOrg.name).toBe("Coheed and Cambria");

    customerOrg = await CustomerOrgModel.findOne({
      where: {
        id: customerOrg.id,
      },
    });

    expect(customerOrg).toBeTruthy();
    expect(customerOrg.name).toBe("Coheed and Cambria");
    expect(customerOrg.orgKey).toBe("theheed");
    expect(customerOrg.accountEnabled).toBe(true);
  });

  it(`can retrieve the associated user`, async () => {
    customerOrg = await CustomerOrgModel.create({
      accountEnabled: true,
      name: "Coheed and Cambria",
      orgKey: "theheed",
      billingUserId: getUser().id,
    });

    const user = await customerOrg.getBillingUser();

    expect(user.id).toEqual(getUser().id);
  });
});
