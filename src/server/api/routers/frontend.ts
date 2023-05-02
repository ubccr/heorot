import { compareSync, hashSync } from "bcryptjs";
import {
  createTRPCRouter,
  errorHandler,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { grendel_host_list, load_grendel } from "~/server/functions/grendel";
import { promise, z } from "zod";

import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";
import jwt from "jsonwebtoken";
import { maas_machines } from "~/server/functions/maas";
import { prisma } from "~/server/db";

export const frontendRouter = createTRPCRouter({
  floorplan: privateProcedure.query(async () => {
    try {
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

      // const grendel_res = await grendel_host_list();
      // const maas_res = await maas_machines();

      // // Clear DB
      // if (grendel_res.length > 0 && maas_res.length > 0) {
      //   await prisma.hosts.deleteMany({});
      // }

      // // Add Grendel entries to DB
      // for (const grendel_host of grendel_res) {
      //   await prisma.hosts.create({
      //     data: {
      //       host: grendel_host.name,
      //       host_type: "",
      //       source: "grendel",
      //     },
      //   });
      // }
      // // Add MAAS entries to DB
      // for (const maas_host of maas_res) {
      //   await prisma.hosts.create({
      //     data: {
      //       host: maas_host.hostname,
      //       host_type: "",
      //       source: "maas",
      //     },
      //   });
      // }

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

              if (!!host) return `${x}${y}`;
              else return null;
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
});
