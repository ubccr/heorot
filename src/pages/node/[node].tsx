import { useFieldArray, useForm } from "react-hook-form";

// import Backups from "~/components/node/backups";
import type { IGrendelHost } from "~/types/grendel";
import type { NextPage } from "next";
import PortManagement from "~/components/node/portManagement";
import { Tab } from "@headlessui/react";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const Node: NextPage = () => {
  const router = useRouter();
  const node = router.query.node as string;

  const node_res = api.grendel.host.find.useQuery(node, {
    enabled: !!node,
    retry: 2,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      reset(data, { keepDirtyValues: true });
    },
  });

  const { control, register, reset, handleSubmit } = useForm<IGrendelHost>();

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control, // control props comes from useForm (optional: if you are using FormContext)
      name: "0.interfaces", // unique name for your Field Array
    }
  );

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      <h1>{node}</h1>
      <br />
      <Tab.Group>
        <Tab.List className="flex justify-center gap-3 ">
          <Tab
            className={({ selected }) =>
              classNames(
                " border-b border-white px-2 py-1 selection:bg-neutral-600 hover:bg-neutral-600",
                selected ? "bg-neutral-600 shadow" : ""
              )
            }
          >
            Grendel
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                " border-b border-white px-2 py-1 selection:bg-neutral-600 hover:bg-neutral-600",
                selected ? "bg-neutral-600 shadow" : ""
              )
            }
          >
            Redfish
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                " border-b border-white px-2 py-1 selection:bg-neutral-600 hover:bg-neutral-600",
                selected ? "bg-neutral-600 shadow" : ""
              )
            }
          >
            Port Management
          </Tab>
          {/* <Tab
            className={({ selected }) =>
              classNames(
                " border-b border-white px-2 py-1 selection:bg-neutral-600 hover:bg-neutral-600",
                selected ? "bg-neutral-600 shadow" : ""
              )
            }
          >
            Backups
          </Tab> */}
        </Tab.List>
        <br />
        <Tab.Panels>
          <Tab.Panel>
            <form>
              <table>
                <tbody>
                  <tr>
                    <td>Provision:</td>
                    <td>
                      {node_res.isSuccess &&
                        node_res.data[0]?.provision.toString()}
                    </td>
                  </tr>
                  <tr>
                    <td>Tags:</td>
                    <td>
                      {node_res.isSuccess && node_res.data[0]?.tags.join(", ")}
                    </td>
                  </tr>
                  <tr>
                    <td>Boot Image:</td>
                    <td>
                      {node_res.isSuccess && node_res.data[0]?.boot_image}
                    </td>
                  </tr>
                  <tr>
                    <td>Firmware:</td>
                    <td>{node_res.isSuccess && node_res.data[0]?.firmware}</td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      {fields.map((field, index) => (
                        <div
                          className="grid grid-cols-2 grid-rows-6 gap-3"
                          key={field.id}
                        >
                          <div className="col-span-2 flex gap-2">
                            <label htmlFor={`0.interfaces.${index}.fqdn`}>
                              FQDN:
                            </label>
                            <input
                              id={`0.interfaces.${index}.fqdn`}
                              className="rounded-md border border-black text-black"
                              {...register(`0.interfaces.${index}.fqdn`)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <label htmlFor={`0.interfaces.${index}.ifname`}>
                              Name:
                            </label>
                            <input
                              id={`0.interfaces.${index}.ifname`}
                              className="rounded-md border border-black text-black"
                              {...register(`0.interfaces.${index}.ifname`)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <label htmlFor={`0.interfaces.${index}.ip`}>
                              IP:
                            </label>
                            <input
                              id={`0.interfaces.${index}.ip`}
                              className="rounded-md border border-black text-black"
                              {...register(`0.interfaces.${index}.ip`)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <label htmlFor={`0.interfaces.${index}.mac`}>
                              MAC:
                            </label>
                            <input
                              id={`0.interfaces.${index}.mac`}
                              className="rounded-md border border-black text-black"
                              {...register(`0.interfaces.${index}.mac`)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <label htmlFor={`0.interfaces.${index}.mtu`}>
                              MTU:
                            </label>
                            <input
                              id={`0.interfaces.${index}.mtu`}
                              className="rounded-md border border-black text-black"
                              {...register(`0.interfaces.${index}.mtu`)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <label htmlFor={`0.interfaces.${index}.vlan`}>
                              VLAN:
                            </label>
                            <input
                              id={`0.interfaces.${index}.vlan`}
                              className="rounded-md border border-black text-black"
                              {...register(`0.interfaces.${index}.vlan`)}
                            />
                          </div>
                        </div>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </Tab.Panel>
          <Tab.Panel></Tab.Panel>
          <Tab.Panel>{!!node && <PortManagement node={node} />}</Tab.Panel>
          {/* <Tab.Panel>{!!node && <Backups node={node} />}</Tab.Panel> */}
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

export default Node;
