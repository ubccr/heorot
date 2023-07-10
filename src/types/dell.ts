import { z } from "zod";

export const dell_redfish_systems_schema = z.object({
  AssetTag: z.string(),
  BiosVersion: z.string(),
  BootProgress: z.object({
    LastState: z.string(),
  }),
  Boot: z.object({
    BootOrder: z.string().array(),
    "BootOrder@odata.count": z.number(),
    BootSourceOverrideEnabled: z.string(),
    BootSourceOverrideMode: z.string(),
    BootSourceOverrideTarget: z.string(),
    // "UefiTargetBootSourceOverride": null,
    "BootSourceOverrideTarget@Redfish.AllowableValues": z.string().array(),
    StopBootOnFault: z.string(),
  }),
  Description: z.string(),
  HostName: z.string(),
  Id: z.string(),
  LastResetTime: z.string(),
  LocationIndicatorActive: z.boolean(),
  Manufacturer: z.string(),
  MemorySummary: z.object({
    MemoryMirroring: z.string(),
    TotalSystemMemoryGiB: z.number(),
  }),
  Model: z.string(),
  Name: z.string(),
  Oem: z.object({
    Dell: z.object({
      "@odata.type": z.string(),
      DellSystem: z.object({
        BIOSReleaseDate: z.string(),
        BaseBoardChassisSlot: z.string(),
        BatteryRollupStatus: z.string(),
        BladeGeometry: z.string(),
        // "CMCIP": null,
        CPURollupStatus: z.string(),
        // "ChassisModel": null,
        ChassisName: z.string(),
        ChassisServiceTag: z.string(),
        ChassisSystemHeightUnit: z.number(),
        CurrentRollupStatus: z.string(),
        EstimatedExhaustTemperatureCelsius: z.number(),
        EstimatedSystemAirflowCFM: z.number(),
        ExpressServiceCode: z.string(),
        FanRollupStatus: z.string(),
        Id: z.string(),
        // "IDSDMRollupStatus": null,
        IntrusionRollupStatus: z.string(),
        IsOEMBranded: z.string(),
        LastSystemInventoryTime: z.string(),
        LastUpdateTime: z.string(),
        LicensingRollupStatus: z.string(),
        ManagedSystemSize: z.string(),
        MaxCPUSockets: z.number(),
        MaxDIMMSlots: z.number(),
        MaxPCIeSlots: z.number(),
        MemoryOperationMode: z.string(),
        Name: z.string(),
        NodeID: z.string(),
        PSRollupStatus: z.string(),
        PlatformGUID: z.string(),
        PopulatedDIMMSlots: z.number(),
        PopulatedPCIeSlots: z.number(),
        PowerCapEnabledState: z.string(),
        // "SDCardRollupStatus": null,
        SELRollupStatus: z.string(),
        // "ServerAllocationWatts": null,
        StorageRollupStatus: z.string(),
        SysMemErrorMethodology: z.string(),
        SysMemFailOverState: z.string(),
        SysMemLocation: z.string(),
        SysMemPrimaryStatus: z.string(),
        SystemGeneration: z.string(),
        SystemID: z.number(),
        SystemRevision: z.string(),
        TempRollupStatus: z.string(),
        TempStatisticsRollupStatus: z.string(),
        UUID: z.string(),
        VoltRollupStatus: z.string(),
        smbiosGUID: z.string(),
        "@odata.context": z.string(),
        "@odata.type": z.string(),
        "@odata.id": z.string(),
      }),
    }),
  }),
  PartNumber: z.string(),
  PowerState: z.string(),
  ProcessorSummary: z.object({
    Count: z.number(),
    CoreCount: z.number(),
    LogicalProcessorCount: z.number(),
    Model: z.string(),
    ThreadingEnabled: z.boolean(),
  }),
  SKU: z.string(),
  SerialNumber: z.string(),
  Status: z.object({
    Health: z.string(),
    HealthRollup: z.string(),
    State: z.string(),
  }),
  SystemType: z.string(),
  UUID: z.string(),
});
export type dell_redfish_systems = z.infer<typeof dell_redfish_systems_schema>;

export const dell_redfish_systems_software_installation_servise_get_repo_updates_schema = z.object({
  "@Message.ExtendedInfo": z
    .object({
      Message: z.string(),
      // "MessageArgs": [],
      // "MessageArgs@odata.count": 0,
      MessageId: z.string(),
      // "RelatedProperties": [],
      // "RelatedProperties@odata.count": 0,
      Resolution: z.string(),
      Severity: z.string(),
    })
    .array(),
  PackageList: z.string(),
});
export type dell_redfish_systems_software_installation_servise_get_repo_updates = z.infer<
  typeof dell_redfish_systems_software_installation_servise_get_repo_updates_schema
>;

export const dell_redfish_manager_job_status_schema = z.object({
  "@odata.context": z.string(),
  "@odata.id": z.string(),
  "@odata.type": z.string(),
  // "ActualRunningStartTime": null,
  // "ActualRunningStopTime": null,
  CompletionTime: z.string().nullable(),
  Description: z.string(),
  // "EndTime": null,
  Id: z.string(),
  JobState: z.string(),
  JobType: z.string(),
  Message: z.string(),
  // "MessageArgs": [],
  // "MessageArgs@odata.count": 0,
  MessageId: z.string(),
  Name: z.string(),
  PercentComplete: z.number(),
  StartTime: z.string(),
  // "TargetSettingsURI": null
});
export type dell_redfish_manager_job_status = z.infer<typeof dell_redfish_manager_job_status_schema>;

export const dell_redfish_chassis_schema = z.object({
  "@odata.context": z.string(),
  "@odata.id": z.string(),
  "@odata.type": z.string(),
  Actions: z.object({
    "#Chassis.Reset": z.object({
      "ResetType@Redfish.AllowableValues": z.string().array(),
      target: z.string(),
    }),
  }),
  Assembly: z.object({
    "@odata.id": z.string(),
  }),
  AssetTag: z.string().nullable(),
  ChassisType: z.string(),
  Description: z.string(),
  EnvironmentalClass: z.string(),
  Id: z.string(),
  IndicatorLED: z.string(),
  "IndicatorLED@Redfish.Deprecated": z.string(),
  Links: z.object({
    ComputerSystems: z
      .object({
        "@odata.id": z.string(),
      })
      .array(),
    "ComputerSystems@odata.count": z.number(),
    Contains: z
      .object({
        "@odata.id": z.string(),
      })
      .array(),
    "Contains@odata.count": z.number(),
    CooledBy: z
      .object({
        "@odata.id": z.string(),
      })
      .array(),
    "CooledBy@odata.count": z.number(),
    // "Drives": [],
    // "Drives@odata.count": z.number(),
    ManagedBy: z.object({
      "@odata.id": z.string(),
    }),
    "ManagedBy@odata.count": z.number(),
    ManagersInChassis: z.object({
      "@odata.id": z.string(),
    }),
    "ManagersInChassis@odata.count": z.number(),
    PCIeDevices: z
      .object({
        "@odata.id": z.string(),
      })
      .array(),
    "PCIeDevices@Redfish.Deprecated": z.string(),
    "PCIeDevices@odata.count": z.number(),
    PoweredBy: z
      .object({
        "@odata.id": z.string(),
      })
      .array(),
    "PoweredBy@odata.count": z.number(),
    Processors: z
      .object({
        "@odata.id": z.string(),
      })
      .array(),
    "Processors@odata.count": z.number(),
    Storage: z
      .object({
        "@odata.id": z.string(),
      })
      .array(),
    "Storage@odata.count": z.number(),
  }),
  Location: z.object({
    Info: z.string(),
    InfoFormat: z.string(),
    Placement: z.object({
      Rack: z.string(),
      RackOffset: z.number(),
      RackOffsetUnits: z.string(),
      Row: z.string(),
    }),
    PostalAddress: z.object({
      Building: z.string(),
      Room: z.string(),
    }),
  }),
  LocationIndicatorActive: z.boolean(),
  Manufacturer: z.string(),
  Memory: z.object({
    "@odata.id": z.string(),
  }),
  Model: z.string(),
  Name: z.string(),
  NetworkAdapters: z.object({
    "@odata.id": z.string(),
  }),
  Oem: z.object({
    Dell: z.object({
      "@odata.type": z.string(),
      DellChassis: z.object({
        "@odata.context": z.string(),
        "@odata.id": z.string(),
        "@odata.type": z.string(),
        CanBeFRUed: z.boolean(),
        Description: z.string(),
        Id: z.string(),
        Links: z.object({
          ComputerSystem: z.object({
            "@odata.id": z.string(),
          }),
        }),
        Name: z.string(),
        SystemID: z.number(),
      }),
    }),
  }),
  PCIeDevices: z.object({
    "@odata.id": z.string(),
  }),
  PCIeSlots: z.object({
    "@odata.id": z.string(),
  }),
  PartNumber: z.string(),
  PhysicalSecurity: z.object({
    IntrusionSensor: z.string(),
    IntrusionSensorNumber: z.number(),
    IntrusionSensorReArm: z.string(),
  }),
  Power: z.object({
    "@odata.id": z.string(),
  }),
  "Power@Redfish.Deprecated": z.string(),
  PowerState: z.string(),
  PowerSubsystem: z.object({
    "@odata.id": z.string(),
  }),
  SKU: z.string(),
  Sensors: z.object({
    "@odata.id": z.string(),
  }),
  SerialNumber: z.string(),
  Status: z.object({
    Health: z.string(),
    HealthRollup: z.string(),
    State: z.string(),
  }),
  Thermal: z.object({
    "@odata.id": z.string(),
  }),
  "Thermal@Redfish.Deprecated": z.string(),
  ThermalSubsystem: z.object({
    "@odata.id": z.string(),
  }),
  UUID: z.string(),
});

export type dell_redfish_chassis = z.infer<typeof dell_redfish_chassis_schema>;

export const dell_redfish_update_service_firmware_inventory_schema = z.object({
  "@odata.context": z.string(),
  "@odata.id": z.string(),
  "@odata.type": z.string(),
  Description: z.string(),
  Members: z
    .object({
      "@odata.id": z.string(),
    })
    .array(),
  "Members@odata.count": z.number(),
  Name: z.string(),
});
export type dell_redfish_update_service_firmware_inventory = z.infer<
  typeof dell_redfish_update_service_firmware_inventory_schema
>;

export const dell_redfish_update_service_firmware_inventory_id_schema = z.object({
  "@odata.context": z.string(),
  "@odata.id": z.string(),
  "@odata.type": z.string(),
  Description: z.string(),
  Id: z.string(),
  Name: z.string(),
  Oem: z.object({
    Dell: z.object({
      "@odata.type": z.string(),
      DellSoftwareInventory: z.object({
        "@odata.context": z.string(),
        "@odata.id": z.string(),
        "@odata.type": z.string(),
        BuildNumber: z.number(),
        Classifications: z.string().array(),
        "Classifications@odata.count": z.number(),
        ComponentID: z.string(),
        ComponentType: z.string(),
        Description: z.string(),
        DeviceID: z.string(),
        ElementName: z.string(),
        HashValue: z.string(),
        Id: z.string(),
        IdentityInfoType: z.string().array(),
        "IdentityInfoType@odata.count": z.number(),
        IdentityInfoValue: z.string().array(),
        "IdentityInfoValue@odata.count": z.number(),
        InstallationDate: z.string(),
        IsEntity: z.boolean(),
        MajorVersion: z.number(),
        MinorVersion: z.number(),
        Name: z.string(),
        PLDMCapabilitiesDuringUpdate: z.string(),
        PLDMFDPCapabilitiesDuringUpdate: z.string(),
        RevisionNumber: z.number(),
        RevisionString: z.string().nullable(), //?
        SidebandUpdateCapable: z.boolean(),
        Status: z.string(),
        SubDeviceID: z.string(),
        SubVendorID: z.string(),
        VendorID: z.string(),
        impactsTPMmeasurements: z.boolean(),
      }),
    }),
  }),
  ReleaseDate: z.string(),
  SoftwareId: z.string(),
  Status: z.object({
    Health: z.string(),
    State: z.string(),
  }),
  Updateable: z.boolean(),
  Version: z.string(),
});
export type dell_redfish_update_service_firmware_inventory_id = z.infer<
  typeof dell_redfish_update_service_firmware_inventory_id_schema
>;

export const dell_os10_show_inventory_schema = z.object({
  "dell-equipment:system": z.object({
    node: z.object({
      "node-id": z.number(),
      "node-mac": z.string(),
      "number-of-mac-addresses": z.number(),
      "comm-dev-service-tag": z.string(),
      "mfg-info": z.object({
        "vendor-name": z.string(),
        "product-name": z.string(),
        "hw-version": z.string(),
        "platform-name": z.string(),
        ppid: z.string(),
        "service-tag": z.string(),
        "diagos-revision": z.string(),
        "service-code": z.string(),
        "product-base": z.string(),
        "product-serial-number": z.string(),
        "product-part-number": z.string(),
        "pcie-version": z.string(),
      }),
      unit: z
        .object({
          "unit-id": z.number(),
          "current-unit-model": z.string(),
          "provisioned-unit-model": z.string(),
          "unit-state": z.string(),
          "software-version": z.string(),
          "port-info": z.string(),
          "mfg-info": z.object({
            "vendor-name": z.string(),
            "product-name": z.string(),
            "hw-version": z.string(),
            "platform-name": z.string(),
            ppid: z.string(),
            "part-number": z.string(),
            "service-tag": z.string(),
            "service-code": z.string(),
          }),
          "down-reason": z.string(),
          descr: z.string(),
          beacon_led_state: z.boolean(),
          "system-identifier-id": z.number(),
          dom: z.boolean(),
          firmware: z
            .object({
              "firmware-name": z.string(),
              "firmware-version": z.string(),
            })
            .array(),
          "ptp-supported": z.boolean(),
        })
        .array(),
      "power-supply": z
        .object({
          "psu-id": z.number(),
          status: z.string(),
          "power-type": z.string().optional(),
          "avg-power-start-time": z.string().optional(),
          "fan-info": z
            .object({
              "fan-id": z.number(),
              "fan-status": z.string(),
              "fan-speed-rpm": z.number(),
            })
            .array()
            .optional(),
          "air-flow": z.string().optional(),
          "mfg-info": z.object({
            "vendor-name": z.string().optional(),
            "product-name": z.string().optional(),
            "hw-version": z.string().optional(),
            "platform-name": z.string().optional(),
            ppid: z.string().optional(),
            "part-number": z.string().optional(),
            "service-tag": z.string().optional(),
            "service-code": z.string().optional(),
          }),
        })
        .array(),
      "fan-tray": z
        .object({
          "fan-tray-id": z.number(),
          status: z.string(),
          "fan-info": z
            .object({
              "fan-id": z.number(),
              "fan-status": z.string(),
              "fan-speed-rpm": z.number(),
            })
            .array(),
          "air-flow": z.string(),
          "mfg-info": z.object({
            "vendor-name": z.string(),
            "product-name": z.string(),
            "hw-version": z.string(),
            "platform-name": z.string(),
            ppid: z.string(),
            "part-number": z.string(),
            "service-tag": z.string(),
            "service-code": z.string(),
          }),
        })
        .array(),
    }),
    environment: z.object({
      unit: z
        .object({
          "unit-id": z.number(),
          "unit-state": z.string(),
          "unit-temp": z.number(),
        })
        .array(),
      "thermal-sensor": z
        .object({
          "unit-id": z.number(),
          "sensor-id": z.number(),
          "sensor-name": z.string(),
          "sensor-temp": z.number(),
        })
        .array(),
    }),
    inventory: z.object({
      "sw-version": z.string(),
    }),
  }),
});

export type dell_os10_show_inventory = z.infer<typeof dell_os10_show_inventory_schema>;

export const dell_os10_show_interfaces_status_schema = z.object({
  "ietf-interfaces:interface": z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      "admin-status": z.string(),
      "oper-status": z.string(),
      "if-index": z.number(),
      "phys-address": z.string().optional(),
      speed: z.string().optional(),
      // statistics: z.object({
      //   "in-octets": z.string().optional(),
      //   "in-unicast-pkts": z.string().optional(),
      //   "in-broadcast-pkts": z.string().optional(),
      //   "in-multicast-pkts": z.string().optional(),
      //   "in-discards": z.number().optional(),
      //   "in-errors": z.number().optional(),
      //   "in-unknown-protos": z.number().optional(),
      //   "out-octets": z.string().optional(),
      //   "out-unicast-pkts": z.string().optional(),
      //   "out-broadcast-pkts": z.string().optional(),
      //   "out-multicast-pkts": z.string().optional(),
      //   "out-discards": z.number().optional(),
      //   "out-errors": z.number().optional(),
      //   "dell-interface:if-out-qlen": z.string().optional(),
      //   "dell-interface:ether-drop-events": z.string().optional(),
      //   "dell-interface:ether-multicast-pkts": z.string().optional(),
      //   "dell-interface:ether-broadcast-pkts": z.string().optional(),
      //   "dell-interface:ether-undersize-pkts": z.string().optional(),
      //   "dell-interface:ether-fragments": z.string().optional(),
      //   "dell-interface:ether-oversize-pkts": z.string().optional(),
      //   "dell-interface:ether-rx-oversize-pkts": z.string().optional(),
      //   "dell-interface:ether-tx-oversize-pkts": z.string().optional(),
      //   "dell-interface:ether-jabbers": z.string().optional(),
      //   "dell-interface:ether-octets": z.string().optional(),
      //   "dell-interface:ether-pkts": z.string().optional(),
      //   "dell-interface:ether-collisions": z.string().optional(),
      //   "dell-interface:ether-crc-align-errors": z.string().optional(),
      //   "dell-interface:ether-tx-no-errors": z.string().optional(),
      //   "dell-interface:ether-rx-no-errors": z.string().optional(),
      //   "dell-interface:green-discard-dropped-packets": z.string().optional(),
      //   "dell-interface:yellow-discard-dropped-packets": z.string().optional(),
      //   "dell-interface:red-discard-dropped-packets": z.string().optional(),
      //   "dell-interface:ecn-marked-packets": z.string().optional(),
      //   "dell-interface:ether-in-pkts-64-octets": z.string().optional(),
      //   "dell-interface:ether-in-pkts-65-to-127-octets": z.string().optional(),
      //   "dell-interface:ether-in-pkts-128-to-255-octets": z.string().optional(),
      //   "dell-interface:ether-in-pkts-256-to-511-octets": z.string().optional(),
      //   "dell-interface:ether-in-pkts-512-to-1023-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-in-pkts-1024-to-1518-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-in-pkts-1519-to-2047-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-in-pkts-2048-to-4095-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-in-pkts-4096-to-9216-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-in-pkts-9217-to-16383-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-out-pkts-64-octets": z.string().optional(),
      //   "dell-interface:ether-out-pkts-65-to-127-octets": z.string().optional(),
      //   "dell-interface:ether-out-pkts-128-to-255-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-out-pkts-256-to-511-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-out-pkts-512-to-1023-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-out-pkts-1024-to-1518-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-out-pkts-1519-to-2047-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-out-pkts-2048-to-4095-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-out-pkts-4096-to-9216-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:ether-out-pkts-9217-to-16383-octets": z
      //     .string()
      //     .optional(),
      //   "dell-interface:pause-rx-pkts": z.string().optional(),
      //   "dell-interface:pause-tx-pkts": z.string().optional(),
      //   "dell-interface:pfc-0-rx-pkts": z.string().optional(),
      //   "dell-interface:pfc-0-tx-pkts": z.string().optional(),
      //   "dell-interface:pfc-1-rx-pkts": z.string().optional(),
      //   "dell-interface:pfc-1-tx-pkts": z.string().optional(),
      //   "dell-interface:pfc-2-rx-pkts": z.string().optional(),
      //   "dell-interface:pfc-2-tx-pkts": z.string().optional(),
      //   "dell-interface:pfc-3-rx-pkts": z.string().optional(),
      //   "dell-interface:pfc-3-tx-pkts": z.string().optional(),
      //   "dell-interface:pfc-4-rx-pkts": z.string().optional(),
      //   "dell-interface:pfc-4-tx-pkts": z.string().optional(),
      //   "dell-interface:pfc-5-rx-pkts": z.string().optional(),
      //   "dell-interface:pfc-5-tx-pkts": z.string().optional(),
      //   "dell-interface:pfc-6-rx-pkts": z.string().optional(),
      //   "dell-interface:pfc-6-tx-pkts": z.string().optional(),
      //   "dell-interface:pfc-7-rx-pkts": z.string().optional(),
      //   "dell-interface:pfc-7-tx-pkts": z.string().optional(),
      //   "dell-interface:tx-lpi-count": z.string().optional(),
      //   "dell-interface:tx-lpi-duration": z.string().optional(),
      //   "dell-interface:rx-lpi-count": z.string().optional(),
      //   "dell-interface:rx-lpi-duration": z.string().optional(),
      //   "dell-interface:utilization-percentage": z.number().optional(),
      //   "dell-interface:in-bit-rate": z.string(),
      //   "dell-interface:in-pkt-rate": z.string(),
      //   "dell-interface:in-port-utilization": z.number().optional(),
      //   "dell-interface:out-bit-rate": z.string(),
      //   "dell-interface:out-pkt-rate": z.string(),
      //   "dell-interface:out-port-utilization": z.number().optional(),
      //   "dell-interface:load-interval": z.number(),
      //   "dell-interface:in-pkts": z.string(),
      //   "dell-interface:out-pkts": z.string(),
      //   "dell-interface:counters-last-clear": z.number(),
      //   "dell-interface:alignment-errors": z.string().optional(),
      //   "dell-interface:fcs-errors": z.string().optional(),
      //   "dell-interface:single-collision-frames": z.string().optional(),
      //   "dell-interface:multiple-colision-frames": z.string().optional(),
      //   "dell-interface:sqe-test-errors": z.string().optional(),
      //   "dell-interface:deferred-transmissions": z.string().optional(),
      //   "dell-interface:late-collisions": z.string().optional(),
      //   "dell-interface:excessive-collisions": z.string().optional(),
      //   "dell-interface:internal-mac-transmit-errors": z.string().optional(),
      //   "dell-interface:carrier-sense-errors": z.string().optional(),
      //   "dell-interface:frame-too-long": z.string().optional(),
      //   "dell-interface:internal-mac-receive-errors": z.string().optional(),
      //   "dell-interface:symbol-errors": z.string().optional(),
      //   "dell-interface:in-unknown-opcodes": z.string().optional(),
      //   "dell-interface:ip-in-receives": z.string().optional(),
      //   "dell-interface:ip-in-hdr-errors": z.string().optional(),
      //   "dell-interface:ip-in-discards": z.string().optional(),
      //   "dell-interface:ip-in-forw-datagrams": z.string().optional(),
      //   "dell-interface:ipv6-in-receives": z.string().optional(),
      //   "dell-interface:ipv6-in-hdr-errors": z.string().optional(),
      //   "dell-interface:ipv6-in-addr-errors": z.string().optional(),
      //   "dell-interface:ipv6-in-discards": z.string().optional(),
      //   "dell-interface:ipv6-out-discards": z.string().optional(),
      //   "dell-interface:ipv6-out-forw-datagrams": z.string().optional(),
      //   "dell-interface:ipv6-in-mcast-pkts": z.string().optional(),
      //   "dell-interface:ipv6-out-mcast-pkts": z.string().optional(),
      //   "dell-lacp:lacp-statistics": z
      //     .object({
      //       "lacpdus-rx": z.number().optional(),
      //       "lacpdus-tx": z.number().optional(),
      //       "unknown-rx": z.number().optional(),
      //       "illegal-rx": z.number().optional(),
      //       "marker-pdus-tx": z.number().optional(),
      //       "marker-response-pdus-tx": z.number().optional(),
      //       "marker-pdus-rx": z.number().optional(),
      //       "marker-response-pdus-rx": z.number().optional(),
      //     })
      //     .optional(),
      //   "dell-dcbx:dcbx-stats": z
      //     .object({
      //       "ets-conf-tx-tlv-count": z.number().optional(),
      //       "ets-conf-rx-tlv-count": z.number().optional(),
      //       "ets-conf-rx-tlv-errors": z.number().optional(),
      //       "ets-reco-tx-tlv-count": z.number().optional(),
      //       "ets-reco-rx-tlv-count": z.number().optional(),
      //       "ets-reco-rx-tlv-errors": z.number().optional(),
      //       "pfc-tx-tlv-count": z.number().optional(),
      //       "pfc-rx-tlv-count": z.number().optional(),
      //       "pfc-rx-tlv-errors": z.number().optional(),
      //       "app-prio-tx-tlv-count": z.number().optional(),
      //       "app-prio-rx-tlv-count": z.number().optional(),
      //       "app-prio-rx-tlv-errors": z.number().optional(),
      //       "dcbx-frames-tx-total": z.number().optional(),
      //       "dcbx-frames-rx-total": z.number().optional(),
      //       "dcbx-frames-error-total": z.number().optional(),
      //       "dcbx-frames-unrecognized": z.number().optional(),
      //     })
      //     .optional(),
      // }),
      "dell-interface:ip-mtu": z.number().optional(),
      "dell-interface:configured-fec": z.string().optional(),
      "dell-interface:duplex": z.string().optional(),
      "dell-interface:auto-negotiation": z.boolean().optional(),
      "dell-interface:supported-speed": z.array(z.string()).optional(),
      "dell-interface:supported-autoneg": z.string().optional(),
      "dell-interface:fec": z.string().optional(),
      "dell-interface:source-ip": z.object({}),
      "dell-interface:npu-speed": z.string().optional(),
      "dell-interface:bind-ni-name": z.string().optional(),
      "dell-vrrp:vrrp-ipv4-state": z.object({}),
      "dell-vrrp:vrrp-ipv6-state": z.object({}),
      "dell-ip:ra-dns-oper-status": z.object({}),
      // "dell-ip:l3-arp-params": z
      //   .object({
      //     "if-static-arp-count": z.number(),
      //     "if-dynamic-arp-count": z.number(),
      //     "if-total-arp-count": z.number(),
      //     "vrf-name": z.string(),
      //   })
      //   .optional(),
      "dell-ip:ipv4-info": z
        .object({
          "assignment-mode": z.string().optional(),
          addr: z.string().optional(),
        })
        .optional(),
      // "dell-ip:l3-nbr-params": z
      //   .object({
      //     "if-static-nbr-count": z.number(),
      //     "if-dynamic-nbr-count": z.number(),
      //     "if-total-nbr-count": z.number(),
      //     "vrf-name": z.string(),
      //   })
      //   .optional(),
      "dell-ip:ipv6": z.object({
        "enable-status": z.boolean(),
        "link-local-addr": z.array(z.string()).optional(),
      }),
      "dell-l2-mac:l2-mac-params": z.object({
        "if-static-mac-count": z.number(),
        "if-dynamic-mac-count": z.number(),
        "if-secure-sticky-mac-count": z.number(),
        "if-secure-static-mac-count": z.number(),
        "if-secure-dynamic-mac-count": z.number(),
      }),
      "dell-ethernet:description": z.string().optional(),
      "dell-ethernet:current-phys-address": z.string().optional(),
      "dell-ethernet:last-change-time": z.number().optional(),
      "dell-ethernet:snmp-index": z.number().optional(),
      "dell-ethernet:mode": z.string().optional(),
      "dell-ethernet:untagged-vlan": z.string().optional(),
      "dell-ethernet:tag-protocol-id": z.number().optional(),
      "dell-ethernet:mtu": z.number().optional(),
      "dell-ethernet:min-links": z.number().optional(),
      "dell-ethernet:lag-mode": z.string().optional(),
      "dell-ethernet:member-ports": z
        .object({
          name: z.string(),
          "lacp-mode": z.string(),
        })
        .array()
        .optional(),
      "dell-ethernet:vlan-type": z.string().optional(),
      "dell-vlan:untagged-ports": z.array(z.string()).optional(),
      "dell-vlan:vlt-control": z.boolean().optional(),
      "dell-vlan:active": z.boolean().optional(),
      "dell-vlan:pvlan-type": z.string().optional(),
      "dell-ethernet:eee-state": z.string().optional(),
      "dell-ethernet:tx-idle-time": z.number().optional(),
      "dell-ethernet:tx-wake-time": z.number().optional(),
      "dell-ethernet:is-virtual": z.boolean().optional(),
      // "dell-ethernet:violation-bpdu-guard": z.boolean().optional(),
      // "dell-ethernet:violation-mac-learn-limit": z.boolean().optional(),
      // "dell-ethernet:violation-mac-station-move": z.boolean().optional(),
      // "dell-ethernet:violation-mac-learn-disable": z.boolean().optional(),
      // "dell-ethernet:violation-recovery-timer-status": z.boolean().optional(),
      // "dell-ethernet:violation-recovery-time-left": z.number().optional(),
      "dell-lacp:lacp-status": z.object({
        mode: z.string().optional(),
        "actor-oper-key": z.number().optional(),
        "actor-admin-state": z.string().optional(),
        "actor-admin-system-priority": z.number().optional(),
        "actor-admin-system-id": z.string().optional(),
        "actor-admin-port": z.number().optional(),
        "actor-admin-port-priority": z.number().optional(),
        "actor-oper-state": z.string().optional(),
        "actor-oper-system-priority": z.number().optional(),
        "actor-oper-system-id": z.string().optional(),
        "actor-oper-port": z.number().optional(),
        "actor-oper-port-priority": z.number().optional(),
        "actor-admin-key": z.number().optional(),
        "partner-admin-system-priority": z.number().optional(),
        "partner-admin-system-id": z.string().optional(),
        "partner-admin-key": z.number().optional(),
        "partner-admin-port": z.number().optional(),
        "partner-admin-port-priority": z.number().optional(),
        "partner-admin-state": z.string().optional(),
        "partner-oper-system-priority": z.number().optional(),
        "partner-oper-system-id": z.string().optional(),
        "partner-oper-key": z.number().optional(),
        "partner-oper-port": z.number().optional(),
        "partner-oper-port-priority": z.number().optional(),
        "partner-oper-state": z.string().optional(),
        "selected-lag-id": z.number().optional(),
        "attached-lag-id": z.number().optional(),
        "aggregate-or-individual": z.string().optional(),
        "individual-port-status": z.boolean().optional(),
      }),
      // "dell-lacp:lacp-debug": z.object({
      //   "rx-state": z.string(),
      //   "last-rx-time": z.number().optional(),
      //   "mux-state": z.string().optional(),
      //   "mux-reason": z.string().optional(),
      //   "actor-churn-count": z.number().optional(),
      //   "actor-sync-transition-count": z.number().optional(),
      //   "actor-change-count": z.number().optional(),
      //   "partner-churn-count": z.number().optional(),
      //   "partner-sync-transition-count": z.number().optional(),
      //   "partner-change-count": z.number().optional(),
      // }),
      "dell-lacp:lacp-lag-status": z.object({}),
      // "dell-ospf-v2:ospf-status": z.object({}),
      // "dell-ospf-v2:ospf-stats": z.object({}),
      // "dell-xstp:xstp-port-oper-status": z.object({
      //   "port-status": z
      //     .array(
      //       z.object({
      //         "br-index": z.number(),
      //         type: z.string(),
      //         "inst-or-vlan": z.string(),
      //         state: z.string(),
      //         "port-role": z.string(),
      //         "local-port-num": z.number(),
      //         "local-port-priority": z.number(),
      //         "path-cost": z.number(),
      //         "desig-root-mac-address": z.string(),
      //         "desig-root-priority": z.number(),
      //         "desig-brg-mac-address": z.string(),
      //         "desig-brg-priority": z.number(),
      //         "desig-port-num": z.number(),
      //         "desig-port-priority": z.number(),
      //         "desig-port-path-cost": z.number(),
      //         "fwd-transitions": z.number(),
      //         "link-type": z.string(),
      //         guard: z.string(),
      //         "edge-port-basic": z.string(),
      //         "bpdu-guard": z.string(),
      //         "bpdu-filter": z.string(),
      //         "bpdu-rx": z.number(),
      //         "bpdu-tx": z.number(),
      //         boundary: z.boolean(),
      //         "compatibility-mode": z.string(),
      //       })
      //     )
      //     .optional(),
      //   "debug-status": z.object({}),
      // }),
      // "dell-xstp:xstp-errdisable-bpduguard-recovery": z.object({}),
      // "dell-lldp-med:lldp-med-port-info": z.object({
      //   status: z.object({
      //     "cap-supported": z.string().optional(),
      //     "tlvs-tx-enable": z.string().optional(),
      //   }),
      //   statistics: z
      //     .array(
      //       z.object({
      //         "dest-mac-address": z.number(),
      //         "tx-frames-total": z.number(),
      //         "rx-frames-total": z.number(),
      //         "rx-frames-discarded-total": z.number(),
      //         "rx-tlvs-discarded-total": z.number(),
      //         "rx-cap-tlvs-discarded": z.number(),
      //         "rx-policy-tlvs-discarded": z.number(),
      //         "rx-inventory-tlvs-discarded": z.number(),
      //       })
      //     )
      //     .optional(),
      // }),
      // "dell-lldp-med:lldp-med-local-data": z.object({
      //   "media-policy-table": z.array(z.object({ "app-type": z.string() })),
      //   "poe-pse-port-table": z.object({}),
      // }),
      // "dell-lldp-med:lldp-med-remote-data": z.object({
      //   "capabilities-table": z
      //     .array(
      //       z.object({
      //         "time-mark": z.number(),
      //         "rem-index": z.number(),
      //         "cap-supported": z.string(),
      //         "cap-current": z.string(),
      //         "device-class": z.string(),
      //       })
      //     )
      //     .optional(),
      //   "inventory-table": z
      //     .array(
      //       z.object({
      //         "time-mark": z.number(),
      //         "rem-index": z.number(),
      //         "hardware-rev": z.string(),
      //         "firmware-rev": z.string(),
      //         "software-rev": z.string(),
      //         "serial-num": z.string(),
      //         "mfg-name": z.string(),
      //         "model-name": z.string(),
      //         "asset-id": z.string(),
      //       })
      //     )
      //     .optional(),
      //   "poe-table": z
      //     .array(z.object({ "time-mark": z.number(), "rem-index": z.number() }))
      //     .optional(),
      //   "poe-pd-table": z
      //     .array(
      //       z.object({
      //         "time-mark": z.number(),
      //         "rem-index": z.number(),
      //         "power-req": z.number(),
      //       })
      //     )
      //     .optional(),
      // }),
      // "dell-qos:mmu-port-mapping": z.object({}),
      // "dell-qos:wred-statistics": z.object({
      //   "output-pkts": z.string().optional(),
      //   "output-bytes": z.string().optional(),
      //   "drop-pkts": z.string().optional(),
      //   "drop-bytes": z.string().optional(),
      //   "wred-green-pkts": z.string().optional(),
      //   "wred-yellow-pkts": z.string().optional(),
      //   "wred-red-pkts": z.string().optional(),
      //   "ecn-mark-pkts": z.string().optional(),
      //   "wred-green-bytes": z.string().optional(),
      //   "wred-yellow-bytes": z.string().optional(),
      //   "wred-red-bytes": z.string().optional(),
      //   "ecn-mark-bytes": z.string().optional(),
      // }),
      // "dell-qos:pause-statistics": z.object({
      //   "dot1p-cos-entry": z
      //     .array(
      //       z.object({
      //         cos: z.number(),
      //         "pause-rx-pkts": z.string(),
      //         "pause-tx-pkts": z.string(),
      //       })
      //     )
      //     .optional(),
      //   "pause-rx-pkts": z.string().optional(),
      //   "pause-tx-pkts": z.string().optional(),
      // }),
      // "dell-qos:queue-statistics": z.object({
      //   "queue-stats-entry": z
      //     .array(
      //       z.object({
      //         id: z.number(),
      //         type: z.string(),
      //         snapshot: z.boolean(),
      //         "output-pkts": z.string(),
      //         "output-bytes": z.string(),
      //         "drop-pkts": z.string(),
      //         "drop-bytes": z.string(),
      //         "res-buff-occupancy": z.number(),
      //         "res-buff-watermark": z.number(),
      //         "share-buff-occupancy": z.number(),
      //         "share-buff-watermark": z.number(),
      //       })
      //     )
      //     .optional(),
      //   "queue-config-entry": z.array(
      //     z.object({
      //       id: z.number(),
      //       type: z.string(),
      //       "pool-type": z.string().optional(),
      //       "buffer-size": z.number().optional(),
      //       "threshold-mode": z.string().optional(),
      //       "threshold-val": z.number().optional(),
      //     })
      //   ),
      // }),
      // "dell-qos:port-info": z
      //   .object({
      //     "res-buff-occupancy": z.number().optional(),
      //     "res-buff-watermark": z.number().optional(),
      //     "share-buff-occupancy": z.number().optional(),
      //     "share-buff-watermark": z.number().optional(),
      //     "hdroom-buff-occupancy": z.number().optional(),
      //   })
      //   .optional(),
      // "dell-qos:pg-info": z.object({
      //   "pg-config-entry": z
      //     .array(
      //       z.union([
      //         z.object({ "pg-id": z.number() }),
      //         z.object({
      //           "pg-id": z.number(),
      //           "buffer-size": z.number(),
      //           "threshold-mode": z.string(),
      //           "threshold-val": z.number(),
      //         }),
      //       ])
      //     )
      //     .optional(),
      //   "pg-stats-entry": z
      //     .array(
      //       z.object({
      //         "pg-id": z.number(),
      //         snapshot: z.boolean(),
      //         "res-buff-occupancy": z.number(),
      //         "res-buff-watermark": z.number(),
      //         "share-buff-occupancy": z.number(),
      //         "share-buff-watermark": z.number(),
      //         "hdroom-buff-occupancy": z.number(),
      //         "hdroom-buff-watermark": z.number(),
      //       })
      //     )
      //     .optional(),
      // }),
      // "dell-qos:first-mmu-pg-buff-stats": z.object({}),
      // "dell-qos:last-mmu-pg-buff-stats": z.object({}),
      // "dell-qos:first-mmu-queue-buff-stats": z.object({}),
      // "dell-qos:last-mmu-queue-buff-stats": z.object({}),
      // "dell-qos:trust-dot1p-active-map": z.object({}),
      // "dell-qos:trust-dscp-active-map": z.object({}),
      // "dell-qos:trust-queue-active-map": z.object({}),
      // "dell-qos:qos-if-params": z.object({
      //   "flow-control-rx": z.boolean().optional(),
      //   "flow-control-tx": z.boolean().optional(),
      //   "pfc-mode": z.boolean().optional(),
      //   "ets-mode": z.boolean().optional(),
      //   "unknown-unicast-rate-pps": z.number().optional(),
      //   "weight-info": z
      //     .array(z.object({ "queue-id": z.number(), weight: z.number() }))
      //     .optional(),
      // }),
      // "dell-dot1x:dot1x-if-oper-params": z.object({
      //   "port-status": z.string().optional(),
      //   "auth-pae-state": z.string().optional(),
      //   "backend-auth-state": z.string().optional(),
      //   "host-mode-oper": z.string().optional(),
      // }),
      // "dell-lldp:lldp-status": z.object({
      //   info: z
      //     .array(
      //       z.object({
      //         "dest-mac-addr-index": z.number(),
      //         "local-port-if-index": z.number(),
      //         "local-port-num": z.number(),
      //         "port-config-admin-status": z.string(),
      //         "port-config-tlv-tx-enable": z.string(),
      //         "loc-port-id-subtype": z.string(),
      //         "loc-port-id": z.string(),
      //         "loc-port-desc": z.string(),
      //         "tx-enable": z.boolean(),
      //         "rx-enable": z.boolean(),
      //         "rx-state": z.string(),
      //         "tx-state": z.string(),
      //         "notif-status": z.boolean(),
      //         "notif-type": z.string(),
      //         "dest-mac-addr": z.string(),
      //         "pdu-size": z.number(),
      //         "is-truncated": z.boolean(),
      //         "port-vlan-id": z.number().optional(),
      //       })
      //     )
      //     .optional(),
      //   "basic-tlvs": z.object({ "ipv4-mgmt-address-enable": z.boolean() }),
      //   "dot1-tlvs": z.object({ "portvlan-enable": z.boolean() }),
      //   "dot3-tlvs": z.object({ "linkagg-enable": z.boolean() }),
      // }),
      // "dell-lldp:loc-mgmt-addr": z
      //   .array(z.object({ address: z.string(), family: z.string() }))
      //   .optional(),
      // "dell-lldp:lldp-statistics": z.object({
      //   intf: z
      //     .array(
      //       z.object({
      //         "dest-mac-addr-index": z.number(),
      //         "stats-if-index": z.number(),
      //         "statistics-port-num": z.number(),
      //         "tx-frames": z.number(),
      //         "rx-discarded": z.number(),
      //         "rx-errors": z.number(),
      //         "rx-total": z.number(),
      //         "discarded-tlvs": z.number(),
      //         "unrecognised-tlvs": z.number(),
      //         ageouts: z.number(),
      //       })
      //     )
      //     .optional(),
      // }),
      // "dell-lldp:mgmt-addr-cfg-tx-ports": z.object({}),
      // "dell-lldp:rem-mgmt-addr": z.object({}),
      // "dell-lldp:rem-unknown-tlv": z.object({}),
      // "dell-lldp:loc-org-def": z.object({
      //   info: z
      //     .array(
      //       z.object({
      //         oui: z.string(),
      //         subtype: z.number(),
      //         "port-num": z.number(),
      //         "tlv-info": z.string(),
      //       })
      //     )
      //     .optional(),
      // }),
      // "dell-lldp:rem-org-def": z.object({}),
      // "dell-lldp:lldp-rem-neighbor-info": z.object({
      //   info: z
      //     .array(
      //       z.object({
      //         "rem-lldp-time-mark": z.number(),
      //         "rem-lldp-index": z.number(),
      //         "dest-mac-addr-index": z.number(),
      //         "rem-if-index": z.number(),
      //         "rem-local-port-num": z.number(),
      //         "rem-lldp-chassis-id": z.string(),
      //         "rem-lldp-port-id": z.string(),
      //         "rem-lldp-chassis-id-subtype": z.string(),
      //         "rem-lldp-port-subtype": z.string(),
      //         "rem-ttl": z.number(),
      //         "rem-last-update-time": z.number(),
      //         "rem-info-valid-time": z.number(),
      //         "rem-system-desc": z.string(),
      //         "rem-port-desc": z.string(),
      //         "rem-system-name": z.string(),
      //         "rem-port-vlan-id": z.number(),
      //         "rem-max-frame-size": z.number(),
      //         "rem-agg-link-status": z.boolean(),
      //         "rem-sys-cap-supported": z.string(),
      //         "rem-sys-cap-enabled": z.string(),
      //         "rem-remote-changes": z.boolean(),
      //         "rem-too-many-neighbors": z.boolean(),
      //         "rem-dot3-auto-neg-supported": z.boolean(),
      //         "rem-dot3-auto-neg-enabled": z.boolean(),
      //         "rem-dot3-auto-neg-adv-cap": z.string(),
      //       })
      //     )
      //     .optional(),
      // }),
      "dell-dhcp-snooping:dhcp-v4-arp-vlan-stats": z.object({
        "valid-arp-request": z.string(),
        "invalid-arp-request": z.string(),
        "valid-arp-reply": z.string(),
        "invalid-arp-reply": z.string(),
      }),
      "dell-dhcp:dhcp-client-pkt-statistics": z.object({
        receive: z.object({}),
        send: z.object({}),
      }),
      "dell-dhcp:dhcp-lease-oper": z.object({}),
      "dell-dhcp:dhcpv6-lease-oper": z.object({}),
      "dell-dhcp:dhcp-relay-intf-info": z.object({}),
      "dell-dhcp:dhcp-relay6-intf-info": z.object({}),
      "dell-sflow:oper-data": z.object({ enable: z.boolean() }),
      "dell-ptp:ptp-port-ds": z.object({
        "port-ds": z.object({ "port-identity": z.object({}) }),
        "interface-counter-ds": z.object({}),
        "peer-ds": z.object({}),
        "foreign-masters-ds": z.object({}),
      }),
      "dell-synce:intf-info": z.object({
        "reference-info": z.object({}),
        "esmc-info": z.object({}),
        "reference-statistics-info": z.object({}),
      }),
      // "dell-lldp-fa:discovered-servers": z.object({}),
      // "dell-fc-services:fc-intf-params": z.object({
      //   "port-type": z.string(),
      //   pwwn: z.string(),
      //   "fc-id": z.string(),
      //   "bb-credit": z.number(),
      // }),
      // "dell-fc-services:intf-params": z.object({}),
      // "dell-ospf-v3:ospf-v3-oper": z.object({}),
      // "dell-ospf-v3:ospf-stats": z.object({}),
      // "dell-dcbx:cee-local-info": z.object({
      //   "max-version": z.number().optional(),
      //   "oper-version": z.number().optional(),
      //   "seq-no": z.number().optional(),
      //   "ack-no": z.number().optional(),
      //   synced: z.boolean().optional(),
      //   "app-priority": z
      //     .array(
      //       z.object({
      //         selector: z.string(),
      //         protocol: z.number(),
      //         priority: z.number(),
      //       })
      //     )
      //     .optional(),
      // }),
      // "dell-dcbx:cee-peer-info": z.object({
      //   "max-version": z.number().optional(),
      //   "oper-version": z.number().optional(),
      //   "seq-no": z.number().optional(),
      //   "ack-no": z.number().optional(),
      // }),
      // "dell-dcbx:dcbx-status": z.object({
      //   version: z.string().optional(),
      //   enable: z.boolean(),
      //   "oper-status": z.boolean(),
      //   dcbx_oper_down_reason: z.string(),
      //   "compatible-version": z.string().optional(),
      //   "peer-version": z.string().optional(),
      //   "ets-config-tx-enable": z.boolean(),
      //   "ets-recom-tx-enable": z.boolean(),
      //   "pfc-tx-enable": z.boolean(),
      //   "app-iscsi-tx-enable": z.boolean(),
      // }),
      // "dell-dcbx:ets-status": z.object({
      //   mode: z.string().optional(),
      //   "num-tc-sup": z.number().optional(),
      //   "remote-enable": z.boolean().optional(),
      //   "oper-status": z.string().optional(),
      //   "state-type": z.string().optional(),
      //   "dcbx-ets-oper-up": z.boolean().optional(),
      //   "dcbx-ets-oper-down-reason": z.string(),
      // }),
      // "dell-dcbx:pfc-status": z.object({
      //   mode: z.string().optional(),
      //   "oper-status": z.string().optional(),
      //   "state-type": z.string().optional(),
      //   "dcbx-pfc-oper-up": z.boolean().optional(),
      //   "dcbx-pfc-oper-down-reason": z.string(),
      //   "peer-oper-status": z.boolean().optional(),
      //   "local-oper-status": z.boolean().optional(),
      // }),
      // "dell-dcbx:app-status": z.object({}),
      // "dell-dcbx:dcbx-config": z.object({}),
      // "dell-dcbx:dcbx-loc-data": z.object({
      //   "ets-pfc-info": z.object({}),
      //   "pfc-enable": z.array(
      //     z.object({ priority: z.number(), enabled: z.boolean() })
      //   ),
      //   "app-priority": z
      //     .array(
      //       z.object({
      //         selector: z.string(),
      //         protocol: z.number(),
      //         priority: z.number(),
      //       })
      //     )
      //     .optional(),
      // }),
      // "dell-dcbx:dcbx-remote-data": z.object({
      //   "ets-pfc-info": z.array(
      //     z.object({
      //       "time-mark": z.number(),
      //       "loc-if-index": z.number(),
      //       "loc-dest-mac-addr-index": z.number(),
      //       "rem-index": z.number().optional(),
      //     })
      //   ),
      //   "ets-conf-prio-assign": z
      //     .array(
      //       z.object({
      //         "time-mark": z.number(),
      //         "loc-if-index": z.number(),
      //         "loc-dest-mac-addr-index": z.number(),
      //         "rem-index": z.number(),
      //         priority: z.number(),
      //         "pri-traffic-class": z.number(),
      //       })
      //     )
      //     .optional(),
      //   "ets-conf-traffic-class-bandwidth": z
      //     .array(
      //       z.object({
      //         "time-mark": z.number(),
      //         "loc-if-index": z.number(),
      //         "loc-dest-mac-addr-index": z.number(),
      //         "rem-index": z.number(),
      //         "traffic-class": z.number(),
      //         bandwidth: z.number(),
      //       })
      //     )
      //     .optional(),
      //   "ets-conf-traffic-sel-algo": z
      //     .array(
      //       z.object({
      //         "time-mark": z.number().optional(),
      //         "loc-if-index": z.number().optional(),
      //         "loc-dest-mac-addr-index": z.number().optional(),
      //         "rem-index": z.number(),
      //         "traffic-class": z.number().optional(),
      //         "sel-algo": z.string().optional(),
      //       })
      //     )
      //     .optional(),
      //   "pfc-enable": z.array(
      //     z.object({
      //       "time-mark": z.number(),
      //       "loc-if-index": z.number(),
      //       "loc-dest-mac-addr-index": z.number(),
      //       "rem-index": z.number(),
      //       priority: z.number(),
      //       enabled: z.boolean(),
      //     })
      //   ),
      //   "dcbx-status": z.object({}),
      // }),
      // "dell-dcbx:dcbx-admin-data": z.object({
      //   "ets-pfc-info": z.object({}),
      //   "pfc-enable": z.array(
      //     z.object({ priority: z.number(), enabled: z.boolean() })
      //   ),
      // }),
      // "dell-iscsi-optimization:dcbx-iscsi-status": z.object({}),
      // "dell-multicast-snooping:igmp-snooping-oper": z.object({
      //   version: z.number().optional(),
      //   disable: z.boolean().optional(),
      //   "send-query": z.boolean().optional(),
      //   "fast-leave": z.boolean().optional(),
      //   "last-member-query-interval": z.number().optional(),
      //   "query-interval": z.number().optional(),
      //   "max-response-time": z.number().optional(),
      //   "group-count": z.number().optional(),
      //   "querier-timeout": z.number().optional(),
      //   "flood-disable": z.boolean().optional(),
      //   "pvlan-type": z.string().optional(),
      // }),
      // "dell-multicast-snooping:mld-snooping-oper": z.object({
      //   version: z.number().optional(),
      //   disable: z.boolean().optional(),
      //   "send-query": z.boolean().optional(),
      //   "fast-leave": z.boolean().optional(),
      //   "last-member-query-interval": z.number().optional(),
      //   "query-interval": z.number().optional(),
      //   "max-response-time": z.number().optional(),
      //   "group-count": z.number().optional(),
      //   "querier-timeout": z.number().optional(),
      //   "flood-disable": z.boolean().optional(),
      //   "pvlan-type": z.string().optional(),
      // }),
      // "dell-iscsi-autoconf:iscsi-status": z.object({}),
      // "dell-fefd:fefd-if-status": z.object({
      //   "fefd-if-state": z.string().optional(),
      //   "op-interval": z.number().optional(),
      //   "op-mode": z.string().optional(),
      // }),
    })
  ),
});

export type dell_os10_show_interfaces_status = z.infer<typeof dell_os10_show_interfaces_status_schema>;

export const dell_os10_show_mac_address_table_schema = z.object({
  "dell-l2-mac:fwd-table": z
    .object({
      "mac-addr": z.string(),
      vlan: z.string(),
      "entry-type": z.string(),
      "if-name": z.string(),
      status: z.string(),
      "dot1d-port-index": z.number(),
    })
    .array(),
});

export type dell_os10_show_mac_address_table = z.infer<typeof dell_os10_show_mac_address_table_schema>;
