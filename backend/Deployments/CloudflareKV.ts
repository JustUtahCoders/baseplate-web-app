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

interface CloudflareKVWriteResponse {
  success: boolean;
  errors: string[];
  messages: string[];
}
