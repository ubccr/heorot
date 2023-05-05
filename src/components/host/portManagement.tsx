import React, { useState } from "react";

import type { InterfaceStatus } from "@prisma/client";
import Modal from "../modal";
import ProgressBar from "../progressbar";
import { Tooltip } from "react-tooltip";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

const PortManagement = ({ host }: { host: string }) => {
  const interfaces = api.switches.interface.list.useQuery(host);
  const interface_mutation = api.switches.interface.refresh.useMutation();
  const config_interface_mutation =
    api.switches.interface.configure.useMutation({
      onSuccess: () => {
        setOpen(true);
        // refresh();
        // toast.success("Successfully updated interfaces");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  const [updatePortArr, setUpdatePortArr] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  async function refresh() {
    await interface_mutation.mutateAsync(host);
    await interfaces.refetch();
  }

  function addUpdatePort(port: string, checked: boolean) {
    if (checked) setUpdatePortArr([...updatePortArr, port]);
    if (!checked)
      setUpdatePortArr(updatePortArr.filter((ports) => ports !== port));
  }

  type FormData = {
    type: string;
    description: string;
    uplink_speed?: number;
    vlan_id: number;
    port_channel?: number;
  };

  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    config_interface_mutation.mutate({
      host: host,
      type: data.type,
      interfaces: updatePortArr,
      description: data.description,
      vlan_id: data.vlan_id,
      uplink_speed: data.uplink_speed,
      port_channel: data.port_channel,
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-center gap-3">
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises*/}
        <button type="button" onClick={() => refresh()}>
          Refresh
        </button>
        {interfaces.isLoading ||
          (interface_mutation.isLoading && <ProgressBar />)}
      </div>
      <table className="table table-fixed border-separate">
        <tbody>
          {interfaces.data?.map((blade, index) => (
            <React.Fragment key={`blade-${index}`}>
              <tr>
                <td colSpan={blade.length / 2 + 1}></td>
              </tr>
              <tr>
                {blade.map((port, index) => (
                  <PortGen
                    port={port}
                    index={index}
                    display="even"
                    addUpdatePort={addUpdatePort}
                    key={`port-${index}`}
                  />
                ))}
              </tr>
              <tr>
                {blade.map((port, index) => (
                  <PortGen
                    port={port}
                    index={index}
                    display="odd"
                    addUpdatePort={addUpdatePort}
                    key={`port-${index}`}
                  />
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <br />
      <Modal open={open} setOpen={setOpen} title="Configuration:">
        <pre>
          {config_interface_mutation.isSuccess &&
            config_interface_mutation.data}
        </pre>
      </Modal>
      <form
        /* eslint-disable-next-line @typescript-eslint/no-misused-promises*/
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-3 max-md:grid-cols-1"
      >
        <div className="col-auto flex gap-3">
          <label>type:</label>
          <input
            type="text"
            placeholder="native"
            required
            className="text-black"
            {...register("type")}
          />
        </div>

        <div className="col-auto flex gap-3">
          <label>description:</label>
          <input
            type="text"
            placeholder="swe-z01-01 - port 1/54"
            required
            className="text-black"
            {...register("description")}
          />
        </div>

        <div className="col-auto flex gap-3">
          <label>Vlan ID:</label>
          <input
            type="number"
            placeholder="2501"
            required
            className="text-black"
            {...register("vlan_id", { valueAsNumber: true })}
          />
        </div>

        <div className="col-auto flex gap-3">
          <label>Uplink Speed:</label>
          <input
            type="number"
            placeholder="100"
            className="text-black"
            {...register("uplink_speed", { valueAsNumber: true })}
          />
        </div>

        <div className="col-auto flex gap-3">
          <label>Port Channel:</label>
          <input
            type="number"
            placeholder="0"
            className="text-black"
            {...register("port_channel", { valueAsNumber: true })}
          />
        </div>

        <button type="submit">Submit Port(s)</button>
      </form>
    </div>
  );
};
export default PortManagement;

export const PortGen = ({
  port,
  index,
  display,
  addUpdatePort,
}: {
  port: InterfaceStatus[];
  index: number;
  display: string;
  addUpdatePort: (port: string, checked: boolean) => void;
}) => {
  const iface = port[0];
  if (!iface) return <td></td>;

  return (
    <React.Fragment key={`port-${index}`}>
      {index === 0 && display === "even" && (
        <td rowSpan={2} className="border border-white">
          {iface.port.replace(/Ethernet/gi, "").split("/")[0]}
        </td>
      )}
      {display === "even" && index % 2 === 0 && (
        <Ports iface={iface} addUpdatePort={addUpdatePort} />
      )}
      {display === "odd" && index % 2 === 1 && (
        <Ports iface={iface} addUpdatePort={addUpdatePort} />
      )}
    </React.Fragment>
  );
};

const Ports = ({
  iface,
  addUpdatePort,
}: {
  iface: InterfaceStatus;
  addUpdatePort: (port: string, checked: boolean) => void;
}) => {
  let border_color = "border-white";
  if (iface.line_protocol_status === "down") border_color = "border-red-600";
  else if (iface.line_protocol_status === "up")
    border_color = "border-green-600";
  else if (iface.line_protocol_status === "lowerLayerDown")
    border_color = "border-red-800";
  else if (iface.line_protocol_status === "lowerLayerDown")
    border_color = "border-red-800";
  else if (
    iface.line_protocol_status === "notPresent" &&
    iface.description === ""
  )
    border_color = "border-gray-400";
  else if (
    iface.line_protocol_status === "notPresent" &&
    iface.description !== ""
  )
    border_color = "border-teal-400";
  const tooltip_table = [
    { title: "Port", value: iface.port },
    { title: "Description", value: iface.description },
    { title: "Line Protocol", value: iface.line_protocol_status },
    { title: "Link Status", value: iface.link_status },
    { title: "Port Mode", value: iface.port_mode },
    { title: "Type", value: iface.type },
    { title: "Vlan ID", value: iface.vlan_id },
    { title: "Vlan Info", value: iface.vlan_info },
  ];
  return (
    <td
      data-tooltip-id={iface.id}
      className={`h-8 w-36 border ${border_color} hover:border-white hover:bg-neutral-500`}
    >
      <Tooltip id={iface.id}>
        <table className="table-auto">
          <tbody>
            {tooltip_table.map((row, index) => {
              if (row.value)
                return (
                  <tr key={index}>
                    <td className="border-b border-white">{row.title}</td>
                    <td className="border-b border-white">{row.value}</td>
                  </tr>
                );
            })}
          </tbody>
        </table>
      </Tooltip>
      {iface.port.split("/")[1]}
      <input
        type="checkbox"
        className="float-right"
        onChange={(event) =>
          addUpdatePort(iface?.port ?? "", event.target.checked)
        }
      />
    </td>
  );
};
