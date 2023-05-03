import { z } from "zod";

// TODO: Can Zod do Generics?
// export const arista_response_schema = z.object({
//   id: z.string(),
//   jsonrpc: z.string(),
//   result: z.custom(),
// })
export type arista_response<T, U = void, V = void> = {
  id: string;
  jsonrpc: string;
  result?: [T, U, V];
  error?: {
    data: {
      errors?: string[];
    }[];
  };
};

export const arista_show_version_schema = z.object({
  imageFormatVersion: z.string(),
  uptime: z.number(),
  modelName: z.string(),
  internalVersion: z.string(),
  memTotal: z.number(),
  mfgName: z.string(),
  serialNumber: z.string(),
  systemMacAddress: z.string(),
  bootupTimestamp: z.number(),
  memFree: z.number(),
  version: z.string(),
  configMacAddress: z.string(),
  isIntlVersion: z.boolean(),
  imageOptimization: z.string(),
  internalBuildId: z.string(),
  hardwareRevision: z.string(),
  hwMacAddress: z.string(),
  architecture: z.string(),
});
export type arista_show_version = z.infer<typeof arista_show_version_schema>;

export const arista_show_running_config_schema = z.object({
  output: z.string(),
  warnings: z.string().array().optional(), //TODO: verify
});

export type arista_show_running_config = z.infer<
  typeof arista_show_running_config_schema
>;

export const arista_show_interfaces_status_schema = z.object({
  interfaceStatuses: z.record(
    z.string(),
    z.object({
      vlanInformation: z.object({
        interfaceMode: z.string().optional(),
        vlanId: z.number().optional(),
        vlanExplanation: z.string().optional(),
        interfaceForwardingModel: z.string(),
      }),
      bandwidth: z.number(),
      interfaceType: z.string(),
      description: z.string(),
      autoNegotiateActive: z.boolean(),
      duplex: z.string(),
      autoNegotigateActive: z.boolean(),
      linkStatus: z.string(),
      lineProtocolStatus: z.string().optional(),
    })
  ),
});

export type arista_show_interfaces_status = z.infer<
  typeof arista_show_interfaces_status_schema
>;
