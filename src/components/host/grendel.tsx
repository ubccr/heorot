import {
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useFieldArray, useForm } from "react-hook-form";

// import Backups from "~/components/host/backups";
import type { IGrendelHost } from "~/types/grendel";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useState } from "react";

const Grendel = ({ host }: { host: string }) => {
  const [tags, setTags] = useState<string[]>([]);

  // initialize form
  const { control, register, reset, handleSubmit, watch } =
    useForm<IGrendelHost>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "interfaces",
  });

  // fetch host data, set form data and tags
  const host_res = api.grendel.host.find.useQuery(host, {
    enabled: !!host,
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      // TODO: fix initial form values
      if (!!data[0]) {
        reset(data[0], { keepDirtyValues: true });
        setTags(data[0].tags);
      }
    },
  });
  // get boot images and firmware
  const boot_images_res = api.grendel.image.list.useQuery();
  const firmware_res = api.grendel.host.firmware.useQuery();

  const onSubmit = (data: IGrendelHost) => {
    data.tags = tags;
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
              <input type="checkbox" {...register("provision")} />
            </td>
          </tr>
          <tr>
            <td>Tags:</td>
            <td className="flex gap-1">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-full border dark:bg-neutral-700 px-2 py-1 dark:border-white"
                >
                  <div className="max-w-full flex-initial text-xs font-normal leading-none">
                    {tag}
                  </div>
                  <XMarkIcon
                    className="ml-1 h-3 w-3 hover:text-neutral-600 dark:hover:text-neutral-200"
                    onClick={() => setTags(tags.filter((val) => val !== tag))}
                  />
                </div>
              ))}
            </td>
          </tr>
          <tr>
            <td>Boot Image:</td>
            <td>
              <select
                {...register("boot_image")}
                className="rounded-lg border p-1 text-gray-900 dark:border-white dark:bg-neutral-700 dark:text-white dark:focus:border-neutral-300"
              >
                {boot_images_res.isSuccess &&
                  boot_images_res.data.map((image, index) => (
                    <option key={index} value={image.name}>
                      {image.name}
                    </option>
                  ))}
              </select>
            </td>
          </tr>
          <tr>
            <td>Firmware:</td>
            <td>
              <select
                {...register("firmware")}
                className="rounded-lg border p-1 text-gray-900 dark:border-white dark:bg-neutral-700 dark:text-white dark:focus:border-neutral-300"
              >
                {firmware_res.isSuccess &&
                  firmware_res.data.map((firmware, index) => (
                    <option key={index} value={firmware}>
                      {firmware}
                    </option>
                  ))}
              </select>
            </td>
          </tr>
          <tr>
            <td>Interfaces:</td>
            <td>
              <PlusIcon
                className="h-6 w-6 rounded-lg hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-700"
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
                  <div
                    className="my-2 grid gap-3 rounded-lg border p-2 dark:border-white sm:grid-cols-1 md:grid-cols-2"
                    key={field.id}
                  >
                    <div className="col-span-2 flex justify-between px-2">
                      <div className="flex gap-2">
                        <label>BMC:</label>
                        <input
                          type="checkbox"
                          {...register(`interfaces.${index}.bmc`)}
                        />
                      </div>
                      <div className="flex">
                        {watch(`interfaces.${index}.bmc`) && (
                          <a
                            href={`https://${watch(
                              `interfaces.${index}.fqdn`
                            )}`}
                            target="_blank"
                          >
                            <ArrowTopRightOnSquareIcon className="h-5 w-5 m-1 rounded-lg hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-700" />
                          </a>
                        )}
                        <XMarkIcon
                          onClick={() => remove(index)}
                          className="h-6 w-6 rounded-lg m-1 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-700"
                        />
                      </div>
                    </div>
                    {input_arr.map((input, input_index) => (
                      <div className="flex gap-2" key={input_index}>
                        {/* <label>{input.label}</label> */}
                        <input
                          className="w-full rounded-md border border-black px-1 text-black"
                          placeholder={input.label}
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
