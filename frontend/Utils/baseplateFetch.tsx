import { isPlainObject } from "lodash-es";
import { BaseplateAccount } from "../../backend/Utils/IAMUtils";
import { AppProps } from "../App";
import { theGlobal } from "./Global";

export const baseplateFetch = global.IN_WEBPACK
  ? browserBaseplateFetch
  : serverBaseplateFetch;

async function serverBaseplateFetch<ResponseDataType = object>(
  url: string,
  options: BaseplateFetchOptions = {},
  rootProps?: AppProps
): Promise<ResponseDataType> {
  if (!rootProps?.baseplateAccount) {
    throw Error(
      "Server-side baseplateFetch requires rootProps to be passed in"
    );
  }
  console.log("server baseplate fetch");
  const [{ app }, httpMocks] = await Promise.all([
    import(/* webpackIgnore: true */ "../../backend/Server"),
    import(/* webpackIgnore: true */ "node-mocks-http"),
  ]);

  return new Promise((resolve, reject) => {
    const req = httpMocks.createRequest({
      // @ts-ignore
      method: options.method || "GET",
      url,
    });
    req.baseplateAccount = rootProps.baseplateAccount!;
    const res = httpMocks.createResponse();
    app._router.handle(req, res, () => {});

    res.on("end", () => {
      const statusCode = res._getStatusCode();
      console.log("status code", statusCode);
      if (statusCode >= 200 && statusCode < 300) {
        if (statusCode === 204) {
          resolve(null as unknown as ResponseDataType);
        } else {
          resolve(res._getJSONData());
        }
      } else if (statusCode === 401) {
        throw Error(
          `Server simultaneously thinks you're logged in and also not logged in`
        );
      } else {
        console.error(res._getJSONData());
        throw Error(
          `Server responded with ${statusCode} ${res._getStatusMessage()} when requesting ${
            options?.method ?? "GET"
          } ${url}`
        );
      }
    });
  });
}

function browserBaseplateFetch<ResponseDataType = object>(
  url: string,
  options: BaseplateFetchOptions = {}
): Promise<ResponseDataType> {
  if (isPlainObject(options?.body) && !(options?.body instanceof FormData)) {
    options.body = JSON.stringify(options.body);
    options.headers = options.headers || {};
    options.headers["content-type"] = "application/json";
  }

  return fetch(url, options as RequestInit).then((r) => {
    if (r.ok) {
      if (r.status === 204) {
        return;
      } else if (r.headers.get("content-type")?.includes("application/json")) {
        return r.json();
      } else if (r.headers.get["content-length"]?.length > 0) {
        return r.text();
      }
    } else if (r.status === 401) {
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
      return { httpStatus: r.status };
    } else {
      throw Error(
        `Server responded with ${r.status} ${r.statusText} when requesting ${
          options?.method ?? "GET"
        } ${url}`
      );
    }
  });
}

export type BaseplateFetchOptions = Omit<RequestInit, "body"> & {
  body?: object | BodyInit;
};

declare global {
  interface Window {
    debugFetch: typeof baseplateFetch;
  }

  namespace NodeJS {
    interface Global {
      debugFetch: typeof baseplateFetch;
    }
  }
}

theGlobal.debugFetch = baseplateFetch;
