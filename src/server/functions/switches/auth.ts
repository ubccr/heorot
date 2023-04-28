import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";
import got from "got";

export async function switch_login(switch_os: string, switch_address: string) {
  try {
    let url = "";
    const switch_credentials = {
      username: env.SWITCH_USERNAME,
      password: env.SWITCH_PASSWORD,
    };
    if (switch_os === "Arista_EOS") {
      // set environment for Arista EOS
      url = `https://${switch_address}/login`;

      // Login to switch
      const login = await got.post(url, {
        json: switch_credentials,
        https: {
          rejectUnauthorized: false,
        },
      });
      if (!login.ok)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to login to switch.",
          cause: login,
        });

      // Get session cookie | response header looks like this: "set-cookie": "session=blah; Path=/; HttpOnly"
      const headers = login.headers["set-cookie"];
      if (!headers)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get session cookie from switch.",
          cause: login,
        });
      const Cookie = headers[0]?.split(";")[0] ?? "";

      return { Cookie, switch_os };
    } else
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Unsupported switch OS.",
        cause: switch_os,
      });
  } catch (error: any) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to login to switch.",
      cause: error,
    });
  }
}

export async function switch_logout(
  switch_os: string,
  switch_address: string,
  Cookie: string
) {
  let url = "";
  try {
    if (switch_os === "Arista_EOS") {
      url = `https://${switch_address}/logout`;

      const logout = await got.post(url, {
        headers: { Cookie },
        https: { rejectUnauthorized: false },
      });
      if (!logout.ok)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to logout of switch.",
          cause: logout,
        });
    } else
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Unsupported switch OS.",
        cause: switch_os,
      });
  } catch (error: any) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to logout of switch.",
      cause: error,
    });
  }
}
