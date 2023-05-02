import { z } from "zod";

export const maas_machines_schema = z.object({
  domain: z.object({
    authoritative: z.boolean(),
    ttl: z.number().nullable(), //? verify
    id: z.number(),
    resource_record_count: z.number(),
    is_default: z.boolean(),
    name: z.string(),
    resource_uri: z.string(),
  }),
  cpu_speed: z.number(),
  boot_disk: z.object({
    firmware_version: z.string(),
    partition_table_type: z.string(),
    numa_node: z.number(),
    model: z.string(),
    tags: z.string().array(), //? verify
    path: z.string(),
    block_size: z.number(),
    type: z.string(),
    used_size: z.number(),
    partitions: z
      .object({
        uuid: z.string(),
        size: z.number(),
        bootable: z.boolean(),
        tags: z.string().array(),
        device_id: z.number(),
        id: z.number(),
        type: z.string(),
        filesystem: z.object({
          fstype: z.string(),
          label: z.string(),
          uuid: z.string(),
          mount_point: z.string(),
          mount_options: z.string().nullable(), //? verify
        }),
        used_for: z.string(),
        system_id: z.string(),
        path: z.string(),
        resource_uri: z.string(),
      })
      .array(),
    name: z.string(),
    id_path: z.string(),
    id: z.number(),
    size: z.number(),
    used_for: z.string(),
    available_size: z.number(),
    uuid: z.string().nullable(), //? verify
    system_id: z.string(),
    storage_pool: z.string().nullable(), //? verify
    filesystem: z.string().nullable(), //? verify
    serial: z.string(),
    resource_uri: z.string(),
  }),
  raids: z.object({}).array(), //? verify
  commissioning_status_name: z.string(),
  status_name: z.string(),
  other_test_status: z.number(),
  storage_test_status_name: z.string(),
  ip_addresses: z.string().array(),
  owner_data: z.object({}),
  next_sync: z.string().nullable(), //? verify
  memory_test_status: z.number(),
  interface_test_status: z.number(),
  memory_test_status_name: z.string(),
  sync_interval: z.string().nullable(), //? verify
  blockdevice_set: z
    .object({
      firmware_version: z.string(),
      partition_table_type: z.string(),
      numa_node: z.number(),
      model: z.string(),
      tags: z.string().array(),
      path: z.string(),
      block_size: z.number(),
      type: z.string(),
      used_size: z.number(),
      partitions: z
        .object({
          uuid: z.string(),
          size: z.number(),
          bootable: z.boolean(),
          tags: z.string().array(), //? verify
          device_id: z.number(),
          id: z.number(),
          type: z.string(),
          filesystem: z.object({
            fstype: z.string(),
            label: z.string(),
            uuid: z.string(),
            mount_point: z.string(),
            mount_options: z.string().nullable(), //? verify
          }),
          used_for: z.string(),
          system_id: z.string(),
          path: z.string(),
          resource_uri: z.string(),
        })
        .array(),
      name: z.string(),
      id_path: z.string(),
      id: z.number(),
      size: z.number(),
      used_for: z.string(),
      available_size: z.number(),
      uuid: z.string().nullable(), //? verify
      system_id: z.string(),
      storage_pool: z.string().nullable(), //? verify
      filesystem: z.string().nullable(), //? verify
      serial: z.string(),
      resource_uri: z.string(),
    })
    .array(),
  hostname: z.string(),
  interface_test_status_name: z.string(),
  storage_test_status: z.number(),
  special_filesystems: z.string().array(), //? verify
  swap_size: z.number().optional(),
  memory: z.number(),
  cache_sets: z.string().array(), //? verify
  zone: z.object({
    name: z.string(),
    description: z.string(),
    id: z.number(),
    resource_uri: z.string(),
  }),
  address_ttl: z.string().nullable(), //? verify
  power_state: z.string(),
  current_installation_result_id: z.number(),
  other_test_status_name: z.string(),
  interface_set: z
    .object({
      effective_mtu: z.number(),
      links: z.string().array(), //? verify
      numa_node: z.number(),
      tags: z.string().array(), //? verify
      product: z.string(),
      type: z.string(),
      link_connected: z.boolean(),
      name: z.string(),
      id: z.number(),
      sriov_max_vf: z.number(),
      vlan: z.object({
        vid: z.number(),
        mtu: z.number(),
        dhcp_on: z.boolean(),
        external_dhcp: z.string().nullable(), //? verify
        relay_vlan: z.string().nullable(), //? verify
        fabric_id: z.number(),
        id: z.number(),
        secondary_rack: z.string().nullable(), //? verify
        space: z.string(),
        name: z.string(),
        fabric: z.string(),
        primary_rack: z.string().nullable(), //? verify
        resource_uri: z.string(),
      }),
      vendor: z.string(),
      children: z.string().array(),
      mac_address: z.string(),
      system_id: z.string(),
      enabled: z.boolean(),
      interface_speed: z.number(),
      params: z.string(),
      discovered: z.string().nullable(), //? verify
      parents: z.string().array(), //? verify
      firmware_version: z.string(),
      link_speed: z.number(),
      resource_uri: z.string(),
    })
    .array(),
  cpu_test_status_name: z.string(),
  owner: z.string(),
  node_type: z.number(),
  commissioning_status: z.number(),
  network_test_status: z.number(),
  power_type: z.string(),
  default_gateways: z.object({
    ipv4: z.object({
      gateway_ip: z.string(),
      link_id: z.number().nullable(), //? verify
    }),
    ipv6: z.object({
      gateway_ip: z.string().nullable(),
      link_id: z.number().nullable(), //? verify
    }),
  }),
  last_sync: z.string().nullable(), //? verify
  virtualmachine_id: z.number().nullable(), //? verify
  numanode_set: z
    .object({
      index: z.number(),
      memory: z.number(),
      cores: z.number().array(),
      hugepages_set: z.number().array(), //? verify
    })
    .array(),
  workload_annotations: z.object({}), //? verify
  bcaches: z.string().array(), //? verify
  hardware_uuid: z.string(),
  netboot: z.boolean(),
  description: z.string(),
  pool: z.object({
    name: z.string(),
    description: z.string(),
    id: z.number(),
    resource_uri: z.string(),
  }),
  status_message: z.string(),
  current_commissioning_result_id: z.number(),
  bios_boot_method: z.string(),
  hwe_kernel: z.string(),
  status_action: z.string(),
  current_testing_result_id: z.number(),
  testing_status_name: z.string(),
  system_id: z.string(),
  cpu_count: z.number(),
  boot_interface: z.object({
    effective_mtu: z.number(),
    links: z.string().array(), //? verify
    numa_node: z.number(),
    tags: z.string().array(), //? verify
    product: z.string(),
    type: z.string(),
    link_connected: z.boolean(),
    name: z.string(),
    id: z.number(),
    sriov_max_vf: z.number(),
    vlan: z.object({
      vid: z.number(),
      mtu: z.number(),
      dhcp_on: z.boolean(),
      external_dhcp: z.boolean().nullable(), //? verify
      relay_vlan: z.number().nullable(), //? verify,
      fabric_id: z.number(),
      id: z.number(),
      secondary_rack: z.string().nullable(), //? verify
      space: z.string(),
      name: z.string(),
      fabric: z.string(),
      primary_rack: z.string(),
      resource_uri: z.string(),
    }),
    vendor: z.string(),
    children: z.string().array(),
    mac_address: z.string(),
    system_id: z.string(),
    enabled: z.boolean(),
    interface_speed: z.number(),
    params: z.string(),
    discovered: z.string().array(), //? verify
    parents: z.string().array(), //? verify
    firmware_version: z.string(),
    link_speed: z.number(),
    resource_uri: z.string(),
  }),
  testing_status: z.number(),
  cpu_test_status: z.number(),
  locked: z.boolean(),
  osystem: z.string(),
  distro_series: z.string(),
  disable_ipv4: z.boolean(),
  node_type_name: z.string(),
  status: z.number(),
  volume_groups: z.string().array(), //? verify
  min_hwe_kernel: z.string(),
  storage: z.number(),
  hardware_info: z.object({
    system_vendor: z.string(),
    system_product: z.string(),
    system_family: z.string(),
    system_version: z.string(),
    system_sku: z.string(),
    system_serial: z.string(),
    cpu_model: z.string(),
    mainboard_vendor: z.string(),
    mainboard_product: z.string(),
    mainboard_serial: z.string(),
    mainboard_version: z.string(),
    mainboard_firmware_vendor: z.string(),
    mainboard_firmware_date: z.string(),
    mainboard_firmware_version: z.string(),
    chassis_vendor: z.string(),
    chassis_type: z.string(),
    chassis_serial: z.string(),
    chassis_version: z.string(),
  }),
  fqdn: z.string(),
  network_test_status_name: z.string(),
  virtualblockdevice_set: z.string().array(), //? verify
  architecture: z.string(),
  physicalblockdevice_set: z
    .object({
      firmware_version: z.string(),
      partition_table_type: z.string(),
      numa_node: z.number(),
      model: z.string(),
      tags: z.string().array(),
      path: z.string(),
      block_size: z.number(),
      type: z.string(),
      used_size: z.number(),
      partitions: z
        .object({
          uuid: z.string(),
          size: z.number(),
          bootable: z.boolean(),
          tags: z.string().array(),
          device_id: z.number(),
          id: z.number(),
          type: z.string(),
          filesystem: z.object({
            fstype: z.string(),
            label: z.string(),
            uuid: z.string(),
            mount_point: z.string(),
            mount_options: z.string().optional(), //? verify
          }),
          used_for: z.string(),
          system_id: z.string(),
          path: z.string(),
          resource_uri: z.string(),
        })
        .array(),
      name: z.string(),
      id_path: z.string(),
      id: z.number(),
      size: z.number(),
      used_for: z.string(),
      available_size: z.number(),
      uuid: z.string().nullable(), //? verify
      system_id: z.string(),
      storage_pool: z.string().nullable(), //? verify
      filesystem: z.string().nullable(), //? verify
      serial: z.string(),
      resource_uri: z.string(),
    })
    .array(),
  pod: z.string().nullable(), //? verify
  tag_names: z.string().array(),
  resource_uri: z.string(),
});

export type maas_machines = z.infer<typeof maas_machines_schema>;
