import {
  createTRPCRouter,
  errorHandler,
  privateProcedure,
} from "~/server/api/trpc";

import { grendel_host_list } from "~/server/functions/grendel";
import { maas_machines } from "~/server/functions/maas";
import { prisma } from "~/server/db";
import { z } from "zod";

const floorplan_x = [..."defghijklmnopqrstuv"];
const floorplan_y = [
  "28",
  "27",
  "26",
  "25",
  "24",
  "23",
  "22",
  "21",
  "17",
  "16",
  "15",
  "14",
  "13",
  "12",
  "11",
  "10",
  "09",
  "08",
  "07",
  "06",
  "05",
];
export const frontendRouter = createTRPCRouter({
  floorplan: createTRPCRouter({
    list: privateProcedure.query(async () => {
      try {
        const test = await Promise.all(
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

        return test;
      } catch (error) {
        console.error(error);
        const responses = [{ code: "P2002", message: "" }];
        errorHandler(error, responses, "api/routes/floorplan.ts");
      }
    }),
    refresh: privateProcedure.mutation(async () => {
      const grendel_res = await grendel_host_list();
      const maas_res = await maas_machines();

      // Delete removed hosts from DB
      const combined_res = [
        ...grendel_res.map((val) => val.name),
        ...maas_res.map((val) => val.hostname),
      ];
      const old_hosts_res = await prisma.hosts.findMany({
        select: {
          host: true,
        },
      });
      const old_hosts = old_hosts_res.map((val) => val.host);

      const difference = old_hosts
        .filter((host) => !combined_res.includes(host))
        .concat(combined_res.filter((host) => !old_hosts.includes(host)));

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
          host_type: "",
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
          host_type: "",
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
  }),
});

const fix_u = (u: number) => {
  if (u < 10) return `0${u}`;
  return `${u}`;
};
