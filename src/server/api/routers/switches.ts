import { createTRPCRouter, privateProcedure } from "../trpc";

import type { InterfaceStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { arista_show_interfaces_status } from "~/types/arista";
import { arista_switch_query } from "~/server/functions/switches/fetch";
import { get_switch_info } from "~/server/functions/switches/info";
import { prisma } from "~/server/db";
import { z } from "zod";

export const switchesRouter = createTRPCRouter({
  interface: createTRPCRouter({
    list: privateProcedure.input(z.string()).query(async ({ input }) => {
      // get interfaces from DB
      const interfaces = await prisma.interfaceStatus.findMany({
        where: { host: input },
      });

      // sort the interfaces by port
      const sorted_interfaces = interfaces.sort((a, b) => {
        const a_interface = a.port.replace("Ethernet", "");
        const b_interface = b.port.replace("Ethernet", "");

        return (
          parseInt(a_interface.split("/")[0] ?? "") -
            parseInt(b_interface.split("/")[0] ?? "") ||
          parseInt(a_interface.split("/")[1] ?? "") -
            parseInt(b_interface.split("/")[1] ?? "") ||
          parseInt(a_interface.split("/")[2] ?? "") -
            parseInt(b_interface.split("/")[2] ?? "")
        );
      });
      const ports: Map<
        number,
        Map<number, Map<number, InterfaceStatus>>
      > = new Map();

      // Loop through all interfaces and add them to the ports map
      //? is a Map the best way to store this data?
      sorted_interfaces.forEach((iface) => {
        if (!iface.port.match("Ethernet")) return;
        const raw_port = iface.port.replace("Ethernet", "");
        const port_arr = raw_port.split("/");
        const blade = parseInt(port_arr[0] ?? "");
        const port = parseInt(port_arr[1] ?? "");
        const breakout = parseInt(port_arr[2] ?? "");

        if (!ports.has(blade)) {
          ports.set(blade, new Map());
          ports.get(blade)?.set(port, new Map());
          ports.get(blade)?.get(port)?.set(breakout, iface);
        } else if (!ports.get(blade)?.has(port)) {
          ports.get(blade)?.set(port, new Map());
          ports.get(blade)?.get(port)?.set(breakout, iface);
        } else if (!ports.get(blade)?.get(port)?.has(breakout)) {
          ports.get(blade)?.get(port)?.set(breakout, iface);
        }
      });

      // convert the Map to an array for easy mapping on the frontend
      const interface_arr = Array.from(ports, ([blade, port_map]) =>
        Array.from(port_map, ([port, breakout_map]) =>
          Array.from(breakout_map, ([breakout, iface]) => iface)
        )
      );

      return interface_arr;
    }),
    refresh: privateProcedure.input(z.string()).mutation(async ({ input }) => {
      // TODO: add switch version handling
      // get switch address for query
      const { switch_address } = await get_switch_info(input);

      // get switch interfaces
      const switch_res =
        await arista_switch_query<arista_show_interfaces_status>(
          switch_address,
          ["show interfaces status"]
        );
      if (!switch_res.result)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Switch returned an error response.",
          cause: switch_res,
        });

      // delete all interfaces already in the DB
      await prisma.interfaceStatus.deleteMany({ where: { host: input } });

      // loop through interfaceStatuses object and add each interface to the DB
      // Arista switch res has each interface name as a key
      for (const key in switch_res.result[0]?.interfaceStatuses) {
        const iface = switch_res.result[0].interfaceStatuses[key];
        if (!iface) continue;

        await prisma.interfaceStatus.create({
          data: {
            host: input,
            port: key,
            port_mode: iface.vlanInformation.interfaceMode,
            vlan_id: iface.vlanInformation.vlanId,
            vlan_info: iface.vlanInformation.vlanExplanation,
            speed: iface.bandwidth,
            type: iface.interfaceType,
            description: iface.description,
            auto_negotiation: iface.autoNegotiateActive,
            duplex: iface.duplex,
            link_status: iface.linkStatus,
            line_protocol_status: iface.lineProtocolStatus,
          },
        });
      }
    }),
    configure: privateProcedure
      .input(
        z.object({
          host: z.string(),
          type: z.string(), //enum(["native", "lag"])
          interfaces: z.string().array(),
          description: z.string(),
          vlan_id: z.number(),
          uplink_speed: z.number().optional(),
          port_channel: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const command_arr: string[] = [];

        switch (input.type) {
          case "native":
            // loop through interfaces in case multiple are selected
            input.interfaces.forEach((iface) => {
              // commands required for adding a single port interface
              command_arr.push(
                `interface ${iface}`,
                `\tdescription ${input.description}`, // TODO: automate
                `\tmtu 9000`,
                `\tflowcontrol receive on`,
                input.uplink_speed === 100 ? `\tspeed forced 100gfull` : "",
                `\tswitchport trunk native vlan ${input.vlan_id}`, // TODO: automate
                `\tswitchport trunk allowed vlan ${input.vlan_id}`, // TODO: automate
                `\tswitchport mode trunk`
              );
            });
            break;
          case "lag":
            // remove the "Ethernet" from the interface name and split the port into an array
            const port_arr = input.interfaces[0]
              ?.replace("Ethernet", "")
              .split("/");
            if (!port_arr || !port_arr[0] || !port_arr[1])
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Port not found.",
                cause: input,
              });
            // if the port channel is 0, automatically determine the port channel using the first two numbers of the port
            const port_channel =
              input.port_channel === 0
                ? `${port_arr[0]}${port_arr[1]}`
                : `${input.port_channel}`;
            // commands required for adding a port channel interface
            command_arr.push(
              `interface Port-Channel${port_channel}`,
              `\tdescription LAG via ${input.interfaces.join(", ")}`,
              `\tmtu 9000`,
              `\tswitchport trunk allowed vlan ${input.vlan_id}`,
              `\tswitchport mode trunk`
            );
            // commands required per interface for adding a LAG
            input.interfaces.forEach((iface) => {
              command_arr.push(
                `interface ${iface}`,
                `\tdescription ${input.description}`,
                `\tflowcontrol receive on`,
                input.uplink_speed === 100 ? `\tspeed forced 100gfull` : "",
                `\tchannel-group ${port_channel} mode active`
              );
            });

            break;
        }
        // get switch info for query
        const { switch_os } = await get_switch_info(input.host);
        if (switch_os === "Arista_EOS") {
          // send the commands to the switch
          return command_arr.join("\n");
          // Automatic config:
          // let switch_res = await arista_switch_query<{}[]>(switch_address, [
          //   "configure terminal",
          //   ...command_arr,
          // ]);

          // if (!switch_res.result)
          //   throw new TRPCError({
          //     code: "INTERNAL_SERVER_ERROR",
          //     message: "Switch returned an error response.",
          //     cause: switch_res,
          //   });
          // return SuperJSON.stringify(switch_res.result);
        }
      }),
    // backup: privateProcedure
    //   .input(z.object({ host: z.string(), description: z.string() }))
    //   .mutation(async ({ input }) => {
    //     let { switch_address, switch_os } = await get_switch_info(input.host);
    //     if (switch_os === "Arista_EOS") {
    //       let switch_res =
    //         await arista_switch_query<arista_show_running_config>(
    //           switch_address,
    //           ["show running-config section interface ethernet5/5/1"],
    //           "text"
    //         );

    //       if (!switch_res.result || !switch_res.result[0])
    //         throw new TRPCError({
    //           code: "INTERNAL_SERVER_ERROR",
    //           message: "Switch returned an error response.",
    //           cause: switch_res,
    //         });

    //       await prisma.interfaceConfigBackups.create({
    //         data: {
    //           host: input.host,
    //           description: input.description,
    //           config: Buffer.from(switch_res.result[0].output, "utf8"),
    //         },
    //       });
    //     }
    //   }),
    // restore: privateProcedure
    //   .input(z.object({ host: z.string(), id: z.string() }))
    //   .mutation(async ({ input }) => {
    //     // get config from DB
    //     let config_res = await prisma.interfaceConfigBackups.findUnique({
    //       where: { id: input.id },
    //     });
    //     if (!config_res)
    //       throw new TRPCError({
    //         code: "NOT_FOUND",
    //         message: "Backup not found.",
    //         cause: config_res,
    //       });
    //     if (config_res.host !== input.host)
    //       throw new TRPCError({
    //         code: "BAD_REQUEST",
    //         message: "Backup does not belong to this host.",
    //         cause: config_res,
    //       });

    //     // get switch info for query
    //     let { switch_address, switch_os } = await get_switch_info(input.host);
    //     if (switch_os === "Arista_EOS") {
    //       // send the commands to the switch
    //       let switch_res = await arista_switch_query<{}[]>(switch_address, [
    //         "configure terminal",
    //         ...config_res.config.toString("utf8").split("\n"),
    //       ]);

    //       if (!switch_res.result)
    //         throw new TRPCError({
    //           code: "INTERNAL_SERVER_ERROR",
    //           message: "Switch returned an error response.",
    //           cause: switch_res,
    //         });
    //     }
    //   }),
  }),
  // backups: privateProcedure.input(z.string()).query(async ({ input }) => {
  //   let backups = await prisma.interfaceConfigBackups.findMany({
  //     where: { host: input },
  //     orderBy: { created_at: "desc" },
  //   });

  //   return backups.map((backup) => {
  //     return {
  //       id: backup.id,
  //       description: backup.description,
  //       created_at: backup.created_at,
  //       config: backup.config.toString("utf8"),
  //     };
  //   });
  // }),
});
