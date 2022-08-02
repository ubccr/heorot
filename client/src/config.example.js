export const apiConfig = {
  apiUrl: `https://${window.location.host}`, // set to API url (ex: https://api_ip_here:443)

  // Grendel add node default config
  grendelDomain: "", // set to domain name ex: if a node's FQDN is cpn-z01-01.compute.local then set to compute.local
  grendelSubnet: "", // interface subnet ex: 10.64.0.0
  grendelBmcSubnet: "", // bmc subnet

  // FloorPlan layout - changes grid size in "FloorPlan"
  floorplan: {
    floorX: [..."defghijklmnopqrstuvw"],
    floorY: [
      "28",
      "27",
      "26",
      "25",
      "24",
      "23",
      "22",
      "21",
      "17",
      "16",
      "15",
      "14",
      "13",
      "12",
      "11",
      "10",
      "09",
      "08",
      "07",
      "06",
      "05",
    ],
  },
}
