import { env } from "~/env.mjs";
import got from "got";
import { randomUUID } from "crypto";
import type { maas_machines } from "~/types/maas";

export async function maas_machines() {
  type IApiKey = [string, string, string];
  if (!env.MAAS_API_KEY || !env.MAAS_API_URL) return [];
  const url = `${env.MAAS_API_URL}/2.0/machines/`;
  const api_key = env.MAAS_API_KEY.split(":") as IApiKey;

  const maas_res = await got(url, {
    headers: {
      Authorization: `OAuth oauth_version=1.0, oauth_signature_method=PLAINTEXT, oauth_consumer_key=${
        api_key[0]
      }, oauth_token=${api_key[1]}, oauth_signature=&${
        api_key[2]
      }, oauth_nonce=${randomUUID()}, oauth_timestamp=${Date.now()}`,
    },
  }).json<maas_machines[]>();

  return maas_res;
}
