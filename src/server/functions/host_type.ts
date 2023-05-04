import { env } from "~/env.mjs";

export function host_type(host: string) {
  const name_arr = host.split("-");

  const prefix_nodes = env.PREFIX_NODES.split(",");
  const prefix_switches = env.PREFIX_SWITCHES.split(",");
  const prefix_power = env.PREFIX_POWER.split(",");

  if (!name_arr[0]) return "";

  if (prefix_nodes.includes(name_arr[0])) return "node";
  if (prefix_switches.includes(name_arr[0])) return "switch";
  if (prefix_power.includes(name_arr[0])) return "power";

  return "";
}
