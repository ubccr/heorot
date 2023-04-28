import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useFieldArray, useForm } from "react-hook-form";

// import Backups from "~/components/node/backups";
import type { IGrendelHost } from "~/types/grendel";
import { api } from "~/utils/api";
import { toast } from "react-toastify";

const Grendel = ({ node }: { node: string }) => {
  const { control, register, reset, handleSubmit } = useForm<IGrendelHost>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "interfaces",
  });

  const node_res = api.grendel.host.find.useQuery(node, {
    enabled: !!node,
    retry: 2,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      // TODO: fix initial form values
      reset(data[0], { keepDirtyValues: true });
    },
  });

  const onSubmit = (data: IGrendelHost) => {
    console.log(data);
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form onSubmit={handleSubmit(onSubmit)}>
      <table>
        <tbody>
          <tr>
            <td>Provision:</td>
            <td>
              {node_res.isSuccess && node_res.data[0]?.provision.toString()}
            </td>
          </tr>
          <tr>
            <td>Tags:</td>
            <td>{node_res.isSuccess && node_res.data[0]?.tags.join(", ")}</td>
          </tr>
          <tr>
            <td>Boot Image:</td>
            <td>{node_res.isSuccess && node_res.data[0]?.boot_image}</td>
          </tr>
          <tr>
            <td>Firmware:</td>
            <td>{node_res.isSuccess && node_res.data[0]?.firmware}</td>
          </tr>
          <tr>
            <td>Interfaces:</td>
            <td>
              <PlusIcon
                className="h-6 w-6 rounded-lg hover:bg-neutral-600"
                onClick={() =>
                  append({
                    fqdn: "",
                    ifname: "",
                    ip: "",
                    mac: "",
                    mtu: 1500,
                    vlan: "",
                    bmc: false,
                  })
                }
              >
                Add
              </PlusIcon>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              {fields.map((field, index) => {
                const input_arr = [
                  {
                    label: "FQDN",
                    register_id: `interfaces.${index}.fqdn`,
                  },
                  {
                    label: "Name",
                    register_id: `interfaces.${index}.ifname`,
                  },
                  {
                    label: "IP",
                    register_id: `interfaces.${index}.ip`,
                  },
                  {
                    label: "MAC",
                    register_id: `interfaces.${index}.mac`,
                  },
                  {
                    label: "MTU",
                    register_id: `interfaces.${index}.mtu`,
                  },
                  {
                    label: "VLAN",
                    register_id: `interfaces.${index}.vlan`,
                  },
                ];
                return (
                  <div className="grid grid-cols-2 gap-3" key={field.id}>
                    <XMarkIcon
                      onClick={() => remove(index)}
                      className="h-6 w-6 rounded-lg  hover:bg-neutral-600"
                    />
                    {input_arr.map((input, input_index) => (
                      <div className="flex gap-2" key={input_index}>
                        <label>{input.label}</label>
                        <input
                          className="rounded-md border border-black text-black"
                          autoComplete="off"
                          autoCorrect="off"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          {...register<any>(input.register_id)}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </td>
          </tr>
        </tbody>
      </table>
      <button type="submit" className="border border-white p-2">
        Submit
      </button>
    </form>
  );
};

export default Grendel;
