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

const mockFetch = fetch as jest.Mock;

describe(`POST /api/deployments`, () => {
  dbHelpers();

  const getUser = sampleUser();
  const getCustomerOrg = sampleCustomerOrg(getUser);
  const getEnvironment = sampleEnvironment(getUser, getCustomerOrg);
  const getMicrofrontend = sampleMicrofrontend(getUser, getCustomerOrg);
  const getBaseplateToken = sampleBaseplateToken(getUser, getCustomerOrg);

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it(`successfully deploys`, async () => {
    mockFetch.mockReturnValueOnce({
      ok: true,
      async json() {
        return {
          success: true,
        };
      },
    });

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

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });
});
