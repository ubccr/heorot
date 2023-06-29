import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import {
  type dell_redfish_update_service_firmware_inventory,
  type dell_redfish_manager_job_status,
  type dell_redfish_systems,
  type dell_redfish_update_service_firmware_inventory_id,
  type dell_redfish_systems_software_installation_servise_get_repo_updates,
} from "~/types/dell";
import { env } from "~/env.mjs";
import got from "got";
import { prisma } from "~/server/db";
import { z } from "zod";
import { grendel_host_find } from "~/server/functions/grendel";
import { parseStringPromise } from "xml2js";

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
        orderBy: [{ component_id: "asc" }, { type: "asc" }],
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
        // console.error(error);
        if (!!error.response.body) {
          const idrac_error = JSON.parse(error.response.body);
          throw new TRPCError({ code: "BAD_REQUEST", message: idrac_error.error["@Message.ExtendedInfo"][0].Message });
        }
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
            type: firmware.Id.match(/^Previous/g) ? "Previous" : "Current",
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
  actions: createTRPCRouter({
    set: createTRPCRouter({
      bad_request: privateProcedure.input(z.string().array()).mutation(async ({ input }) => {
        const host_arr = await prisma.hosts.findMany({ where: { host: { in: input } } });

        interface IFailedHosts {
          host: string;
          error: string;
        }
        const successful_hosts: string[] = [];
        const failed_hosts: IFailedHosts[] = [];

        const res_arr = await Promise.all(
          host_arr.map(async (host) => {
            if (!host.bmc_address) {
              failed_hosts.push({ host: host.host, error: "BMC address not found." });
              return;
            }

            const grendel = await grendel_host_find(host.host);
            if (!grendel || !grendel[0]) {
              failed_hosts.push({ host: host.host, error: "Grendel host not found." });
              return;
            }

            const bmc_iface = grendel[0].interfaces.find((iface) => iface.bmc === true);
            if (!bmc_iface) {
              failed_hosts.push({ host: host.host, error: "Host BMC interface not found." });
              return;
            }

            const url = `https://${host.bmc_address}/redfish/v1/Managers/iDRAC.Embedded.1/Attributes`;
            return got.patch(url, {
              ...got_bmc_options,
              json: {
                Attributes: {
                  "NIC.1.DNSDomainFromDHCP": "Disabled",
                  "NIC.1.DNSDomainNameFromDHCP": "Disabled",
                  "NIC.1.DNSDomainName": bmc_iface.fqdn.split(".").slice(1).join(".") ?? "",
                  "NIC.1.DNSRacName": bmc_iface.fqdn.split(".")[0] ?? "",
                },
              },
            });
          })
        );

        for (const res of res_arr) {
          if (!res) return;
          if (res.ok && !!res.headers.host) successful_hosts.push(res.headers.host);
          else {
            failed_hosts.push({ host: res.headers.host ?? "", error: res.body });
            console.error(res);
          }
        }
        console.log({
          successful_hosts,
          failed_hosts,
        });
        return `Successfully set DNS info for ${successful_hosts.length} of ${input.length} hosts. More details can be found in the console.`;
      }),
      reboot_idrac: privateProcedure.input(z.string().array()).mutation(async ({ input }) => {
        const host_arr = await prisma.hosts.findMany({ where: { host: { in: input } } });
        interface IFailedHosts {
          host: string;
          error: string;
        }
        const successful_hosts: string[] = [];
        const failed_hosts: IFailedHosts[] = [];

        const res_arr = await Promise.all(
          host_arr.map(async (host) => {
            if (!host.bmc_address) {
              failed_hosts.push({ host: host.host, error: "BMC address not found." });
              return;
            }

            const url = `https://${host.bmc_address}/redfish/v1/Managers/iDRAC.Embedded.1/Actions/Manager.Reset`;
            return got.post(url, {
              ...got_bmc_options,
              json: {
                ResetType: "GracefulRestart",
              },
            });
          })
        );

        for (const res of res_arr) {
          if (!res) return;
          if (res.ok && !!res.headers.host) successful_hosts.push(res.headers.host);
          else {
            failed_hosts.push({ host: res.headers.host ?? "", error: res.body });
            console.error(res);
          }
        }
        console.log({
          successful_hosts,
          failed_hosts,
        });
        return `Successfully rebooted ${successful_hosts.length} of ${input.length} hosts. More details can be found in the console.`;
      }),
    }),
    get: createTRPCRouter({
      latest_firmware: privateProcedure.input(z.string()).mutation(async ({ input }) => {
        const host = await prisma.hosts.findUnique({ where: { host: input } });
        if (!host) throw new TRPCError({ code: "NOT_FOUND", message: "Host not found." });
        if (!host.bmc_address) throw new TRPCError({ code: "NOT_FOUND", message: "Host's bmc address not found." });

        // const url = `https://${host.bmc_address}/redfish/v1/Systems/System.Embedded.1/Oem/Dell/DellSoftwareInstallationService/Actions/DellSoftwareInstallationService.InstallFromRepository`;
        // // allow checking of local catalog in the future
        // const res = await got.post(url, {
        //   ...got_bmc_options,
        //   json: {
        //     ApplyUpdate: "False",
        //     IgnoreCertWarning: "On",
        //     IPAddress: "downloads.dell.com",
        //     ShareType: "HTTPS",
        //   },
        // });

        // if (!res.ok || !res.headers.location)
        //   throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error getting latest firmware." });

        // const job_url = `https://${host.bmc_address}${res.headers.location}`;

        // for (let x = 0; x < 10; x++) {
        //   const job_res = await got(job_url, got_bmc_options).json<dell_redfish_manager_job_status>();

        //   if (job_res.JobState === "Completed") break;
        //   if (x === 9)
        //     throw new TRPCError({
        //       code: "INTERNAL_SERVER_ERROR",
        //       message: `Error getting latest firmware. Job failed: ${job_res.Message}`,
        //     });
        //   await new Promise((r) => setTimeout(r, 5000));
        // }
        const updates_url = `https://${host.bmc_address}/redfish/v1/Systems/System.Embedded.1/Oem/Dell/DellSoftwareInstallationService/Actions/DellSoftwareInstallationService.GetRepoBasedUpdateList`;
        const available_updates = await got
          .post(updates_url, { ...got_bmc_options, json: {} })
          .json<dell_redfish_systems_software_installation_servise_get_repo_updates>();

        interface IUpdate {
          CIM: {
            // $: {};
            MESSAGE: [
              {
                SIMPLEREQ: [
                  {
                    "VALUE.NAMEDINSTANCE": [
                      {
                        INSTANCENAME: [
                          {
                            PROPERTY: [
                              {
                                $: { NAME: string; TYPE: string };
                                VALUE: string[];
                              }
                            ];
                          }
                        ];
                      }
                    ];
                  }
                ];
              }
            ];
          };
        }
        const json = (await parseStringPromise(available_updates.PackageList)) as IUpdate;
        await prisma.firmwareCollection.deleteMany({ where: { host: input, type: "Available" } });

        for (const update_package of json.CIM.MESSAGE[0].SIMPLEREQ[0]["VALUE.NAMEDINSTANCE"]) {
          console.log("1");

          const firmware_id =
            update_package.INSTANCENAME[0].PROPERTY.find((x) => x.$.NAME === "PackagePath")?.VALUE[0] ?? "";
          const component_id =
            update_package.INSTANCENAME[0].PROPERTY.find((x) => x.$.NAME === "ComponentID")?.VALUE[0] ?? "";
          const name = update_package.INSTANCENAME[0].PROPERTY.find((x) => x.$.NAME === "DisplayName")?.VALUE[0] ?? "";
          const version =
            update_package.INSTANCENAME[0].PROPERTY.find((x) => x.$.NAME === "PackageVersion")?.VALUE[0] ?? "";
          await prisma.firmwareCollection.create({
            data: {
              host: input,
              firmware_id,
              component_id: parseInt(component_id),
              name,
              version,
              type: "Available",
            },
          });
        }
        // console.log(json);
        console.log(json.CIM.MESSAGE[0].SIMPLEREQ);
      }),
    }),
  }),
});
