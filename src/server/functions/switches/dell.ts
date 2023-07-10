import type {
  dell_os10_show_interfaces_status,
  dell_os10_show_inventory,
  dell_os10_show_mac_address_table,
} from "~/types/dell";

import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";
import got from "got";
import { prisma } from "~/server/db";

const Authorization = `Basic ${Buffer.from(`${env.SWITCH_USERNAME}:${env.SWITCH_PASSWORD}`).toString(`base64`)}`;

export const get_dell_os10_show_interfaces_status = async (switch_address: string, host: string) => {
  try {
    // TODO: support http & https?
    const url = `https://${switch_address}/restconf/data/ietf-interfaces:interfaces-state/interface`;
    const interface_status_res: dell_os10_show_interfaces_status = await got(url, {
      headers: {
        Authorization,
      },
      https: { rejectUnauthorized: false },
    }).json();

    for (const iface of interface_status_res["ietf-interfaces:interface"]) {
      // ensure port matches naming convention:
      let port = "";
      if (iface.name.match(/ethernet/gi) && iface.name.match(/[0-9]\/[0-9]\/[0-9]{1,2}/g)) {
        // OS10 port: 1/1/32 | OS10 breakout port: 1/1/32:1

        const port_arr = iface.name.replace(/ethernet/gi, "").split("/") as [string, string, string];
        const breakout = port_arr[2].split(":") as [string, string | undefined];

        port = `${port_arr[1]}/${breakout[0]}/${breakout[1] ?? "1"}`;
      }
      const update = {
        host: host,
        port,
        port_name: iface.name,
        port_mode: iface["dell-ethernet:mode"],
        vlan_id: parseInt(iface["dell-ethernet:untagged-vlan"]?.replace("vlan", "") ?? "0"),
        vlan_info: iface["dell-ethernet:member-ports"]?.map((val) => val.name).join(","),
        speed: parseInt(iface.speed ?? "0"),
        type: iface["dell-lacp:lacp-status"].mode ?? "",
        description: iface["dell-ethernet:description"] ?? "",
        auto_negotiation: iface["dell-interface:auto-negotiation"],
        duplex: iface["dell-interface:duplex"] ?? "",
        link_status: iface["oper-status"],
        line_protocol_status: iface["oper-status"],
      };
      await prisma.interfaceStatus.upsert({
        where: { host_port_name: { host: host, port_name: iface.name } },
        update,
        create: update,
      });
    }
  } catch (error) {
    console.error(error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error getting interface statuses",
      cause: error,
    });
  }
};

export const get_dell_os10_show_inventory = async (switch_address: string, name: string) => {
  // TODO: support http & https?
  const url = `https://${switch_address}/restconf/data/dell-equipment:system`;
  const inventory_res: dell_os10_show_inventory = await got(url, {
    headers: {
      Authorization,
    },
    https: { rejectUnauthorized: false },
  }).json();

  const inventory = inventory_res["dell-equipment:system"];

  const update = {
    host: name,
    manufacturer: inventory.node["mfg-info"]["vendor-name"],
    serial: inventory.node["mfg-info"]["service-tag"],
    model: inventory.node["mfg-info"]["product-name"],
    version: inventory.inventory["sw-version"],
  };
  await prisma.switch.upsert({
    where: { host: name },
    update,
    create: update,
  });
};

export const get_dell_os10_show_mac_address_table = async (switch_address: string) => {
  const url = `https://${switch_address}/restconf/data/oper-params/fwd-table`;
  const mac_address_table_res: dell_os10_show_mac_address_table = await got(url, {
    headers: {
      Authorization,
    },
    https: { rejectUnauthorized: false },
  }).json();
  return mac_address_table_res["dell-l2-mac:fwd-table"];
};

// export const update_dell_os10_description = async (
//   switch_address: string,
//   ports: string[],
//   descriptions: string[]
// ) => {
//   const remove_description = description === "" ? true : false;

//   const url = `https://${switch_address}/restconf/data/ietf-interfaces:interfaces`;
//   const remove_url = `${url}/interface=${port}/description`;

//   if (!remove_description) {
//     const edit_res = await got.patch(url, {
//       headers: { Authorization },
//       https: { rejectUnauthorized: false },
//     });
//     if (!edit_res.ok)
//       throw new TRPCError({
//         code: "INTERNAL_SERVER_ERROR",
//         message: "Error editing port description",
//         cause: edit_res,
//       });
//   } else {
//     const remove_res = await got.delete(remove_url, {
//       headers: { Authorization },
//       https: { rejectUnauthorized: false },
//     });
//     if (!remove_res.ok)
//       throw new TRPCError({
//         code: "INTERNAL_SERVER_ERROR",
//         message: "Error removing port description",
//         cause: remove_res,
//       });
//   }
// };
