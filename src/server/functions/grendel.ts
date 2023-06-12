import { GRENDEL_SOCKET_PATH } from "../api/routers/grendel";
import type { IGrendelHost } from "~/types/grendel";
import { TRPCError } from "@trpc/server";
import got from "got";
import { prisma } from "../db";

export const grendel_host_list = async () => {
  try {
    const res: IGrendelHost[] = await got(
      `${GRENDEL_SOCKET_PATH}:/v1/host/list`
    ).json();

    return res;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to receive grendel request.",
      cause: error,
    });
  }
};

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

    return res;
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to receive grendel request.",
      cause: error,
    });
  }
};

// function to load latest grendel changes into DB

export const load_grendel = async () => {
  const grendel_res = await grendel_host_list();
  if (grendel_res.length > 0) {
    await prisma.hosts.deleteMany({});
    for (const hosts of grendel_res) {
      await prisma.hosts.create({
        data: {
          host: hosts.name,
          host_type: "",
          source: "grendel",
        },
      });
    }
  }
};
