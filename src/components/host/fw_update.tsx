import Button from "../button";
import { api } from "~/utils/api";
import { toast } from "react-toastify";

export const Fw_update = ({ host }: { host: string }) => {
  const firmware_list = api.redfish.get.firmware_collection.useQuery(host);
  const firmware_refresh = api.redfish.refresh.firmware_collection.useMutation({
    onSuccess: () => {
      toast.success("Firmware list refreshed");
      void firmware_list.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const available_fw = api.redfish.actions.get.latest_firmware.useMutation({
    onSuccess: () => {
      toast.success("Available firmware updates refreshed");
      void firmware_list.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const td_classes = "border border-gray-300 p-2";
  return (
    <>
      <table className="mb-2">
        <thead>
          <tr>
            <th className={td_classes}>Name</th>
            <th className={td_classes}>Type</th>
            <th className={td_classes}>Version</th>
            <th className={td_classes}>Installed</th>
            <th className={td_classes}>ID</th>
          </tr>
        </thead>
        <tbody>
          {firmware_list.data?.map((fw, index) => (
            <tr
              key={index}
              className={
                fw.type === "Previous" ? "bg-neutral-200" : "" || fw.type === "Available" ? "bg-green-200" : ""
              }
            >
              <td className={td_classes}>{fw.name}</td>
              <td className={td_classes}>{fw.type}</td>
              <td className={td_classes}>{fw.version}</td>
              <td className={td_classes}>{fw.install_date?.toLocaleString()}</td>
              <td className={td_classes}>{fw.component_id}</td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </table>
      <div className="flex justify-center gap-2">
        <Button onClick={() => firmware_refresh.mutate(host)}>Refresh Firmware</Button>
        <Button onClick={() => available_fw.mutate(host)}>Pull Latest FW</Button>
      </div>
    </>
  );
};
