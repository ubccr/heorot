export interface host_interface {
  mac: string
  ip: string
  ifname: string
  fqdn: string
  bmc: true
  vlan: string
}

export interface host {
  id: string
  firmware: string
  name: string
  interfaces: host_interface[]
  provision: true
  boot_image: string
  tags: string[]
}

// export interface
