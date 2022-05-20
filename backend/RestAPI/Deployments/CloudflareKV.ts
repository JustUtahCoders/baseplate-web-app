import { isPlainObject } from "lodash-es";

/**
 * See https://api.cloudflare.com/#workers-kv-namespace-write-key-value-pair
 */
export async function writeCloudflareKV(
  key: string,
  value: string | object
): Promise<CloudflareKVWriteResponse> {
  const isJson = isPlainObject(value);

  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_NAMESPACE_ID}/values/${key}`,
    {
      method: "PUT",
      headers: {
        "x-auth-email": process.env.CLOUDFLARE_AUTH_EMAIL!,
        authorization: `Bearer ${process.env.CLOUDFLARE_AUTH_KEY}`,
        "content-type": isJson ? "application/json" : "text/plain",
      },
      body: isJson ? JSON.stringify(value) : (value as string),
    }
  );

  if (!r.ok) {
    let responseBody = "";
    try {
      responseBody = await r.text();
    } catch {}

    throw Error(
      `Cloudflare API to write KV storage value responded with HTTP status '${
        r.status
      }', with following response body: ${JSON.stringify(responseBody)}`
    );
  }

  return (await r.json()) as CloudflareKVWriteResponse;
}

/**
 * See https://api.cloudflare.com/#workers-kv-namespace-read-key-value-pair
 */
export async function readCloudflareKV<Data = object>(
  key: string
): Promise<Data> {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_NAMESPACE_ID}/values/${key}`,
    {
      method: "Get",
      headers: {
        "x-auth-email": process.env.CLOUDFLARE_AUTH_EMAIL!,
        authorization: `Bearer ${process.env.CLOUDFLARE_AUTH_KEY}`,
      },
    }
  );

  if (!r.ok) {
    let responseBody = "";
    try {
      responseBody = await r.text();
    } catch {}

    throw new CloudflareAPIError(
      r.status,
      `Cloudflare API to read KV storage value responded with HTTP status '${
        r.status
      }', with following response body: ${JSON.stringify(responseBody)}`
    );
  }

  const value = await r.text();
  try {
    return JSON.parse(value) as Data;
  } catch {
    return value as unknown as Data;
  }
}

export class CloudflareAPIError extends Error {
  constructor(status: number, ...args) {
    super(...args);
    this.status = status;
  }
  status: number;
}

interface CloudflareKVWriteResponse {
  success: boolean;
  errors: string[];
  messages: string[];
}
