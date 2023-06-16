import { api } from "~/utils/api";

const Redfish = ({ host }: { host: string }) => {
  const redfish = api.redfish.get.useQuery(host);
  return (
    <>
      <table>
        {!!redfish.data && (
          <tbody>
            <tr>
              <td>Host</td>
              <td>{redfish.data.host}</td>
            </tr>
            <tr>
              <td>Host Name</td>
              <td>{redfish.data.host_name}</td>
            </tr>
            <tr>
              <td>Manufacturer</td>
              <td>{redfish.data.manufacturer}</td>
            </tr>
            <tr>
              <td>Model</td>
              <td>{redfish.data.model}</td>
            </tr>
            <tr>
              <td>Service Tag</td>
              <td>{redfish.data.service_tag}</td>
            </tr>
            <tr>
              <td>Bios Version</td>
              <td>{redfish.data.bios_version}</td>
            </tr>
            {!!redfish.data.boot_progress_last_state && (
              <tr>
                <td>Last Boot Progress</td>
                <td>{redfish.data.boot_progress_last_state}</td>
              </tr>
            )}
            {!!redfish.data.last_reset_time && (
              <tr>
                <td>Last Reset Time</td>
                <td>{new Date(redfish.data.last_reset_time).toLocaleString()}</td>
              </tr>
            )}
            {!!redfish.data.location_indicator_active && (
              <tr>
                <td>Location Indicator Active</td>
                <td>{redfish.data.location_indicator_active.toString()}</td>
              </tr>
            )}
            <tr>
              <td>Asset Tag</td>
              <td>{redfish.data.asset_tag}</td>
            </tr>
            <tr>
              <td>System Type</td>
              <td>{redfish.data.system_type}</td>
            </tr>
          </tbody>
        )}
      </table>
    </>
  );
};

export default Redfish;
