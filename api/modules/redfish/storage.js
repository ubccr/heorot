const { api_request } = require("./redfish")

async function dell_storage(uri, token, version) {
  let tmp_url = uri + "/redfish/v1/Systems/System.Embedded.1/Storage"
  let tmp_res = await api_request(tmp_url, token)
  if (tmp_res.status === "success") {
    const urls = tmp_res.data.Members.map((val) => {
      return uri + val["@odata.id"]
    })

    tmp_res = await api_request(urls, token)

    // Find the Storage Controller containing Drives
    let res = tmp_res.data
      .map((val) => {
        if (val.Drives.length > 0) return val
      })
      .filter(Boolean)[0]
    res.status = tmp_res.status
    let storageController = res.StorageControllers[0] ?? null

    // Enclosure - Cannot find redfish route on -v1.4.0 nodes 😞
    // All of this just to get total enclosure disk count
    let versionArr = version.split(".")
    if (versionArr[0] > 1 || versionArr[1] > 4) {
      tmp_url = res.Links.Enclosures.map((val) => {
        let url_arr = val["@odata.id"].split("/")
        if (url_arr[4].substring(0, 3) === "Enc") return uri + val["@odata.id"]
      }).filter(Boolean)[0]

      let enclosure_res = await api_request(tmp_url, token)
      res.slotCount = enclosure_res.data.Oem.Dell.DellEnclosure.SlotCount
    } else res.slotCount = null

    // Volumes
    tmp_url = uri + res.Volumes["@odata.id"]
    tmp_res = await api_request(tmp_url, token)

    let volume_urls = tmp_res.data.Members.map((val) => uri + val["@odata.id"])
    let volume_res = await api_request(volume_urls, token)
    let volumes = volume_res.data.map((val) => {
      let capacity =
        val.CapacityBytes > 1000000000000
          ? (val.CapacityBytes / 1100000000000).toPrecision(3) + " TiB"
          : (val.CapacityBytes / 1074000000).toPrecision(3) + " GiB"
      return {
        name: val.Name,
        driveStatus: val.Status.Health,
        RAIDType: val.RAIDType,
        capacity: capacity,
      }
    })

    // Drives
    let tmp2_urls = res.Drives.map((val) => uri + val["@odata.id"])
    let tmp2_res = await api_request(tmp2_urls, token)
    let drives = tmp2_res.data.map((val) => {
      let capacity =
        val.CapacityBytes > 1000000000000
          ? (val.CapacityBytes / 1100000000000).toPrecision(3) + " TiB"
          : (val.CapacityBytes / 1074000000).toPrecision(3) + " GiB"
      return {
        blockSize: val.BlockSizeBytes,
        capableSpeed: val.CapableSpeedGbs,
        capacity: capacity,
        description: val.Description,
        failurePredicted: val.FailurePredicted,
        hotspareType: val.HotspareType,
        id: val.Id,
        manufacturer: val.Manufacturer,
        mediaType: val.MediaType,
        model: val.Model,
        name: val.Name,
        negotiatedSpeed: val.NegotiatedSpeed,
        protocol: val.Protocol,
        rotationSpeed: val.RotationSpeedRPM,
        serialNumber: val.SerialNumber,
        driveStatus: val.Status.Health,
      }
    })
    return {
      status: res.status,
      slotCount: res.slotCount,
      driveCount: res["Drives@odata.count"],
      controller: storageController.Name,
      cardStatus: storageController.Status.Health,
      firmware: storageController.FirmwareVersion,
      speed: storageController.SpeedGbps ?? null,
      volumes: volumes,
      drives: drives,
    }
  } else {
    return tmp_res
  }
}

async function sm_storage(uri, token) {
  // Cannot implement without a license 😞
  return {
    status: "error",
    message: "Storage request not implemented on Supermicro nodes",
  }
}

async function hpe_storage(uri, token) {
  return {
    status: "error",
    message: "Storage request not implemented on HPE nodes",
  }
}

module.exports = {
  dell_storage,
  sm_storage,
  hpe_storage,
}
