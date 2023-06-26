import type { NextPage } from "next";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

interface IAddNodes {
  switch?: string;
  mgmt_switch?: string;
  nodes: string;
}

const Grendel: NextPage = () => {
  const { control, register, reset, handleSubmit, watch } = useForm<IAddNodes>();

  const onSubmit = (data: IAddNodes) => {
    console.log(data);
    const raw_node_arr = data.nodes.split("\n");
    const node_arr = raw_node_arr.map((node) => {
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
      return {
        host,
        core_port,
        mgmt_port,
      };
    });
  };

  const input_classes = "rounded-lg border px-2 py-1 dark:border-white dark:bg-neutral-700";
  return (
    <>
      <h1 className="text-2xl">Add Nodes</h1>
      <br />
      <div className="flex justify-center gap-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="text" className={input_classes} placeholder="Switch" {...register("switch")} />
          <input type="text" className={input_classes} placeholder="MGMT Switch" {...register("mgmt_switch")} />
          <br />
          <textarea
            className={`${input_classes} w-full`}
            aria-multiline
            rows={5}
            placeholder="cpn-z01-01:core_port, mgmt_port"
            {...register("nodes")}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
};

export default Grendel;
