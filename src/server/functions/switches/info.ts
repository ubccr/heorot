import { TRPCError } from "@trpc/server";
import { grendel_host_find } from "../grendel";

export async function get_switch_info(node: string) {
  const grendel_res = await grendel_host_find(node);
  if (!grendel_res[0] || grendel_res.length === 0)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Host not found.",
      cause: grendel_res,
    });
  // Find switch OS version from grendel tags
  const switch_os = grendel_res[0].tags.find((tag: string) =>
    ["Arista_EOS", "Dell_OS10"].includes(tag)
  );
  if (!switch_os)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Switch OS tag not found.",
      cause: grendel_res[0].tags,
    });
  // Find switch BMC interface
  const switch_bmc = grendel_res[0].interfaces.find((int) => int.bmc === true);
  if (!switch_bmc)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Switch BMC interface not found.",
      cause: grendel_res[0].interfaces,
    });
  // Use FQDN if available, otherwise fallback to IP
  const switch_address =
    switch_bmc.fqdn !== "" ? switch_bmc.fqdn : switch_bmc.ip;

  return { switch_address, switch_os };
}