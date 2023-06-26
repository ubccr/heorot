import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import {
  type dell_redfish_update_service_firmware_inventory,
  type dell_redfish_manager_job_status,
  type dell_redfish_systems,
  type dell_redfish_update_service_firmware_inventory_id,
} from "~/types/dell";
import { env } from "~/env.mjs";
import got, { Options } from "got";
import { prisma } from "~/server/db";
import { z } from "zod";

const got_bmc_options = {
  https: { rejectUnauthorized: false },
  username: env.REDFISH_USERNAME,
  password: env.REDFISH_PASSWORD,
};

export const redfishRouter = createTRPCRouter({
  get: createTRPCRouter({
    host: privateProcedure.input(z.string()).query(async ({ input }) => {
      return await prisma.redfish.findUnique({ where: { host: input } });
    }),
    screen_shot: privateProcedure.input(z.string()).query(async ({ input }) => {
      const host = await prisma.hosts.findUnique({ where: { host: input } });
      if (!host) throw new TRPCError({ code: "NOT_FOUND", message: "Host not found." });

      const screen_shot_res = await prisma.screenShot.findUnique({ where: { host: input } });
      if (!screen_shot_res) return null;

      const screen_shot = {
        host: screen_shot_res.host,
        image: screen_shot_res.image.toString("base64"),
        created: screen_shot_res.created,
      };
      return screen_shot;
    }),
    support_assist_collection: privateProcedure.input(z.string()).query(async ({ input }) => {
      const host = await prisma.hosts.findUnique({ where: { host: input } });
      if (!host) throw new TRPCError({ code: "NOT_FOUND", message: "Host not found." });

      const support_assist_collection_res = await prisma.supportAssistCollection.findMany({
        orderBy: { created: "desc" },
      });
      if (!support_assist_collection_res) return null;

      return support_assist_collection_res.map((sa_collection) => {
        return {
          id: sa_collection.id,
          host: sa_collection.host,
          collection: sa_collection.collection.toString("base64"),
          name: sa_collection.name,
          created: sa_collection.created,
        };
      });
    }),
    firmware_collection: privateProcedure.input(z.string()).query(async ({ input }) => {
      return await prisma.firmwareCollection.findMany({
        where: { host: input },
        orderBy: [{ component_id: "asc" }, { previous: "asc" }],
      });
    }),
    // bios_capture: privateProcedure.input(z.string()).query(async ({ input }) => {
    //   const host = await prisma.hosts.findUnique({ where: { host: input } });
    //   if (!host) throw new TRPCError({ code: "NOT_FOUND", message: "Host not found." });

    //   const last_post_video_res = await prisma.biosCapture.findUnique({ where: { host: input } });
    //   if (!last_post_video_res) return null;

    //   const last_post_video = {
    //     host: last_post_video_res.host,
    //     image: last_post_video_res.image.toString("base64"),
    //     created: last_post_video_res.created,
    //   };
    //   return last_post_video;
    // })
  }),
  refresh: createTRPCRouter({
    host: privateProcedure.input(z.string()).mutation(async ({ input }) => {
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
    screen_shot: privateProcedure.input(z.string()).mutation(async ({ input }) => {
      try {
        const host = await prisma.hosts.findUnique({ where: { host: input } });
        if (!host) throw new TRPCError({ code: "NOT_FOUND", message: "Host not found." });
        if (!host.bmc_address) throw new TRPCError({ code: "NOT_FOUND", message: "Host's bmc address not found." });

        const url = `https://${host.bmc_address}/redfish/v1/Managers/iDRAC.Embedded.1/Oem/Dell/DellLCService/Actions/DellLCService.ExportServerScreenShot`;
        const redfish_res = await got
          .post(url, {
            json: { FileType: "ServerScreenShot" },
            https: { rejectUnauthorized: false },
            username: env.REDFISH_USERNAME,
            password: env.REDFISH_PASSWORD,
          })
          .json();

        const image = Buffer.from(redfish_res.ServerScreenShotFile, "base64");

        await prisma.screenShot.upsert({
          where: { host: input },
          create: { host: input, image },
          update: { host: input, image },
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Error refreshing screenshot` });
      }
    }),
    support_assist_collection: privateProcedure
      .input(
        z.object({
          host: z.string(),
          name: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const host = await prisma.hosts.findUnique({ where: { host: input.host } });
        if (!host) throw new TRPCError({ code: "NOT_FOUND", message: "Host not found." });
        if (!host.bmc_address) throw new TRPCError({ code: "NOT_FOUND", message: "Host's bmc address not found." });

        const url = `https://${host.bmc_address}/redfish/v1/Managers/iDRAC.Embedded.1/Oem/Dell/DellLCService/Actions/DellLCService.SupportAssistCollection`;

        const SA_job = async () => {
          return await got.post(url, {
            json: {
              DataSelectorArrayIn: ["HWData"],
              ShareType: "Local",
              Transmit: "No",
            },
            https: { rejectUnauthorized: false },
            username: env.REDFISH_USERNAME,
            password: env.REDFISH_PASSWORD,
          });
        };
        let SA_job_res = await SA_job();

        // Accept SA EULA
        if (SA_job_res.statusCode === 400) {
          const eula_url = `https://${host.bmc_address}/redfish/v1/Managers/iDRAC.Embedded.1/Oem/Dell/DellLCService/Actions/DellLCService.SupportAssistAcceptEULA`;
          await got.post(eula_url, {
            json: {},
            https: { rejectUnauthorized: false },
            username: env.REDFISH_USERNAME,
            password: env.REDFISH_PASSWORD,
          });
          SA_job_res = await SA_job();
        }
        if (!SA_job_res.ok)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Error submitting Support Assist Collection job.`,
          });

        // Get job location from headers
        const SA_job_location = SA_job_res.headers["location"];
        if (!SA_job_location)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Error submitting Support Assist Collection job. Location header of job response is undefined.`,
          });

        let SA_export_url = "";
        // Query job endpoint until hopefully done
        for (let i = 0; i < 60; i++) {
          const job_status_res = await got(`https://${host.bmc_address}${SA_job_location}`, {
            https: { rejectUnauthorized: false },
            username: env.REDFISH_USERNAME,
            password: env.REDFISH_PASSWORD,
          });

          const job_status_json = JSON.parse(job_status_res.body) as dell_redfish_manager_job_status;
          if (job_status_json.JobState === "Completed" && job_status_res.headers["location"]) {
            SA_export_url = job_status_res.headers["location"];
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        if (SA_export_url === "")
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Error submitting Support Assist Collection job. Job has failed or taken too long.`,
          });
        // use completed SA zip location and store in DB
        const SA_export_res = await got(`https://${host.bmc_address}${SA_export_url}`, {
          https: { rejectUnauthorized: false },
          username: env.REDFISH_USERNAME,
          password: env.REDFISH_PASSWORD,
        });
        if (!SA_export_res.ok)
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Error downloading completed SA collection` });
        const collection = Buffer.from(SA_export_res.body, "binary");
        await prisma.supportAssistCollection.create({
          data: { host: input.host, name: input.name, collection },
        });
      }),
    firmware_collection: privateProcedure.input(z.string()).mutation(async ({ input }) => {
      const host = await prisma.hosts.findUnique({ where: { host: input } });
      if (!host) throw new TRPCError({ code: "NOT_FOUND", message: "Host not found." });
      if (!host.bmc_address) throw new TRPCError({ code: "NOT_FOUND", message: "Host's bmc address not found." });

      const url = `https://${host.bmc_address}/redfish/v1/UpdateService/FirmwareInventory`;

      const firmware_list_res = await got(url, got_bmc_options).json<dell_redfish_update_service_firmware_inventory>();
      if (!firmware_list_res.Members)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Error getting firmware list` });

      const firmware_res = await Promise.all(
        firmware_list_res.Members.map(async (firmware_url) => {
          if (host.bmc_address && firmware_url["@odata.id"].match(/(Installed)|(Previous)/g)) {
            return await got(
              `https://${host.bmc_address}${firmware_url["@odata.id"]}`,
              got_bmc_options
            ).json<dell_redfish_update_service_firmware_inventory_id>();
          }
        })
      );

      await prisma.firmwareCollection.deleteMany({ where: { host: input } });
      for (const firmware of firmware_res) {
        if (!firmware || firmware.Updateable === false) continue;
        const install_date = firmware.Oem.Dell.DellSoftwareInventory.InstallationDate.match(
          /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z/g
        )
          ? new Date(firmware.Oem.Dell.DellSoftwareInventory.InstallationDate)
          : undefined;

        await prisma.firmwareCollection.create({
          data: {
            host: input,
            component_id: parseInt(firmware.Oem.Dell.DellSoftwareInventory.ComponentID) ?? null,
            firmware_id: firmware.Id,
            name: firmware.Name,
            install_date,
            version: firmware.Version,
            previous: firmware.Id.match(/^Previous/g) ? true : false,
          },
        });
      }
    }),
    // bios_capture: privateProcedure.input(z.string()).mutation(async ({ input }) => {
    //   try {
    //     const host = await prisma.hosts.findUnique({ where: { host: input } });
    //     if (!host) throw new TRPCError({ code: "NOT_FOUND", message: "Host not found." });
    //     if (!host.bmc_address) throw new TRPCError({ code: "NOT_FOUND", message: "Host's bmc address not found." });

    //     const url = `https://${host.bmc_address}"/redfish/v1/Managers/iDRAC.Embedded.1/Oem/Dell/DellLCService/Actions/DellLCService.ExportVideoLog`;
    //     const redfish_res = await got
    //       .post(url, {
    //         json: { FileType: "BIOSCapture" },
    //         https: { rejectUnauthorized: false },
    //         username: env.REDFISH_USERNAME,
    //         password: env.REDFISH_PASSWORD,
    //       })
    //       .json();

    //     const image = Buffer.from(redfish_res.BIOSCaptureFile, "base64");

    //     await prisma.biosCapture.upsert({
    //       where: { host: input },
    //       create: { host: input, image },
    //       update: { host: input, image },
    //     });
    //   } catch (error) {
    //     console.error(error);
    //     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Error refreshing bios capture` });
    //   }
    // })
  }),
});
