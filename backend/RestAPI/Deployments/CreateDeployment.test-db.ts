import request from "supertest";
import { DeploymentModel } from "../../DB/Models/Deployment/Deployment";
import {
  dbHelpers,
  sampleBaseplateToken,
  sampleCustomerOrg,
  sampleEnvironment,
  sampleMicrofrontend,
  sampleUser,
} from "../../DB/TestHelpers/DBTestHelpers";
import { app } from "../../Server";

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
    mockFetch.mockReturnValue({
      ok: true,
      async json() {
        return {
          success: true,
        };
      },
    });

    const response = await request(app)
      .post(
        `/api/orgs/${getCustomerOrg().id}/deployments?baseplateToken=${
          getBaseplateToken().id
        }`
      )
      .send({
        environmentId: getEnvironment().id,
        cause: "manualAPICall",
        changedMicrofrontends: [
          {
            microfrontendId: getMicrofrontend().id,
            entryUrl: "/navbar.v2.js",
          },
        ],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.deployment.status).toBe("success");

    const deployment = await DeploymentModel.findByPk(
      response.body.deployment.id
    );
    expect(deployment).toBeTruthy();
    expect(deployment.status).toBe("success");
    const deployedMicrofrontends = await deployment.getDeployedMicrofrontends();

    expect(deployedMicrofrontends.length).toBe(1);
    expect(deployedMicrofrontends[0].entryUrl).toBe(
      `https://cdn.baseplate.cloud/${
        getCustomerOrg().orgKey
      }/apps/navbar/navbar.v2.js`
    );

    const importMap = await deployment.deriveImportMap();

    expect(importMap).toEqual({
      imports: {
        [`@${getCustomerOrg().orgKey}/${
          getMicrofrontend().name
        }`]: `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/navbar/navbar.v2.js`,
      },
      scopes: {},
    });
  });

  it(`correctly validates entryUrl`, async () => {
    mockFetch.mockReturnValue({
      ok: true,
      async json() {
        return {
          success: true,
        };
      },
    });

    const reqBody = (entryUrl) => ({
      environmentId: getEnvironment().id,
      cause: "manualAPICall",
      changedMicrofrontends: [
        {
          microfrontendId: getMicrofrontend().id,
          entryUrl,
        },
      ],
    });

    const reqUrl = `/api/orgs/${
      getCustomerOrg().id
    }/deployments?baseplateToken=${getBaseplateToken().id}`;

    // must start with /
    expect(
      (await request(app).post(reqUrl).send(reqBody("navbar.v2.js"))).statusCode
    ).toBe(400);
    expect(
      (await request(app).post(reqUrl).send(reqBody("/navbar.v2.js")))
        .statusCode
    ).not.toBe(400);

    // Trailing period
    expect(
      (await request(app).post(reqUrl).send(reqBody("/navbar.v2.js.")))
        .statusCode
    ).not.toBe(400);

    // multiple slashes
    expect(
      (await request(app).post(reqUrl).send(reqBody("/v2/navbar/navbar.js")))
        .statusCode
    ).not.toBe(400);

    // hostname forbidden
    expect(
      (
        await request(app)
          .post(reqUrl)
          .send(reqBody("https://cdn.baseplate.cloud/v2/navbar/navbar.js"))
      ).statusCode
    ).toBe(400);
    expect(
      (
        await request(app)
          .post(reqUrl)
          .send(reqBody("//cdn.baseplate.cloud/v2/navbar/navbar.js"))
      ).statusCode
    ).toBe(400);
    expect(
      (
        await request(app)
          .post(reqUrl)
          .send(reqBody("s3://cdn.baseplate.cloud/v2/navbar/navbar.js"))
      ).statusCode
    ).toBe(400);
  });

  it(`correctly validates trailingSlashUrl`, async () => {
    mockFetch.mockReturnValue({
      ok: true,
      async json() {
        return {
          success: true,
        };
      },
    });

    const reqBody = (entryUrl, trailingSlashUrl) => ({
      environmentId: getEnvironment().id,
      cause: "manualAPICall",
      changedMicrofrontends: [
        {
          microfrontendId: getMicrofrontend().id,
          entryUrl,
          trailingSlashUrl,
        },
      ],
    });

    const reqUrl = `/api/orgs/${
      getCustomerOrg().id
    }/deployments?baseplateToken=${getBaseplateToken().id}`;

    // must start with /
    expect(
      (await request(app).post(reqUrl).send(reqBody("/navbar.js", "")))
        .statusCode
    ).toBe(400);
    expect(
      (await request(app).post(reqUrl).send(reqBody("/navbar.js", "hello/")))
        .statusCode
    ).toBe(400);

    // valid
    expect(
      (await request(app).post(reqUrl).send(reqBody("/navbar.js", "/navbar/")))
        .statusCode
    ).not.toBe(400);
    expect(
      (await request(app).post(reqUrl).send(reqBody("/navbar.js", "/")))
        .statusCode
    ).not.toBe(400);

    // hostname / protocol forbidden
    expect(
      (
        await request(app)
          .post(reqUrl)
          .send(reqBody("/navbar.js", "https://cdn.baseplate.cloud/navbar/"))
      ).statusCode
    ).toBe(400);
    expect(
      (
        await request(app)
          .post(reqUrl)
          .send(reqBody("/navbar.js", "//cdn.baseplate.cloud/navbar/"))
      ).statusCode
    ).toBe(400);
    expect(
      (
        await request(app)
          .post(reqUrl)
          .send(reqBody("/navbar.js", "s3://cdn.baseplate.cloud/navbar/"))
      ).statusCode
    ).toBe(400);
  });

  it(`fails if the final url isn't publicly reachable`, async () => {
    mockFetch.mockReturnValue({
      ok: false,
      status: 404,
      async json() {
        return {
          success: true,
        };
      },
    });

    const reqBody = (entryUrl) => ({
      environmentId: getEnvironment().id,
      cause: "manualAPICall",
      changedMicrofrontends: [
        {
          microfrontendId: getMicrofrontend().id,
          entryUrl,
        },
      ],
    });

    const reqUrl = `/api/orgs/${
      getCustomerOrg().id
    }/deployments?baseplateToken=${getBaseplateToken().id}`;

    // must start with /
    let response = await request(app).post(reqUrl).send(reqBody("/navbar.js"));
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      errors: [
        `The following URLs are not publicly reachable, so they cannot be put into the import map created by this deployment`,
        `https://cdn.baseplate.cloud/${
          getCustomerOrg().orgKey
        }/apps/navbar/navbar.js`,
      ],
    });
  });
});
