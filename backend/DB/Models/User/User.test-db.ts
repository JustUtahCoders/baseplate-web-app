import { dbHelpers } from "../../TestHelpers/DBTestHelpers";
import { UserModel } from "./User";

describe("UserModel", () => {
  dbHelpers();
  let user: UserModel | undefined;

  afterEach(async () => {
    if (user) {
      await user.destroy();
    }
  });

  it(`can create and retrieve users`, async () => {
    user = await UserModel.create({
      email: "sample@baseplate.com",
      givenName: "Base",
      familyName: "Plate",
    });

    expect(user).toBeTruthy();
    expect(user.email).toBe("sample@baseplate.com");

    user = await UserModel.findOne({
      where: {
        id: user.id,
      },
    });

    expect(user).toBeTruthy();
    expect(user.email).toBe("sample@baseplate.com");
    expect(user.givenName).toBe("Base");
    expect(user.familyName).toBe("Plate");

    const customerOrgs = await user.getCustomerOrgs();

    expect(customerOrgs).toEqual([]);
  });
});
