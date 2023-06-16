import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

import SuperJSON from "superjson";
import { TRPCError } from "@trpc/server";
import { type dell_redfish_systems } from "~/types/dell";
import { env } from "~/env.mjs";
import got from "got";
import { prisma } from "~/server/db";
import { z } from "zod";

export const redfishRouter = createTRPCRouter({
  get: privateProcedure.input(z.string()).query(async ({ input }) => {
    return await prisma.redfish.findUnique({ where: { host: input } });
  }),
  refresh: privateProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const host = await prisma.hosts.findUnique({ where: { host: input } });
      if (!host) throw new TRPCError({ code: "NOT_FOUND", message: "Host not found." });
      if (!host.bmc_address) throw new TRPCError({ code: "NOT_FOUND", message: "BMC address not found." });

      const url = `https://${host.bmc_address}/redfish/v1/Systems/System.Embedded.1`;
      const redfish_res = await got(url, {
        https: { rejectUnauthorized: false },
        username: env.REDFISH_USERNAME,
        password: env.REDFISH_PASSWORD,
      }).json<dell_redfish_systems>();

      const update = {
        host: input,
        host_name: redfish_res.HostName,
        manufacturer: redfish_res.Manufacturer,
        model: redfish_res.Model,
        service_tag: redfish_res.SKU,
        bios_version: redfish_res.BiosVersion,
        boot_progress_last_state: redfish_res.BootProgress?.LastState ?? undefined,
        last_reset_time: !!redfish_res.LastResetTime ? new Date(redfish_res.LastResetTime) : undefined,
        location_indicator_active: redfish_res.LocationIndicatorActive ?? undefined,
        asset_tag: redfish_res.AssetTag,
        system_type: redfish_res.SystemType ?? undefined,
      };

      await prisma.redfish.upsert({
        where: { host: input },
        update,
        create: update,
      });
    } catch (error) {
      console.error(error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Error sending redfish request to Host` });
    }
  }),
});
