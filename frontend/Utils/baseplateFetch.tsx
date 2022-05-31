import { isPlainObject } from "lodash-es";
import { theGlobal } from "./Global";

export function baseplateFetch<ResponseDataType = object>(
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
