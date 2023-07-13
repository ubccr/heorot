import Button from "~/components/button";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface IAddNodes {
  core_subnet: string;
  mgmt_subnet: string;
  rack: string;
  core_switch: string;
  mgmt_switch: string;
  nodes: string;
}

const Grendel: NextPage = () => {
  const { control, register, reset, handleSubmit, watch } = useForm<IAddNodes>();
  const [host_json, set_host_json] = useState<any[]>([]);

  const add_hosts = api.frontend.host.add.useMutation({
    onSuccess: (data) => {
      toast.success("Successfully added hosts!");
      set_host_json(data);
    },
    onError: () => toast.error("An issue occured!"),
  });

  const onSubmit = (data: IAddNodes) => {
    console.log(data);
    const raw_node_arr = data.nodes.split("\n");
    interface InodeArr {
      host: string;
      core_port: string;
      mgmt_port: string;
    }
    const node_arr: InodeArr[] = [];
    raw_node_arr.forEach((node) => {
      const [host, ports] = node.split(":");
      if (!ports || !host) {
        toast.error(
          <>
            <p>Invalid host format:</p>
            <p>{node}</p>
            <p>Expected: host:core_port,mgmt_port</p>
          </>
        );
        return;
      }
      const [core_port, mgmt_port] = ports.split(",");

      node_arr.push({
        host,
        core_port: core_port ?? "",
        mgmt_port: mgmt_port ?? "",
      });
    });
    console.log(node_arr);
    add_hosts.mutate({ ...data, nodes: node_arr });
  };

  const input_classes = "rounded-lg border px-2 py-1 dark:border-white dark:bg-neutral-700";
  return (
    <>
      <h1 className="text-2xl">Add Nodes</h1>
      <br />
      <div className="flex justify-center gap-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="text" className={input_classes} placeholder="Core Subnet" {...register("core_subnet")} />
          <input type="text" className={input_classes} placeholder="MGMT Subnet" {...register("mgmt_subnet")} />
          <input type="text" className={input_classes} placeholder="Rack" {...register("rack")} />
          <input type="text" className={input_classes} placeholder="Switch" {...register("core_switch")} />
          <input type="text" className={input_classes} placeholder="MGMT Switch" {...register("mgmt_switch")} />
          <br />
          <textarea
            className={`${input_classes} w-full`}
            aria-multiline
            rows={5}
            placeholder="cpn-z01-01:core_port, mgmt_port"
            {...register("nodes")}
          />
          <Button type="submit">Submit</Button>
        </form>
      </div>
      {add_hosts.isSuccess && (
        <div>
          <textarea
            className={`${input_classes} w-full`}
            aria-multiline
            rows={20}
            value={JSON.stringify(host_json, null, 4)}
          />
        </div>
      )}
    </>
  );
};

export default Grendel;
