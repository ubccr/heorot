const { api_request } = require("./redfish")

async function dell_sel(uri, token, version) {
  let versionArr = version.split(".")
  if (versionArr[0] === 1 && versionArr[1] < 4) {
    let url = uri + `/redfish/v1/Managers/iDRAC.Embedded.1/Logs/Sel`
    let res = await api_request(url, token)

    if (res.status === "success") {
      return {
        status: res.status,
        count: res.data["Members@odata.count"] ?? 0,
        logs: res.data.Members.map((val) => {
          return {
            created: val.Created,
            message: val.Message,
            severity: val.Severity,
          }
        }),
      }
    } else return res
  } else {
    let top = "10"
    let url = uri + `/redfish/v1/Managers/iDRAC.Embedded.1/Logs/Sel/?$top=${top}`

    let res = await api_request(url, token)

    if (res.status === "success") {
      return {
        status: res.status,
        count: res.data["Members@odata.count"] ?? 0,
        logs: res.data.Members.map((val) => {
          return {
            created: val.Created,
            message: val.Message,
            severity: val.Severity,
          }
        }),
      }
    } else if (
      res.error["@Message.ExtendedInfo"] !== undefined &&
      res.error["@Message.ExtendedInfo"][0].MessageArgs.length > 0
    ) {
      top = res.error["@Message.ExtendedInfo"][0].MessageArgs[2].replace(")", "").split("-")[1]
      url = uri + `/redfish/v1/Managers/iDRAC.Embedded.1/Logs/Sel/?$top=${top}`

      res = await api_request(url, token)
      return {
        status: res.status,
        count: res.data["Members@odata.count"] ?? 0,
        logs: res.data.Members.map((val) => {
          return {
            created: val.Created,
            message: val.Message,
            severity: val.Severity,
          }
        }),
      }
    } else return res
  }
}

async function sm_sel(uri, token) {
  const url = uri + "/redfish/v1/Systems/1/LogServices/Log1/Entries/?$top=10"

  let res = await api_request(url, token)

  if (res.status === "success") {
    return {
      status: res.status,
      count: res.data["Members@odata.count"] ?? 0,
      logs: res.data.Members.map((val) => {
        return {
          created: val.Created,
          message: val.Message,
          severity: val.Severity,
        }
      }).reverse(),
    }
  } else return res
}

async function hpe_sel(uri, token) {
  // Doesn't support $top filter
  const url = uri + "/redfish/v1/Systems/1/LogServices/IML/Entries"

  let res = await api_request(url, token)

  if (res.status === "success") {
    return {
      status: res.status,
      count: res.data["Members@odata.count"] ?? 0,
      logs: res.data.Items.map((val, index) => {
        if (index < 10) {
          return {
            created: val.Created,
            message: val.Message,
            severity: val.Severity,
          }
        } else return null
      })
        .filter(Boolean)
        .reverse(),
    }
  } else return res
}

module.exports = {
  dell_sel,
  sm_sel,
  hpe_sel,
}
