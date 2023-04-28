import { GRENDEL_SOCKET_PATH } from "../api/routers/grendel";
import type { IGrendelHost } from "~/types/grendel";
import { TRPCError } from "@trpc/server";
import got from "got";

export const grendel_host_find = async (input: string) => {
  try {
    const res: IGrendelHost[] = await got(
      `${GRENDEL_SOCKET_PATH}:/v1/host/find/${input}`
    ).json();
    if (res.length === 0)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Host not found.",
        cause: input,
      });

    return [...res];
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to receive grendel request.",
      cause: error,
    });
  }
};
