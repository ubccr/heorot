import { switch_login, switch_logout } from "./auth";

import { TRPCError } from "@trpc/server";
import type { arista_response } from "~/types/arista";
import got from "got";

export async function arista_switch_query<T>(
  switch_address: string,
  commands: string[],
  format = "json",
  id = "",
  Cookie = ""
) {
  try {
    const login_required = Cookie === "" ? true : false;
    if (login_required) {
      // login to switch if no cookie is provided
      const login_res = await switch_login("Arista_EOS", switch_address);
      Cookie = login_res.Cookie;
    }

    const url = `https://${switch_address}/command-api`;
    const body = {
      jsonrpc: "2.0",
      method: "runCmds",
      params: {
        version: 1,
        cmds: commands,
        format,
        timestamps: false,
        autoComplete: false,
        expandAliases: false,
        stopOnError: true,
        streaming: false,
        includeErrorDetail: true,
      },
      id,
    };

    // query switch
    const switch_res: arista_response<T> = await got
      .post(url, {
        headers: { Cookie },
        json: body,
        https: { rejectUnauthorized: false },
      })
      .json();

    // logout of switch if Cookie is not provided
    if (login_required)
      await switch_logout("Arista_EOS", switch_address, Cookie);

    return switch_res;
  } catch (error: any) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to query switch.",
      cause: error,
    });
  }
}
