"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Zod test for redfish systems
// /redfish/v1/Systems/System.Embedded.1
// export const Redfish_Systems_Schema = z.object({
//   "@Redfish.Settings": z
//     .object({
//       "@odata.context": z.string(),
//       "@odata.type": z.string(),
//       SettingsObject: Attributes,
//       SupportedApplyTimes: z.array(z.string()),
//     })
//     .optional(),
//   "@odata.context": z.string(),
//   "@odata.id": z.string(),
//   "@odata.type": z.string(),
//   Actions: z.object({
//     "#ComputerSystem.Reset": z.object({
//       target: z.string(),
//       "ResetType@Redfish.AllowableValues": z.array(z.string()),
//     }),
//   }),
//   AssetTag: z.string(),
//   Bios: Attributes,
//   BiosVersion: z.string(),
//   BootProgress: z
//     .object({
//       LastState: z.string(),
//     })
//     .optional(),
//   Boot: z.object({
//     BootOptions: Attributes.optional(),
//     Certificates: Attributes.optional(),
//     BootOrder: z.array(z.string()).optional(),
//     "BootOrder@odata.count": z.number().optional(),
//     BootSourceOverrideEnabled: z.string(),
//     BootSourceOverrideMode: z.string().optional(),
//     BootSourceOverrideTarget: z.string(),
//     UefiTargetBootSourceOverride: z.string().nullable().optional(),
//     "BootSourceOverrideTarget@Redfish.AllowableValues": z.array(z.string()),
//     StopBootOnFault: z.string().optional(),
//   }),
//   Description: z.string(),
//   EthernetInterfaces: Attributes,
//   GraphicalConsole: z
//     .object({
//       ConnectTypesSupported: z.array(z.string()),
//       "ConnectTypesSupported@odata.count": z.number(),
//       MaxConcurrentSessions: z.number(),
//       ServiceEnabled: z.boolean(),
//     })
//     .optional(),
//   HostName: z.string(),
//   HostWatchdogTimer: z
//     .object({
//       FunctionEnabled: z.boolean(),
//       Status: z.object({
//         State: z.string(),
//       }),
//       TimeoutAction: z.string(),
//     })
//     .optional(),
//   HostingRoles: z.array(z.string()).optional(), //? unverified
//   "HostingRoles@odata.count": z.number().optional(),
//   Id: z.string(),
//   IndicatorLED: z.string(),
//   Links: z.object({
//     Chassis: z.array(Attributes),
//     "Chassis@odata.count": z.number(),
//     CooledBy: z.array(Attributes),
//     "CooledBy@odata.count": z.number(),
//     ManagedBy: z.array(Attributes),
//     "ManagedBy@odata.count": z.number(),
//     Oem: z.object({
//       Dell: z
//         .object({
//           "@odata.type": z.string(),
//           BootOrder: Attributes,
//           DellBootSources: Attributes,
//           DellSoftwareInstallationService: Attributes,
//           DellVideoCollection: Attributes,
//           DellChassisCollection: Attributes,
//           DellPresenceAndStatusSensorCollection: Attributes,
//           DellSensorCollection: Attributes,
//           DellRollupStatusCollection: Attributes,
//           DellPSNumericSensorCollection: Attributes,
//           DellVideoNetworkCollection: Attributes,
//           DellOSDeploymentService: Attributes,
//           DellMetricService: Attributes,
//           DellGPUSensorCollection: Attributes,
//           DellRaidService: Attributes,
//           DellNumericSensorCollection: Attributes,
//           DellBIOSService: Attributes,
//           DellSlotCollection: Attributes,
//         })
//         .optional(),
//     }),
//     PoweredBy: z.array(Attributes),
//     "PoweredBy@odata.count": z.number(),
//   }),
//   LastResetTime: z.string().optional(),
//   LocationIndicatorActive: z.boolean().optional(),
//   Manufacturer: z.string(),
//   Memory: Attributes,
//   MemorySummary: z.object({
//     MemoryMirroring: z.string().optional(),
//     Status: z.object({
//       Health: z.string(),
//       HealthRollup: z.string(),
//       State: z.string(),
//     }),
//     TotalSystemMemoryGiB: z.number(),
//   }),
//   Model: z.string(),
//   Name: z.string(),
//   NetworkInterfaces: Attributes,
//   Oem: z
//     .object({
//       Dell: z.object({
//         "@odata.type": z.string(),
//         DellSystem: z.object({
//           BIOSReleaseDate: z.string(),
//           BaseBoardChassisSlot: z.string(),
//           BatteryRollupStatus: z.string(),
//           BladeGeometry: z.string(),
//           CMCIP: z.string().nullable(),
//           CPURollupStatus: z.string(),
//           ChassisModel: z.string().nullable(),
//           ChassisName: z.string(),
//           ChassisServiceTag: z.string(),
//           ChassisSystemHeightUnit: z.number(),
//           CurrentRollupStatus: z.string(),
//           EstimatedExhaustTemperatureCelsius: z.number(),
//           EstimatedSystemAirflowCFM: z.number(),
//           ExpressServiceCode: z.string(),
//           FanRollupStatus: z.string(),
//           Id: z.string(),
//           IDSDMRollupStatus: z.string().nullable(),
//           IntrusionRollupStatus: z.string(),
//           IsOEMBranded: z.string(),
//           LastSystemInventoryTime: z.string(),
//           LastUpdateTime: z.string(),
//           LicensingRollupStatus: z.string(),
//           ManagedSystemSize: z.string(),
//           MaxCPUSockets: z.number(),
//           MaxDIMMSlots: z.number(),
//           MaxPCIeSlots: z.number(),
//           MemoryOperationMode: z.string(),
//           Name: z.string(),
//           NodeID: z.string(),
//           PSRollupStatus: z.string(),
//           PlatformGUID: z.string(),
//           PopulatedDIMMSlots: z.number(),
//           PopulatedPCIeSlots: z.number(),
//           PowerCapEnabledState: z.string(),
//           SDCardRollupStatus: z.string().nullable(),
//           SELRollupStatus: z.string(),
//           ServerAllocationWatts: z.string().nullable(),
//           StorageRollupStatus: z.string(),
//           SysMemErrorMethodology: z.string(),
//           SysMemFailOverState: z.string(),
//           SysMemLocation: z.string(),
//           SysMemPrimaryStatus: z.string(),
//           SystemGeneration: z.string(),
//           SystemID: z.number(),
//           SystemRevision: z.string(),
//           TempRollupStatus: z.string(),
//           TempStatisticsRollupStatus: z.string(),
//           UUID: z.string(),
//           VoltRollupStatus: z.string(),
//           smbiosGUID: z.string(),
//           "@odata.context": z.string(),
//           "@odata.type": z.string(),
//           "@odata.id": z.string(),
//         }),
//       }),
//     })
//     .optional(),
//   PCIeDevices: z.array(Attributes).optional(),
//   "PCIeDevices@odata.count": z.number().optional(),
//   PCIeFunctions: z.array(Attributes).optional(),
//   "PCIeFunctions@odata.count": z.number().optional(),
//   PartNumber: z.string(),
//   PowerState: z.string(),
//   ProcessorSummary: z.object({
//     Count: z.number(),
//     CoreCount: z.number().optional(),
//     LogicalProcessorCount: z.number().optional(),
//     Model: z.string(),
//     Status: z.object({
//       Health: z.string(),
//       HealthRollup: z.string(),
//       State: z.string(),
//     }),
//     ThreadingEnabled: z.boolean().optional(),
//   }),
//   Processors: Attributes,
//   SKU: z.string(),
//   SecureBoot: Attributes.optional(),
//   SerialNumber: z.string(),
//   SimpleStorage: Attributes,
//   Status: z.object({
//     Health: z.string(),
//     HealthRollup: z.string(),
//     State: z.string(),
//   }),
//   Storage: Attributes,
//   SystemType: z.string(),
//   TrustedModules: z
//     .array(
//       z.object({
//         FirmwareVersion: z.string(),
//         InterfaceType: z.string().nullable(),
//         Status: z.object({
//           State: z.string(),
//         }),
//       })
//     )
//     .optional(),
//   "TrustedModules@odata.count": z.number().optional(),
//   UUID: z.string(),
//   VirtualMedia: Attributes.optional(),
//   VirtualMediaConfig: z
//     .object({
//       ServiceEnabled: z.boolean(),
//     })
//     .optional(),
// })
// export type Redfish_Systems = z.infer<typeof Redfish_Systems_Schema>
