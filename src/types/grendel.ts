import { z } from "zod";

export const grendel_host_schema = z
  .object({
    id: z.string(),
    firmware: z.string(),
    name: z.string(), //.regex(/[a-z]{3}-[a-z]{1}[0-9]{2}-[0-9]{2}/)
    interfaces: z
      .object({
        mac: z.string(),
        ip: z.string(),
        ifname: z.string(),
        fqdn: z.string(),
        bmc: z.boolean(),
        mtu: z.number(),
        vlan: z.string(),
      })
      .array(),
    provision: z.boolean(),
    boot_image: z.string(),
    tags: z.string().array(),
  })
  .array();
export type IGrendelHost = z.infer<typeof grendel_host_schema>;

export const grendel_image_schema = z
  .object({
    name: z.string(),
    id: z.string(),
    kernel: z.string(),
    initrd: z.string().array(),
    liveimg: z.string(),
    cmdline: z.string(),
    verify: z.boolean(),
  })
  .array();

export type IGrendelImage = z.infer<typeof grendel_image_schema>;
