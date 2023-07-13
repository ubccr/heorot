import { createTRPCRouter, errorHandler, privateProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";
import { exec } from "child_process";
import { getIPRange } from "get-ip-range";
import { get_dell_os10_show_mac_address_table } from "~/server/functions/switches/dell";
import { grendel_host_list } from "~/server/functions/grendel";
import { host_type } from "~/server/functions/host_type";
import { maas_machines } from "~/server/functions/maas";
import ping from "ping";
import { prisma } from "~/server/db";
import { z } from "zod";

const floorplan_x = env.FLOORPLAN_X.split(",");
const floorplan_y = env.FLOORPLAN_Y.split(",");

export const frontendRouter = createTRPCRouter({
  floorplan: createTRPCRouter({
    list: privateProcedure.query(async () => {
      try {
        const floorplan_arr = await Promise.all(
          floorplan_x.map(async (x) => {
            return await Promise.all(
              floorplan_y.map(async (y) => {
                const host = await prisma.hosts.findFirst({
                  where: {
                    host: {
                      contains: `${x}${y}`,
                    },
                  },
                });

                return { rack: `${x}${y}`, populated: !!host ? true : false };
              })
            );
          })
        );

        return floorplan_arr;
      } catch (error) {
        console.error(error);
        const responses = [{ code: "P2002", message: "" }];
        errorHandler(error, responses, "api/routes/floorplan.ts");
      }
    }),
    refresh: privateProcedure.mutation(async () => {
      const grendel_res = await grendel_host_list();
      const maas_res = await maas_machines();

      // combine grendel and maas results
      const combined_res = [...grendel_res.map((val) => val.name), ...maas_res.map((val) => val.hostname)];
      // get old hosts from DB
      const old_hosts_res = await prisma.hosts.findMany({
        select: {
          host: true,
        },
      });
      const old_hosts = old_hosts_res.map((val) => val.host);

      // find difference between old and new hosts
      const difference = old_hosts.filter((host) => !combined_res.includes(host));

      // delete removed hosts from DB
      for (const host of difference) {
        await prisma.hosts.delete({
          where: {
            host: host,
          },
        });
      }

      // Add Grendel entries to DB
      for (const grendel_host of grendel_res) {
        const update = {
          host: grendel_host.name,
          host_type: host_type(grendel_host.name),
          source: "grendel",
          bmc_address: grendel_host.interfaces.find((iface) => iface.bmc === true)?.ip.split("/")[0] ?? null,
        };
        await prisma.hosts.upsert({
          where: { host: grendel_host.name },
          update: update,
          create: update,
        });
      }
      // Add MAAS entries to DB
      for (const maas_host of maas_res) {
        const update = {
          host: maas_host.hostname,
          host_type: host_type(maas_host.hostname),
          source: "maas",
          // TODO: add bmc_address for redfish queries
        };
        await prisma.hosts.upsert({
          where: { host: maas_host.hostname },
          update: update,
          create: update,
        });
      }
    }),
  }),
  rack: createTRPCRouter({
    list: privateProcedure.input(z.string()).query(async ({ input }) => {
      try {
        const hosts = await prisma.hosts.findMany({
          where: {
            host: {
              contains: input,
            },
          },
        });
        const min = 3;
        const max = 42;

        const rack = [];

        for (let u = max; u >= min; u--) {
          const fixed_u = fix_u(u);
          rack.push({
            u: fixed_u,
            host: hosts.find((host) => host.host.split("-")[2] === `${fixed_u}`),
          });
        }

        // get the adjacent racks for navigation buttons
        const rack_number = input.replace(/[a-zA-Z]/g, "");
        const rack_letter = input.replace(/[0-9]/g, "");
        const right_rack = `${rack_letter}${floorplan_y[floorplan_y.indexOf(rack_number) + 1] ?? "0"}`;
        const left_rack = `${rack_letter}${floorplan_y[floorplan_y.indexOf(rack_number) - 1] ?? "0"}`;

        return { left_rack, right_rack, rack };
      } catch (error) {
        console.error(error);
        const responses = [{ code: "P2002", message: "" }];
        errorHandler(error, responses, "api/routes/rack.ts");
      }
    }),
    refresh: privateProcedure.input(z.string()).mutation(async ({ input }) => {
      const grendel_res = (await grendel_host_list()).filter((host) => host.name.includes(input));
      const maas_res = (await maas_machines()).filter((host) => host.hostname.includes(input));

      // combine grendel and maas results
      const combined_res = [...grendel_res.map((val) => val.name), ...maas_res.map((val) => val.hostname)];
      // get old hosts from DB
      const old_hosts_res = await prisma.hosts.findMany({
        select: { host: true },
        where: { host: { contains: input } },
      });
      const old_hosts = old_hosts_res.map((val) => val.host);

      // find difference between old and new hosts
      const difference = old_hosts.filter((host) => !combined_res.includes(host));

      // delete removed hosts from DB
      for (const host of difference) {
        await prisma.hosts.delete({
          where: {
            host: host,
          },
        });
      }

      // Add Grendel entries to DB
      for (const grendel_host of grendel_res) {
        const update = {
          host: grendel_host.name,
          host_type: host_type(grendel_host.name),
          source: "grendel",
        };
        await prisma.hosts.upsert({
          where: { host: grendel_host.name },
          update: update,
          create: update,
        });
      }
      // Add MAAS entries to DB
      for (const maas_host of maas_res) {
        const update = {
          host: maas_host.hostname,
          host_type: host_type(maas_host.hostname),
          source: "maas",
        };
        await prisma.hosts.upsert({
          where: { host: maas_host.hostname },
          update: update,
          create: update,
        });
      }
    }),
  }),
  host: createTRPCRouter({
    get: privateProcedure.input(z.string()).query(async ({ input }) => {
      return await prisma.hosts.findUnique({ where: { host: input } });
    }),
    ip: privateProcedure.input(z.string()).mutation(async ({ input }) => {
      console.log("Some coding required");
    }),
    add: privateProcedure
      .input(
        z.object({
          rack: z.string(),
          core_subnet: z.string(),
          mgmt_subnet: z.string(),
          core_switch: z.string(),
          mgmt_switch: z.string(),
          nodes: z
            .object({
              host: z.string(),
              core_port: z.string(),
              mgmt_port: z.string(),
            })
            .array(),
        })
      )
      .mutation(async ({ input }) => {
        const core_switch = await prisma.hosts.findUnique({ where: { host: input.core_switch } });
        const mgmt_switch = await prisma.hosts.findUnique({ where: { host: input.mgmt_switch } });
        if (!core_switch || !mgmt_switch) throw new TRPCError({ code: "BAD_REQUEST", message: "Switch not found" });
        if (!core_switch.bmc_address || !mgmt_switch.bmc_address)
          throw new TRPCError({ code: "BAD_REQUEST", message: "Switch BMC address not found" });

        const core_switch_mac_address_table = await get_dell_os10_show_mac_address_table(core_switch.bmc_address);
        const mgmt_switch_mac_address_table = await get_dell_os10_show_mac_address_table(mgmt_switch.bmc_address);

        const grendel_list = await grendel_host_list();
        // get list of all grendel ips
        const grendel_ip_arr: string[] = [];
        grendel_list.forEach((host) =>
          host.interfaces.forEach((iface) => grendel_ip_arr.push(iface.ip.split("/")[0] as string))
        );
        // filter already allocated core ips
        const core_total_ip_range = getIPRange(input.core_subnet);
        const core_ip_range = core_total_ip_range.filter((ip) => !grendel_ip_arr.includes(ip));
        // remove unusable IPs
        core_ip_range.shift();
        core_ip_range.pop();

        if (core_ip_range.length < input.nodes.length)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Not enough IPs in subnet: Total subnet IPs = ${core_total_ip_range.length}, IPs not in Grendel DB = ${core_ip_range.length}`,
          });
        // filter already allocated mgmt ips
        const mgmt_total_ip_range = getIPRange(input.mgmt_subnet);
        const mgmt_ip_range = mgmt_total_ip_range.filter((ip) => !grendel_ip_arr.includes(ip));
        // remove unusable IPs
        mgmt_ip_range.shift();
        mgmt_ip_range.pop();

        if (mgmt_ip_range.length < input.nodes.length)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Not enough IPs in subnet: Total subnet IPs = ${mgmt_total_ip_range.length}, IPs not in Grendel DB = ${mgmt_ip_range.length}`,
          });

        // const valid_core_ip_arr: string[] = [];
        // const valid_mgmt_ip_arr: string[] = [];

        // ping module
        // for (let x = 0; x < input.nodes.length; x++) {
        //   const core_ip = core_ip_range.shift();
        //   const mgmt_ip = mgmt_ip_range.shift();

        //   if (!core_ip || !mgmt_ip) throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough IPs" });

        //   const core_res = await ping.promise.probe(core_ip, { timeout: 1, extra: ["-c 1"] });
        //   const mgmt_res = await ping.promise.probe(mgmt_ip, { timeout: 1, extra: ["-c 1"] });
        //   if (!core_res.alive && !mgmt_res.alive) {
        //     valid_core_ip_arr.push(core_ip);
        //     valid_mgmt_ip_arr.push(mgmt_ip);
        //   } else x--;
        // }

        const new_hosts = input.nodes.map((new_host) => {
          const core_switch_mac_address = core_switch_mac_address_table.find((table) => {
            const port = table["if-name"].split("/")[2] ?? "";

            if (port === new_host.core_port) return true;
            return false;
          });
          const mgmt_switch_mac_address = mgmt_switch_mac_address_table.find((table) => {
            const port = table["if-name"].split("/")[2] ?? "";

            if (port === new_host.mgmt_port) return true;
            return false;
          });

          const core_ip = core_ip_range.shift();
          const mgmt_ip = mgmt_ip_range.shift();

          if (!core_ip || !mgmt_ip) throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough IPs" });

          const interfaces = [
            {
              ifname: "",
              fqdn: `${new_host.host.replace(/(cpn)|(srv)/, "bmc")}.mgmt.ccr.buffalo.edu`,
              ip: mgmt_ip + "/20",
              mac: mgmt_switch_mac_address?.["mac-addr"],
              bmc: true,
              vlan: "",
              mtu: 1500,
            },
          ];
          if (!!core_switch_mac_address) {
            interfaces.push({
              ifname: "eno12399",
              fqdn: `${new_host.host}.core.ccr.buffalo.edu`,
              ip: core_ip + "/20",
              mac: core_switch_mac_address?.["mac-addr"],
              bmc: false,
              vlan: "",
              mtu: 9000,
            });
          }
          return {
            name: new_host.host,
            interfaces,
            firmware: "snponly-x86_64.efi",
            provision: true,
            boot_image: "flatcar",
            tags: [`${input.rack}`, "nvme", "auto_import"],
          };
        });
        return await Promise.all(new_hosts);
      }),
  }),
});

const fix_u = (u: number) => {
  if (u < 10) return `0${u}`;
  return `${u}`;
};
