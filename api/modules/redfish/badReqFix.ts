import { apiResponse, api_request } from "../redfish"

import { Auth } from "./auth"

// TODO: migrate to new response format: {success: boolean}
export default async function dell_badRequestFix(fqdn: string, auth: Auth) {
  let idrac_name = fqdn.split(".")[0]
  let domain_name = fqdn.split(".").splice(1).join(".")

  const endpoint = "/redfish/v1/Managers/iDRAC.Embedded.1/Attributes"
  const body = JSON.stringify({
    Attributes: {
      "NIC.1.DNSDomainFromDHCP": "Disabled",
      "NIC.1.DNSDomainNameFromDHCP": "Disabled",
      "NIC.1.DNSDomainName": domain_name,
      "NIC.1.DNSRacName": idrac_name,
    },
  })
  let res: apiResponse<Response> = await api_request(endpoint, auth, "PATCH", false, body)
  if (res.success === false || !res.data) return { ...res, status: "error" }
  if (res.data.status === 200) return { status: "success", message: "Successfully modified iDRAC values" }
  else return { status: "error", message: "Error sending redfish request" }
}
module.exports = { dell_badRequestFix }
