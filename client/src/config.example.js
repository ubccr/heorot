export const apiConfig = {
  apiUrl: `https://${window.location.host}`, // set to API url (ex: https://api_ip_here:443)

  // Grendel add node default config
  grendelDomain: "", // set to domain name ex: if a node's FQDN is cpn-z01-01.compute.local then set to compute.local
  grendelSubnet: "", // interface subnet ex: 10.64.0.0
  grendelBmcSubnet: "", // bmc subnet
}
