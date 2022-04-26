import request from "supertest";
import {
  dbHelpers,
  sampleBaseplateToken,
  sampleCustomerOrg,
  sampleEnvironment,
  sampleMicrofrontend,
  sampleUser,
} from "../DB/TestHelpers/DBTestHelpers";
import { app } from "../Server";

describe(`POST /api/deployments`, () => {
  dbHelpers();

  const getUser = sampleUser();
  const getCustomerOrg = sampleCustomerOrg(getUser);
  const getEnvironment = sampleEnvironment(getUser, getCustomerOrg);
  const getMicrofrontend = sampleMicrofrontend(getUser, getCustomerOrg);
  const getBaseplateToken = sampleBaseplateToken(getUser, getCustomerOrg);

  it(`successfully deploys`, async () => {
    console.log("here1");
    const response = await request(app)
      .post("/api/deployments")
      .send({
        baseplateToken: getBaseplateToken().token,
        environmentId: getEnvironment().id,
        customerOrgId: getCustomerOrg().id,
        cause: "manualAPICall",
        changedMicrofrontends: [
          {
            microfrontendId: getMicrofrontend().id,
            entryUrl:
              "https://cdn.baseplate.cloud/convex/apps/navbar/navbar.v2.js",
          },
        ],
      });

    console.log("here2", JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });
});
