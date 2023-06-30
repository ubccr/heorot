import { ArrowPathIcon, ArrowUturnLeftIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";

import Link from "next/link";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const Rack: NextPage = () => {
  const router = useRouter();
  const rack = router.query.rack as string;

  const rack_res = api.frontend.rack.list.useQuery(rack);
  const rack_refresh = api.frontend.rack.refresh.useMutation({
    onSuccess: async () => {
      await rack_res.refetch();
      toast.success("Successfully refreshed rack");
    },
    onError: (error) => toast.error(error.message),
  });

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const fix_bad_request = api.redfish.actions.set.bad_request.useMutation({
    onSuccess: () => {
      toast.success("Successfully fixed bad request error");
    },
    onError: (error) => toast.error(error.message),
  });

  const update_selected = (host: string) => {
    if (host === "") return;
    const found = selectedNodes.find((updatePort) => updatePort === host);

    if (!found) setSelectedNodes([...selectedNodes, host]);
    else setSelectedNodes(selectedNodes.filter((hosts) => hosts !== host));
  };

  const reboot_idrac = api.redfish.actions.set.reboot_idrac.useMutation({
    onSuccess: (data) => toast.success(data),
    onError: (error) => toast.error(error.message),
  });

  const boot_option_ref = useRef<HTMLSelectElement>(null);
  const reboot_host_ref = useRef<HTMLSelectElement>(null);
  const reboot_host = api.redfish.actions.set.reboot_host.useMutation({
    onSuccess: (data) => toast.success(data?.message),
    onError: (error) => toast.error(error.message),
  });

  const button_classes =
    "px-3 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700";

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h1>Info:</h1>
          <h1>Nodes: {!!rack_res && rack_res.data?.rack.filter((x) => !!x.host).length}</h1>
          <h1>Switches: {!!rack_res && rack_res.data?.rack.filter((x) => x.host?.host_type === "switch").length}</h1>
          {!!reboot_host.data && (
            <>
              <div className="flex-col justify-center rounded-lg border border-neutral-300 p-2">
                <h1>Rebooted nodes:</h1>
                <table>
                  <thead>
                    <tr>
                      <th>Successful hosts:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reboot_host.data?.successful_hosts.map((host, index) => (
                      <tr key={index}>
                        <td>{host}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table>
                  <thead>
                    <tr>
                      <th>Failed hosts:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reboot_host.data?.failed_hosts.map((host, index) => (
                      <tr key={index}>
                        <td>{host.host}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div>
          {rack_res.isSuccess && (
            <>
              <div className="flex justify-center">
                <table className="table-fixed">
                  <thead>
                    <tr>
                      <th colSpan={2} className="border dark:border-white">
                        <div className="flex items-center justify-between gap-2 px-3 py-1">
                          <Link href={"/floorplan"}>
                            <ArrowUturnLeftIcon className="h-4 w-4 hover:text-neutral-700 dark:hover:text-neutral-300" />
                          </Link>
                          <div className="flex items-center gap-1">
                            <Link href={`/rack/${rack_res.data?.left_rack ?? "undefined"}`}>
                              <ChevronLeftIcon className="h-4 w-4 hover:text-neutral-700 dark:hover:text-neutral-300" />
                            </Link>
                            {rack}
                            <Link href={`/rack/${rack_res.data?.right_rack ?? "undefined"}`}>
                              <ChevronRightIcon className="h-4 w-4 hover:text-neutral-700 dark:hover:text-neutral-300" />
                            </Link>
                          </div>
                          <ArrowPathIcon
                            onClick={() => rack_refresh.mutate(rack)}
                            className={`h-4 w-4 hover:text-neutral-700 dark:hover:text-neutral-300 ${
                              rack_refresh.isLoading ? "animate-spin" : ""
                            }`}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rack_res.data?.rack.map((host, index) => (
                      <tr key={index}>
                        <td className="h-8 border dark:border-white">{host.u}</td>
                        <td
                          className={
                            "h-8 w-60 border dark:border-white" +
                            (selectedNodes.includes(host.host?.host ?? "") ? " border-2 border-blue-300" : "")
                          }
                          onClick={() => update_selected(host.host?.host ?? "")}
                        >
                          <Link
                            href={`/host/${host.host?.host ?? "undefined"}`}
                            className="dark:hover:text-neutral-200"
                          >
                            {host.host?.host}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                className={button_classes}
                onClick={() => {
                  const host_list = rack_res.data?.rack
                    .map((host) => {
                      if (!!host.host?.host) return host.host?.host;
                    })
                    .filter((host) => Boolean(host));
                  setSelectedNodes(host_list as string[]);
                }}
              >
                Select all
              </button>
              <button className={button_classes} onClick={() => setSelectedNodes([])}>
                Clear
              </button>
            </div>
            <div className="flex gap-2">
              <button className={button_classes} onClick={() => fix_bad_request.mutate(selectedNodes)}>
                Fix Bad Request
              </button>
              <button className={button_classes} onClick={() => reboot_idrac.mutate(selectedNodes)}>
                Reboot iDRAC(s)
              </button>
            </div>

            <div className="flex gap-2">
              <select
                className="rounded-md bg-neutral-100 px-3 py-1 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                ref={boot_option_ref}
              >
                <option value="None">None</option>
                <option value="Pxe">PXE</option>
                <option value="BiosSetup">BIOS Setup</option>
                <option value="Utilities">Utilities</option>
                <option value="Hdd">HDD</option>
                <option value="SDCard">SD Card</option>
                <option value="Cd">CD</option>
              </select>
              <select
                className="rounded-md bg-neutral-100 px-3 py-1 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                ref={reboot_host_ref}
              >
                <option value="PowerCycle">Power Cycle (Cold Boot)</option>
                <option value="ForceRestart">Reset (Warm Boot)</option>
                <option value="GracefulShutdown">Graceful Shutdown</option>
                <option value="On">Power On</option>
              </select>
              <button
                className={button_classes}
                onClick={() => {
                  reboot_host.mutate({
                    hosts: selectedNodes,
                    power_option: reboot_host_ref.current?.value,
                    boot_option: boot_option_ref.current?.value,
                  });
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Rack;
