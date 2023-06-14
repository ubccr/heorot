import {
  createTRPCRouter,
  errorHandler,
  privateProcedure,
} from "~/server/api/trpc";

import { env } from "~/env.mjs";
import { grendel_host_list } from "~/server/functions/grendel";
import { host_type } from "~/server/functions/host_type";
import { maas_machines } from "~/server/functions/maas";
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
      const combined_res = [
        ...grendel_res.map((val) => val.name),
        ...maas_res.map((val) => val.hostname),
      ];
      // get old hosts from DB
      const old_hosts_res = await prisma.hosts.findMany({
        select: {
          host: true,
        },
      });
      const old_hosts = old_hosts_res.map((val) => val.host);
      
      // find difference between old and new hosts
      const difference = old_hosts.filter(
        (host) => !combined_res.includes(host)
        );
        
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
            host: hosts.find(
              (host) => host.host.split("-")[2] === `${fixed_u}`
            ),
          });
        }

        // get the adjacent racks for navigation buttons
        const rack_number = input.replace(/[a-zA-Z]/g, "");
        const rack_letter = input.replace(/[0-9]/g, "");
        const right_rack = `${rack_letter}${
          floorplan_y[floorplan_y.indexOf(rack_number) + 1] ?? "0"
        }`;
        const left_rack = `${rack_letter}${
          floorplan_y[floorplan_y.indexOf(rack_number) - 1] ?? "0"
        }`;

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
      const combined_res = [
        ...grendel_res.map((val) => val.name),
        ...maas_res.map((val) => val.hostname),
      ];
      // get old hosts from DB
      const old_hosts_res = await prisma.hosts.findMany({
        select: { host: true },
        where: { host: { contains: input } }
      });
      const old_hosts = old_hosts_res.map((val) => val.host);

      // find difference between old and new hosts
      const difference = old_hosts.filter(
        (host) => !combined_res.includes(host)
      );

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
});

const fix_u = (u: number) => {
  if (u < 10) return `0${u}`;
  return `${u}`;
};
