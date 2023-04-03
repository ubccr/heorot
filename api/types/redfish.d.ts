interface Attributes {
  "@odata.id": string
}

// /redfish/v1/Systems/System.Embedded.1
export interface Redfish_Systems {
  "@Redfish.Settings":
    | {
        "@odata.context": string
        "@odata.type": string
        SettingsObject: Attributes
        SupportedApplyTimes: string[]
      }
    | undefined
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Actions: {
    "#ComputerSystem.Reset": {
      target: string
      "ResetType@Redfish.AllowableValues": string[]
    }
  }
  AssetTag: string
  Bios: Attributes
  BiosVersion: string
  BootProgress:
    | {
        LastState: string
      }
    | undefined
  Boot: {
    BootOptions: Attributes | undefined
    Certificates: Attributes | undefined
    BootOrder: string[] | undefined
    "BootOrder@odata.count": number | undefined
    BootSourceOverrideEnabled: string
    BootSourceOverrideMode: string | undefined
    BootSourceOverrideTarget: string
    UefiTargetBootSourceOverride: string | null | undefined
    "BootSourceOverrideTarget@Redfish.AllowableValues": string[]
    StopBootOnFault: string | undefined
  }
  Description: string
  EthernetInterfaces: Attributes
  GraphicalConsole:
    | {
        ConnectTypesSupported: string[]
        "ConnectTypesSupported@odata.count": number
        MaxConcurrentSessions: number
        ServiceEnabled: boolean
      }
    | undefined
  HostName: string
  HostWatchdogTimer:
    | {
        FunctionEnabled: boolean
        Status: {
          State: string
        }
        TimeoutAction: string
      }
    | undefined
  HostingRoles: string[] | undefined //? unverified
  "HostingRoles@odata.count": number | undefined
  Id: string
  IndicatorLED: string
  Links: {
    Chassis: Attributes[]
    "Chassis@odata.count": number
    CooledBy: Attributes[]
    "CooledBy@odata.count": number
    ManagedBy: Attributes[]
    "ManagedBy@odata.count": number
    Oem: {
      Dell:
        | {
            "@odata.type": string
            BootOrder: Attributes
            DellBootSources: Attributes
            DellSoftwareInstallationService: Attributes
            DellVideoCollection: Attributes
            DellChassisCollection: Attributes
            DellPresenceAndStatusSensorCollection: Attributes
            DellSensorCollection: Attributes
            DellRollupStatusCollection: Attributes
            DellPSNumericSensorCollection: Attributes
            DellVideoNetworkCollection: Attributes
            DellOSDeploymentService: Attributes
            DellMetricService: Attributes
            DellGPUSensorCollection: Attributes
            DellRaidService: Attributes
            DellNumericSensorCollection: Attributes
            DellBIOSService: Attributes
            DellSlotCollection: Attributes
          }
        | undefined
    }
    PoweredBy: Attributes[]
    "PoweredBy@odata.count": number
  }
  LastResetTime: string | undefined
  LocationIndicatorActive: boolean | undefined
  Manufacturer: string
  Memory: Attributes
  MemorySummary: {
    MemoryMirroring: string | undefined
    Status: {
      Health: string
      HealthRollup: string
      State: string
    }
    TotalSystemMemoryGiB: number
  }
  Model: string
  Name: string
  NetworkInterfaces: Attributes
  Oem:
    | {
        Dell: {
          "@odata.type": string
          DellSystem: {
            BIOSReleaseDate: string
            BaseBoardChassisSlot: string
            BatteryRollupStatus: string
            BladeGeometry: string
            CMCIP: string | null
            CPURollupStatus: string
            ChassisModel: string | null
            ChassisName: string
            ChassisServiceTag: string
            ChassisSystemHeightUnit: number
            CurrentRollupStatus: string
            EstimatedExhaustTemperatureCelsius: number
            EstimatedSystemAirflowCFM: number
            ExpressServiceCode: string
            FanRollupStatus: string
            Id: string
            IDSDMRollupStatus: string | null
            IntrusionRollupStatus: string
            IsOEMBranded: string
            LastSystemInventoryTime: string
            LastUpdateTime: string
            LicensingRollupStatus: string
            ManagedSystemSize: string
            MaxCPUSockets: number
            MaxDIMMSlots: number
            MaxPCIeSlots: number
            MemoryOperationMode: string
            Name: string
            NodeID: string
            PSRollupStatus: string
            PlatformGUID: string
            PopulatedDIMMSlots: number
            PopulatedPCIeSlots: number
            PowerCapEnabledState: string
            SDCardRollupStatus: string | null
            SELRollupStatus: string
            ServerAllocationWatts: string | null
            StorageRollupStatus: string
            SysMemErrorMethodology: string
            SysMemFailOverState: string
            SysMemLocation: string
            SysMemPrimaryStatus: string
            SystemGeneration: string
            SystemID: number
            SystemRevision: string
            TempRollupStatus: string
            TempStatisticsRollupStatus: string
            UUID: string
            VoltRollupStatus: string
            smbiosGUID: string
            "@odata.context": string
            "@odata.type": string
            "@odata.id": string
          }
        }
      }
    | undefined
  PCIeDevices: Attributes[] | undefined
  "PCIeDevices@odata.count": number | undefined
  PCIeFunctions: Attributes[] | undefined
  "PCIeFunctions@odata.count": number | undefined
  PartNumber: string
  PowerState: string
  ProcessorSummary: {
    Count: number
    CoreCount: number | undefined
    LogicalProcessorCount: number | undefined
    Model: string
    Status: {
      Health: string
      HealthRollup: string
      State: string
    }
    ThreadingEnabled: boolean
  }
  Processors: Attributes
  SKU: string
  SecureBoot: Attributes | undefined
  SerialNumber: string
  SimpleStorage: Attributes
  Status: {
    Health: string
    HealthRollup: string
    State: string
  }
  Storage: Attributes
  SystemType: string
  TrustedModules:
    | [
        {
          FirmwareVersion: string
          InterfaceType: string | null
          Status: {
            State: string
          }
        }
      ]
    | undefined
  "TrustedModules@odata.count": number | undefined
  UUID: string
  VirtualMedia: Attributes | undefined
  VirtualMediaConfig:
    | {
        ServiceEnabled: boolean
      }
    | undefined
}

// /redfish/v1/Systems/System.Embedded.1/BootOptions
export interface Redfish_Systems_Boot_options {
  "@odata.context": string
  "@odata.type": string
  "@odata.id": string
  Description: string
  Members: Attributes[]
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Systems/System.Embedded.1/BootOptions/:id
export interface Redfish_Systems_Boot_options_id {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  BootOptionEnabled: boolean
  BootOptionReference: string
  Description: string
  DisplayName: string
  Id: string
  Name: string
  UefiDevicePath: string
  RelatedItem: Attributes[] | undefined
}

// /redfish/v1/Systems/System.Embedded.1/Memory
export interface Redfish_Systems_Memory {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: Array<Attributes>
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Systems/System.Embedded.1/Memory/:id
export interface Redfish_Systems_Memory_id {
  "@odata.context": string
  "@odata.type": string
  "@odata.id": string
  AllowedSpeedsMHz: Array<number>
  "AllowedSpeedsMHz@odata.count": number
  Assembly: {
    "@odata.id": string
  }
  BaseModuleType: string | null
  BusWidthBits: number
  CacheSizeMiB: number
  CapacityMiB: number
  DataWidthBits: number
  Description: string
  DeviceLocator: string
  Enabled: boolean | undefined
  ErrorCorrection: string
  FirmwareRevision: string | null
  Id: string
  Links: {
    Chassis: {
      "@odata.id": string
    }
    Oem:
      | {
          Dell: {
            "@odata.type": string
            CPUAffinity: [
              {
                "@odata.id": string
              }
            ]
            "CPUAffinity@odata.count": number
          }
        }
      | undefined
    Processors:
      | [
          {
            "@odata.id": string
          }
        ]
      | undefined
    "Processors@odata.count": number | undefined
  }
  LogicalSizeMiB: number | undefined
  Manufacturer: string
  MaxTDPMilliWatts: []
  "MaxTDPMilliWatts@odata.count": number
  MemoryDeviceType: string
  MemorySubsystemControllerManufacturerID: string | null | undefined
  MemorySubsystemControllerProductID: string | null | undefined
  MemoryType: string | null
  Metrics: {
    "@odata.id": string
  }
  ModuleManufacturerID: string | null | undefined
  ModuleProductID: string | null | undefined
  Name: string
  NonVolatileSizeMiB: number | undefined
  Oem:
    | {
        Dell: {
          "@odata.type": string
          DellMemory: {
            BankLabel: string
            Id: string
            LastSystemInventoryTime: string
            LastUpdateTime: string
            ManufactureDate: string
            MemoryTechnology: string
            Model: string
            Name: string
            RemainingRatedWriteEndurancePercent: number | null
            SystemEraseCapability: string
            "@odata.context": string
            "@odata.type": string
            "@odata.id": string
          }
        }
      }
    | undefined
  OperatingMemoryModes: Array<string>
  "OperatingMemoryModes@odata.count": number
  OperatingSpeedMhz: number
  PartNumber: string
  RankCount: number
  SerialNumber: string
  Status: {
    Health: string
    State: string
  }
  VolatileSizeMiB: number | undefined
}

// /redfish/v1/Systems/System.Embedded.1/Processors
export interface Redfish_Systems_Processors {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: [
    {
      "@odata.id": string
    }
  ]
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Systems/System.Embedded.1/Processors/:cpu
export interface Redfish_Systems_Processors_CPU {
  "@odata.id": string
  "@odata.type": string
  "@odata.context": string
  Assembly: {
    "@odata.id": string
  }
  Description: string
  Enabled: boolean | undefined
  Id: string
  InstructionSet: string
  Links:
    | {
        Chassis: {
          "@odata.id": string
        }
        Memory: [
          {
            "@odata.id": string
          }
        ]
        "Memory@odata.count": number
      }
    | undefined
  Manufacturer: string
  MaxSpeedMHz: number
  MemorySummary:
    | {
        TotalCacheSizeMiB: number
        TotalMemorySizeMiB: number
      }
    | undefined
  Model: string
  Name: string
  Oem:
    | {
        Dell: {
          "@odata.type": string
          DellProcessor: {
            CPUFamily: string
            CPUStatus: string
            Cache1Associativity: string
            Cache1ErrorMethodology: string
            Cache1InstalledSizeKB: number
            Cache1Level: string
            Cache1Location: string
            Cache1PrimaryStatus: string
            Cache1SRAMType: string
            Cache1SizeKB: number
            Cache1Type: string
            Cache1WritePolicy: string
            Cache2Associativity: string
            Cache2ErrorMethodology: string
            Cache2InstalledSizeKB: number
            Cache2Level: string
            Cache2Location: string
            Cache2PrimaryStatus: string
            Cache2SRAMType: string
            Cache2SizeKB: number
            Cache2Type: string
            Cache2WritePolicy: string
            Cache3Associativity: string
            Cache3ErrorMethodology: string
            Cache3InstalledSizeKB: number
            Cache3Level: string
            Cache3Location: string
            Cache3PrimaryStatus: string
            Cache3SRAMType: string
            Cache3SizeKB: number
            Cache3Type: string
            Cache3WritePolicy: string
            CurrentClockSpeedMhz: number
            ExternalBusClockSpeedMhz: number
            HyperThreadingCapable: string
            HyperThreadingEnabled: string
            Id: string
            LastSystemInventoryTime: string
            LastUpdateTime: string
            Name: string
            TurboModeCapable: string
            TurboModeEnabled: string
            VirtualizationTechnologyCapable: string
            VirtualizationTechnologyEnabled: string
            Volts: string
            "@odata.context": string
            "@odata.type": string
            "@odata.id": string
          }
        }
      }
    | undefined
  OperatingSpeedMHz: number | undefined
  ProcessorArchitecture: string
  ProcessorId: {
    EffectiveFamily: string
    EffectiveModel: string
    IdentificationRegisters: string
    MicrocodeInfo: string
    Step: string
    VendorId: string
  }
  ProcessorType: string
  Socket: string
  Status: {
    Health: string
    State: string
  }
  TotalCores: number
  TotalEnabledCores: number | undefined
  TotalThreads: number
  TurboState: string | undefined
  Version: string | undefined
}

// /redfish/v1/Systems/System.Embedded.1/Storage
export interface Redfish_Systems_Storage {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: Attributes[]
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Systems/System.Embedded.1/EthernetInterfaces
export interface Redfish_Systems_Ethernet_interfaces {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: Attributes[]
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Systems/System.Embedded.1/EthernetInterfaces/:id
export interface Redfish_Systems_Ethernet_interfaces_id {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  AutoNeg: boolean
  Description: string
  EthernetInterfaceType: string | undefined
  FQDN: string | null
  FullDuplex: boolean
  HostName: string | null
  IPv4Addresses: []
  "IPv4Addresses@odata.count": number
  IPv6AddressPolicyTable: []
  "IPv6AddressPolicyTable@odata.count": number
  IPv6Addresses: []
  "IPv6Addresses@odata.count": number
  IPv6DefaultGateway: string | null
  IPv6StaticAddresses: []
  "IPv6StaticAddresses@odata.count": number
  Id: string
  InterfaceEnabled: boolean | null
  LinkStatus: string | undefined
  Links:
    | {
        Chassis: {
          "@odata.id": string
        }
      }
    | undefined
  MACAddress: string
  MTUSize: number | null // ? unverified
  MaxIPv6StaticAddresses: number | null // ? unverified
  Name: string
  NameServers: []
  "NameServers@odata.count": number
  PermanentMACAddress: string
  SpeedMbps: number
  Status: {
    Health: string
    State: string
  }
  UefiDevicePath: string
  VLAN: {} | null // ? unverified
}

// /redfish/v1/Systems/System.Embedded.1/NetworkInterfaces
export interface Redfish_Systems_Network_interfaces {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: Attributes[]
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Systems/System.Embedded.1/NetworkInterfaces/:id
export interface Redfish_Systems_Network_interfaces_id {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Id: string
  Links: {
    NetworkAdapter: {
      "@odata.id": string
    }
  }
  Name: string
  NetworkDeviceFunctions: Attributes
  NetworkPorts: Attributes
  Status: {
    Health: string | null
    HealthRollup: string | null
    State: string
  }
}

// /redfish/v1/Chassis/System.Embedded.1/NetworkAdapters/:id/NetworkPorts
export interface Redfish_Systems_Network_interfaces_id_Network_ports {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: Attributes[]
  "Members@odata.count": number
  Name: string
}

export interface Redfish_Systems_Network_interfaces_id_Network_ports_id {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  ActiveLinkTechnology: string
  AssociatedNetworkAddresses: string[]
  CurrentLinkSpeedMbps: number
  Description: string
  EEEEnabled: string | null //? unverified
  FlowControlConfiguration: string
  FlowControlStatus: string
  Id: string
  LinkStatus: string
  Name: string
  NetDevFuncMaxBWAlloc: [
    {
      MaxBWAllocPercent: number | null //? unverified
      NetworkDeviceFunction: Attributes
    }
  ]
  "NetDevFuncMaxBWAlloc@odata.count": number
  NetDevFuncMinBWAlloc: [
    {
      MinBWAllocPercent: number | null //? unverified
      NetworkDeviceFunction: Attributes
    }
  ]
  "NetDevFuncMinBWAlloc@odata.count": number
  Oem: {} | undefined
  PhysicalPortNumber: string
  Status: {
    State: string | null
    Health: string | null
    HealthRollup: string
  }
  SupportedEthernetCapabilities: string[]
  "SupportedEthernetCapabilities@odata.count": number
  SupportedLinkCapabilities: [
    {
      AutoSpeedNegotiation: boolean | undefined
      LinkNetworkTechnology: string
      LinkSpeedMbps: number
    }
  ]
  "SupportedLinkCapabilities@odata.count": number
  VendorId: string
  WakeOnLANEnabled: boolean
}

// /redfish/v1/Systems/System.Embedded.1/Storage/:id
export interface Redfish_Systems_Storage_id {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Controllers: Attributes[] | undefined
  Description: string
  Drives: Attributes[]
  "Drives@odata.count": number
  Id: string
  Identifiers:
    | [
        {
          DurableName: string
          DurableNameFormat: string
        }
      ]
    | undefined
  "Identifiers@odata.count": number | undefined
  Links: {
    Enclosures: Attributes[]
    "Enclosures@odata.count": number
    Oem:
      | {
          Dell: {
            "@odata.type": string
            CPUAffinity: []
            "CPUAffinity@odata.count": number
          }
        }
      | undefined
    SimpleStorage: Attributes | undefined
  }
  Name: string
  Oem:
    | {
        Dell: {
          "@odata.type": string
          DellController: {
            "@odata.context": string
            "@odata.id": string
            "@odata.type": string
            AlarmState: string
            AutoConfigBehavior: string
            BootVirtualDiskFQDD: string | null
            CacheSizeInMB: number
            CachecadeCapability: string
            ConnectorCount: number
            ControllerFirmwareVersion: string
            CurrentControllerMode: string
            Description: string
            Device: string
            DeviceCardDataBusWidth: string
            DeviceCardSlotLength: string
            DeviceCardSlotType: string
            DriverVersion: string
            EncryptionCapability: string
            EncryptionMode: string
            Id: string
            KeyID: string | null
            LastSystemInventoryTime: string
            LastUpdateTime: string
            MaxAvailablePCILinkSpeed: string
            MaxPossiblePCILinkSpeed: string
            Name: string
            PCISlot: number
            PatrolReadState: string
            PersistentHotspare: string
            RealtimeCapability: string
            RollupStatus: string
            SASAddress: string
            SecurityStatus: string
            SharedSlotAssignmentAllowed: string
            SlicedVDCapability: string
            SupportControllerBootMode: string
            SupportEnhancedAutoForeignImport: string
            SupportRAID10UnevenSpans: string
            SupportsLKMtoSEKMTransition: string
            T10PICapability: string
          }
        }
      }
    | undefined
  Status: {
    Health: string
    HealthRollup: string
    State: string
  }
  StorageControllers: [
    {
      "@odata.id": string
      Assembly: {
        "@odata.id": string
      }
      CacheSummary:
        | {
            TotalCacheSizeMiB: number
          }
        | undefined
      ControllerRates:
        | {
            ConsistencyCheckRatePercent: number
            RebuildRatePercent: number
          }
        | undefined
      FirmwareVersion: string
      Identifiers: [
        {
          DurableName: string
          DurableNameFormat: string
        }
      ]
      "Identifiers@odata.count": number
      Links: {
        PCIeFunctions: Attributes[] | undefined
        "PCIeFunctions@odata.count": number | undefined
      }
      Manufacturer: string
      MemberId: string
      Model: string
      Name: string
      SpeedGbps: number
      Status: {
        Health: string
        HealthRollup: string
        State: string
      }
      SupportedControllerProtocols: Array<string>
      "SupportedControllerProtocols@odata.count": number | undefined
      SupportedDeviceProtocols: Array<string>
      "SupportedDeviceProtocols@odata.count": number | undefined
      SupportedRAIDTypes: Array<string>
      "SupportedRAIDTypes@odata.count": number | undefined
    }
  ]
  "StorageControllers@Redfish.Deprecated": string
  "StorageControllers@odata.count": number
  Volumes: Attributes
}

// /redfish/v1/Systems/System.Embedded.1/Storage/:id/Drives/:id
export interface Redfish_Systems_Storage_id_Drives {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Actions: {
    "#Drive.SecureErase": {
      "@Redfish.OperationApplyTimeSupport": {
        "@odata.type": string
        SupportedValues: string[] | undefined
      }
      target: string
    }
  }
  Assembly: {
    "@odata.id": string
  }
  BlockSizeBytes: number
  CapableSpeedGbs: number
  CapacityBytes: number
  Description: string
  EncryptionAbility: string
  EncryptionStatus: string
  FailurePredicted: boolean
  HotspareType: string
  Id: string
  Identifiers: [
    {
      DurableName: string
      DurableNameFormat: string
    }
  ]
  "Identifiers@odata.count": number | undefined
  Links: {
    Chassis: {
      "@odata.id": string
    }
    Oem:
      | {
          Dell: {
            "@odata.type": string
            CPUAffinity: []
            "CPUAffinity@odata.count": number
          }
        }
      | undefined
    PCIeFunctions: [] | undefined
    "PCIeFunctions@odata.count": number | undefined
    Storage: Attributes | undefined
    Volumes: Attributes[]
    "Volumes@odata.count": number
  }
  Location: []
  LocationIndicatorActive: string | null | undefined // ? not verified
  Manufacturer: string
  MediaType: string
  Model: string
  Name: string
  NegotiatedSpeedGbs: number
  Oem:
    | {
        Dell: {
          "@odata.type": string
          DellDriveSMARTAttributes: Attributes
          DellPhysicalDisk: {
            "@odata.context": string
            "@odata.id": string
            "@odata.type": string
            AvailableSparePercent: number | null // ? not verified
            Certified: string
            Connector: number
            CryptographicEraseCapable: string
            Description: string
            DeviceProtocol: string | null
            DeviceSidebandProtocol: string | null
            DriveFormFactor: string
            EncryptionProtocol: string
            ErrorDescription: string | null
            ErrorRecoverable: string
            ForeignKeyIdentifier: string | null
            FreeSizeInBytes: number
            Id: string
            LastSystemInventoryTime: string
            LastUpdateTime: string
            ManufacturingDay: number
            ManufacturingWeek: number
            ManufacturingYear: number
            Name: string
            NonRAIDDiskCachePolicy: string
            OperationName: string
            OperationPercentCompletePercent: number
            PCIeCapableLinkWidth: string
            PCIeNegotiatedLinkWidth: string
            PPID: string
            PowerStatus: string
            PredictiveFailureState: string
            ProductID: string | null // ? not verified
            RAIDType: string
            RaidStatus: string
            SASAddress: string
            Slot: number
            SystemEraseCapability: string
            T10PICapability: string
            UsedSizeInBytes: number
            WWN: string
          }
        }
      }
    | undefined
  Operations: []
  "Operations@odata.count": number | undefined
  PartNumber: string
  PhysicalLocation:
    | {
        PartLocation: {
          LocationOrdinalValue: number
          LocationType: string
        }
      }
    | undefined
  PredictedMediaLifeLeftPercent: number
  Protocol: string
  Revision: string
  RotationSpeedRPM: number | null
  SerialNumber: string
  Status: {
    Health: string
    HealthRollup: string
    State: string
  }
  WriteCacheEnabled: false | undefined
}

// /redfish/v1/Ssystems/System.Embedded.1/Storage/:id/Volumes
export interface Redfish_Systems_Storage_id_Volumes {
  "@Redfish.OperationApplyTimeSupport": {
    "@odata.type": string
    SupportedValues: string[]
  }
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: Attributes[]
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Systems/System.Embedded.1/Storage/:id/Volumes/:id
export interface Redfish_Systems_Storage_id_Volumes_id {
  "@Redfish.Settings": {
    "@odata.context": string
    "@odata.type": string
    SettingsObject: Attributes
    SupportedApplyTimes: string[]
  }
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Actions: {
    "#Volume.CheckConsistency": {
      "@Redfish.OperationApplyTimeSupport": {
        "@odata.type": string
        SupportedValues: string[]
      }
      target: string
    }
    "#Volume.Initialize": {
      "@Redfish.OperationApplyTimeSupport": {
        "@odata.type": string
        SupportedValues: string[]
      }
      "InitializeType@Redfish.AllowableValues": ["Fast", "Slow"]
      target: string
    }
  }
  BlockSizeBytes: number
  CapacityBytes: number
  Description: string
  DisplayName: string | null | undefined
  Encrypted: boolean | null
  EncryptionTypes: string[]
  Id: string
  Identifiers: []
  Links: {
    Drives: Attributes[]
    "Drives@odata.count": number
  }
  MediaSpanCount: number | null | undefined // ? not verified
  Name: string
  Operations: []
  OptimumIOSizeBytes: number | null
  RAIDType: string | null | undefined
  ReadCachePolicy: string | null | undefined
  Status: {
    Health: string
    HealthRollup: string
    State: string
  }
  VolumeType: string
  WriteCachePolicy: string | null | undefined
}

// /redfish/v1/Chassis/System.Embedded.1/PCIeDevices/:id
export interface Redfish_Chassis_PCIe_devices {
  "@odata.context": string
  "@odata.etag": string
  "@odata.id": string
  "@odata.type": string
  AssetTag: string | null
  Description: string | null
  DeviceType: string | null
  FirmwareVersion: string | null
  Id: string | null
  Links: {
    Chassis: [
      {
        "@odata.id": string
      }
    ]
    "Chassis@odata.count": number
    Oem: {
      Dell: {
        "@odata.type": string
        CPUAffinity: []
        "CPUAffinity@odata.count": number
      }
    }
    PCIeFunctions: [
      {
        "@odata.id": string
      }
    ]
    "PCIeFunctions@odata.count": number
  }
  Manufacturer: string
  Model: string | null
  Name: string
  PartNumber: string | null
  SKU: string | null
  SerialNumber: string | null
  Slot: {
    Lanes: number
    Location: {
      PartLocation: {
        LocationOrdinalValue: number
        LocationType: string
      }
    }
    PCIeType: string
    SlotType: string
  }
  Status: {
    State: string
    Health: string
    HealthRollup: string
  }
  PCIeFunctions: {
    "@odata.id": string
  }
}

// /redfish/v1/Chassis/:enclosure_id
export interface Redfish_Chassis_enclosure_id {
  "@Redfish.Settings":
    | {
        "@odata.context": string
        "@odata.type": string
        SettingsObject: Attributes
        SupportedApplyTimes: string[]
      }
    | undefined
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Actions: {}
  AssetTag: string
  Assembly: Attributes | undefined
  ChassisType: string
  Description: string
  Id: string
  Links: {
    ContainedBy: Attributes
    Contains: []
    "Contains@odata.count": number
    Drives: Attributes[]
    "Drives@odata.count": number
    ManagedBy: Attributes[]
    "ManagedBy@odata.count": number
    PCIeDevices: Attributes[] | undefined
    "PCIeDevices@Redfish.Deprecated": string | undefined
    "PCIeDevices@odata.count": number | undefined
    Storage: Attributes[]
    "Storage@odata.count": number
  }
  Location:
    | {
        Oem: {
          Dell: {
            "@odata.type": string
            PartLocation: {
              ExtendedReference: string
            }
          }
        }
        PartLocation: {
          LocationType: string
          Reference: string
        }
      }
    | undefined
  Manufacturer: string | null
  Model: string
  Name: string
  Oem:
    | {
        Dell: {
          "@odata.type": string
          DellChassisEnclosure: {
            AssetName: string | null
            BackplaneType: string
            Connector: number
            LastSystemInventoryTime: string
            LastUpdateTime: string
            Links: {
              DellEnclosureEMMCollection: []
              "DellEnclosureEMMCollection@odata.count": number
            }
            RAIDMultipath: string
            ServiceTag: string | null
            SlotCount: number
            TempProbeCount: number
            Version: string
            WiredOrder: number
          }
          DellEnclosure: {
            "@odata.context": string
            "@odata.id": string
            "@odata.type": string
            AssetName: string | null
            Connector: number
            Description: string
            Id: string
            LastSystemInventoryTime: string
            LastUpdateTime: string
            Links: {
              DellEnclosureEMMCollection: []
              "DellEnclosureEMMCollection@odata.count": number
            }
            Name: string
            ServiceTag: string | null
            SlotCount: number
            TempProbeCount: number
            Version: string
            WiredOrder: number
          }
          "DellEnclosure@Redfish.Deprecated": string
        }
      }
    | undefined
  PCIeDevices: Attributes | undefined
  PartNumber: string | null
  PowerState: string
  SKU: string
  SerialNumber: string | null
  Status: {
    Health: string
    HealthRollup: string
    State: string
  }
}

// /redfish/v1/Managers/iDRAC.Embedded.1
export interface Redfish_Managers {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Actions: {
    "#Manager.Reset": {
      "ResetType@Redfish.AllowableValues": Array<string>
      target: string
    }
    "#Manager.ResetToDefaults": {
      "ResetType@Redfish.AllowableValues": Array<string>
      target: string
    }
    Oem: {
      "#DellManager.ResetToDefaults": {
        "ResetType@Redfish.AllowableValues": Array<string>
        target: string
      }
      "#OemManager.ExportSystemConfiguration": {
        "ExportFormat@Redfish.AllowableValues": Array<string>
        "ExportUse@Redfish.AllowableValues": Array<string>
        "IncludeInExport@Redfish.AllowableValues": Array<string>
        ShareParameters: {
          "IgnoreCertificateWarning@Redfish.AllowableValues": Array<string>
          "ProxySupport@Redfish.AllowableValues": Array<string>
          "ProxyType@Redfish.AllowableValues": Array<string>
          "ShareType@Redfish.AllowableValues": Array<string>
          "Target@Redfish.AllowableValues": Array<string>
        }
        target: string
      }
      "#OemManager.ImportSystemConfiguration": {
        "ExecutionMode@Redfish.AllowableValues": Array<string>
        "HostPowerState@Redfish.AllowableValues": Array<string>
        "ImportSystemConfiguration@Redfish.AllowableValues": Array<string>
        ShareParameters: {
          "IgnoreCertificateWarning@Redfish.AllowableValues": Array<string>
          "ProxySupport@Redfish.AllowableValues": Array<string>
          "ProxyType@Redfish.AllowableValues": Array<string>
          "ShareType@Redfish.AllowableValues": Array<string>
          "Target@Redfish.AllowableValues": Array<string>
        }
        "ShutdownType@Redfish.AllowableValues": Array<string>
        target: string
      }
      "#OemManager.ImportSystemConfigurationPreview": {
        "ImportSystemConfigurationPreview@Redfish.AllowableValues": Array<string>
        ShareParameters: {
          "IgnoreCertificateWarning@Redfish.AllowableValues": Array<string>
          "ProxySupport@Redfish.AllowableValues": Array<string>
          "ProxyType@Redfish.AllowableValues": Array<string>
          "ShareType@Redfish.AllowableValues": Array<string>
          "Target@Redfish.AllowableValues": Array<string>
        }
        target: string
      }
    }
  }
  CommandShell: {
    ConnectTypesSupported: Array<string>
    "ConnectTypesSupported@odata.count": number
    MaxConcurrentSessions: number
    ServiceEnabled: boolean
  }
  DateTime: string
  DateTimeLocalOffset: string
  Description: string
  EthernetInterfaces: {
    "@odata.id": string
  }
  FirmwareVersion: string
  GraphicalConsole: {
    ConnectTypesSupported: Array<string>
    "ConnectTypesSupported@odata.count": number
    MaxConcurrentSessions: number
    ServiceEnabled: boolean
  }
  HostInterfaces: {
    "@odata.id": string
  }
  Id: string
  LastResetTime: string
  Links: {
    ActiveSoftwareImage: {
      "@odata.id": string
    }
    ManagerForChassis: Array<Attributes>
    "ManagerForChassis@odata.count": number
    ManagerForServers: Array<Attributes>
    "ManagerForServers@odata.count": number
    ManagerInChassis: {
      "@odata.id": string
    }
    Oem: {
      Dell: {
        "@odata.type": string
        DellAttributes: Array<Attributes>
        "DellAttributes@odata.count": number
        DellJobService: {
          "@odata.id": string
        }
        DellLCService: {
          "@odata.id": string
        }
        DellLicensableDeviceCollection: {
          "@odata.id": string
        }
        DellLicenseCollection: {
          "@odata.id": string
        }
        DellLicenseManagementService: {
          "@odata.id": string
        }
        DellOpaqueManagementDataCollection: {
          "@odata.id": string
        }
        DellPersistentStorageService: {
          "@odata.id": string
        }
        DellSwitchConnectionCollection: {
          "@odata.id": string
        }
        DellSwitchConnectionService: {
          "@odata.id": string
        }
        DellSystemManagementService: {
          "@odata.id": string
        }
        DellSystemQuickSyncCollection: {
          "@odata.id": string
        }
        DellTimeService: {
          "@odata.id": string
        }
        DellUSBDeviceCollection: {
          "@odata.id": string
        }
        DelliDRACCardService: {
          "@odata.id": string
        }
        DellvFlashCollection: {
          "@odata.id": string
        }
        Jobs: {
          "@odata.id": string
        }
      }
    }
    SoftwareImages: Array<Attributes>
    "SoftwareImages@odata.count": number
  }
  LogServices: {
    "@odata.id": string
  }
  ManagerType: string
  Model: string
  Name: string
  NetworkProtocol: {
    "@odata.id": string
  }
  Oem: {
    Dell: {
      "@odata.type": string
      DelliDRACCard: {
        "@odata.context": string
        "@odata.id": string
        "@odata.type": string
        Description: string
        IPMIVersion: string
        Id: string
        LastSystemInventoryTime: string
        LastUpdateTime: string
        Name: string
        URLString: string
      }
      RemoteSystemLogs: {
        CA: {
          Certificates: {
            "@odata.id": string
          }
        }
        HTTPS: {
          Certificates: {
            "@odata.id": string
          }
          SecureClientAuth: string
          SecurePort: number
          SecureServers: Array<string>
          "SecureServers@odata.count": number
          SecureSysLogEnable: string
        }
      }
    }
  }
  PowerState: string
  Redundancy: []
  "Redundancy@odata.count": number
  SerialConsole: {
    ConnectTypesSupported: []
    "ConnectTypesSupported@odata.count": number
    MaxConcurrentSessions: number
    ServiceEnabled: boolean
  }
  SerialInterfaces: {
    "@odata.id": string
  }
  Status: {
    Health: string
    State: string
  }
  TimeZoneName: string
  UUID: string
  VirtualMedia: {
    "@odata.id": string
  }
  "VirtualMedia@Redfish.Deprecated": string
}

// /redfish/v1/Managers/iDRAC.Embedded.1/EthernetInterfaces
export interface Redfish_Managers_Ethernet_interfaces {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: Array<Attributes>
  "Members@odata.count": number
  Name: string
}

interface ManagersIPv4Addresses {
  Address: string
  AddressOrigin: string
  Gateway: string
  SubnetMask: string
}
interface ManagersIPv6Addresses {
  Address: string
  AddressOrigin: string
  AddressState: string
  PrefixLength: number
}

// /redfish/v1/Managers/iDRAC.Embedded.1/EthernetInterfaces/:id
export interface Redfish_Managers_Ethernet_interfaces_id {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  AutoNeg: boolean
  Description: string
  EthernetInterfaceType: string
  FQDN: string
  FullDuplex: boolean
  HostName: string
  IPv4Addresses: Array<ManagersIPv4Addresses>
  "IPv4Addresses@odata.count": number
  IPv6AddressPolicyTable: []
  "IPv6AddressPolicyTable@odata.count": number
  IPv6Addresses: Array<ManagersIPv6Addresses>
  "IPv6Addresses@odata.count": number
  IPv6DefaultGateway: string
  IPv6StaticAddresses: [
    {
      Address: string
      PrefixLength: number
    }
  ]
  "IPv6StaticAddresses@odata.count": number
  Id: string
  InterfaceEnabled: boolean
  Links: {
    Chassis: {
      "@odata.id": string
    }
  }
  MACAddress: string
  MTUSize: number
  MaxIPv6StaticAddresses: number
  Name: string
  NameServers: Array<string>
  "NameServers@odata.count": number
  PermanentMACAddress: string
  SpeedMbps: number
  Status: {
    Health: string
    State: string
  }
  VLAN: {
    VLANEnable: boolean
    VLANId: number
  }
}

// /redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel
export interface Redfish_Managers_Log_services_SEL {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Actions: {
    "#LogService.ClearLog": {
      target: string
    }
  }
  DateTime: string
  DateTimeLocalOffset: string
  Description: string
  Entries: {
    "@odata.id": string
  }
  Id: string
  LogEntryType: string
  MaxNumberOfRecords: number
  Name: string
  OverWritePolicy: string
  ServiceEnabled: boolean
}

// /redfish/v1/Managers/iDRAC.Embedded.1/LogServices/Sel/Entries
export interface Redfish_Managers_Log_services_SEL_Entries {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: [
    {
      "@odata.id": string
      "@odata.type": string
      Created: string
      Description: string
      EntryCode: string
      EntryType: string
      GeneratorId: string
      Id: string
      Links: {}
      Message: string
      MessageArgs: []
      "MessageArgs@odata.count": number
      MessageId: string
      Name: string
      SensorNumber: number
      SensorType: string
      Severity: string
    }
  ]
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Chassis/System.Embedded.1/NetworkAdapters/
export interface Redfish_Chassis_Network_adapters {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: [
    {
      "@odata.id": string
    }
  ]
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Chassis/System.Embedded.1/NetworkAdapters/:networkCard
export interface Redfish_Chassis_Network_adapters_id {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Assembly: {
    "@odata.id": string
  }
  Controllers: [
    {
      ControllerCapabilities: {
        DataCenterBridging: {
          Capable: boolean
        }
        NPAR: {
          NparCapable: boolean
          NparEnabled: boolean
        }
        NPIV: {
          MaxDeviceLogins: number
          MaxPortLogins: number
        }
        NetworkDeviceFunctionCount: number
        NetworkPortCount: number
        VirtualizationOffload: {
          SRIOV: {
            SRIOVVEPACapable: boolean
          }
          VirtualFunction: {
            DeviceMaxCount: number
            MinAssignmentGroupSize: number
            NetworkPortMaxCount: number
          }
        }
      }
      FirmwarePackageVersion: string
      Links: {
        NetworkDeviceFunctions: [
          {
            "@odata.id": string
          },
          {
            "@odata.id": string
          }
        ]
        "NetworkDeviceFunctions@odata.count": number
        NetworkPorts: [
          {
            "@odata.id": string
          }
        ]
        "NetworkPorts@odata.count": number
        Oem: {
          Dell: {
            "@odata.type": string
            CPUAffinity: []
            "CPUAffinity@odata.count": number
          }
        }
      }
    },
    {
      ControllerCapabilities: {
        DataCenterBridging: {
          Capable: boolean
        }
        NPAR: {
          NparCapable: boolean
          NparEnabled: boolean
        }
        NPIV: {
          MaxDeviceLogins: number
          MaxPortLogins: number
        }
        NetworkDeviceFunctionCount: number
        NetworkPortCount: number
        VirtualizationOffload: {
          SRIOV: {
            SRIOVVEPACapable: boolean
          }
          VirtualFunction: {
            DeviceMaxCount: number
            MinAssignmentGroupSize: number
            NetworkPortMaxCount: number
          }
        }
      }
      FirmwarePackageVersion: string
      Links: {
        NetworkDeviceFunctions: [
          {
            "@odata.id": string
          }
        ]
        "NetworkDeviceFunctions@odata.count": number
        NetworkPorts: [
          {
            "@odata.id": string
          }
        ]
        "NetworkPorts@odata.count": number
        Oem: {
          Dell: {
            "@odata.type": string
            CPUAffinity: []
            "CPUAffinity@odata.count": number
          }
        }
      }
    }
  ]
  "Controllers@odata.count": number
  Description: string
  Id: string
  Manufacturer: string
  Model: string
  Name: string
  NetworkDeviceFunctions: {
    "@odata.id": string
  }
  NetworkPorts: {
    "@odata.id": string
  }
  PartNumber: string
  SerialNumber: string
  Status: {
    Health: string
    HealthRollup: string
    State: string
  }
}

// /redfish/v1/Chassis/System.Embedded.1/NetworkAdapters/:networkCard/NetworkPorts
export interface Redfish_Chassis_Network_adapters_id_Network_ports {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  Description: string
  Members: [
    {
      "@odata.id": string
    }
  ]
  "Members@odata.count": number
  Name: string
}

// /redfish/v1/Chassis/System.Embedded.1/NetworkAdapters/:networkCard/NetworkPorts/:port
export interface Redfish_Chassis_Network_adapters_id_Network_ports_port {
  "@odata.context": string
  "@odata.id": string
  "@odata.type": string
  ActiveLinkTechnology: string
  AssociatedNetworkAddresses: Array<string>
  CurrentLinkSpeedMbps: number
  Description: string
  EEEEnabled: null
  FlowControlConfiguration: string
  FlowControlStatus: string
  Id: string
  LinkStatus: string
  Name: string
  NetDevFuncMaxBWAlloc: [
    {
      MaxBWAllocPercent: null
      NetworkDeviceFunction: {
        "@odata.id": string
      }
    }
  ]
  "NetDevFuncMaxBWAlloc@odata.count": number
  NetDevFuncMinBWAlloc: [
    {
      MinBWAllocPercent: null
      NetworkDeviceFunction: {
        "@odata.id": string
      }
    }
  ]
  "NetDevFuncMinBWAlloc@odata.count": number
  Oem: {}
  PhysicalPortNumber: string
  Status: {
    State: string
    Health: string
    HealthRollup: string
  }
  SupportedEthernetCapabilities: Array<string>
  "SupportedEthernetCapabilities@odata.count": number
  SupportedLinkCapabilities: [
    {
      AutoSpeedNegotiation: boolean
      LinkNetworkTechnology: string
      LinkSpeedMbps: number
    }
  ]
  "SupportedLinkCapabilities@odata.count": number
  VendorId: string
  WakeOnLANEnabled: boolean
}

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
