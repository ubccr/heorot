import { ArrowPathIcon, ArrowUturnLeftIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import Link from "next/link";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState } from "react";

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

  const button_classes =
    "px-3 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700";

  return (
    <>
      {rack_res.isSuccess && (
        <>
          <div className="flex-col">
            <div className="mb-2 flex gap-2">
              <button className={button_classes} onClick={() => fix_bad_request.mutate(selectedNodes)}>
                Fix Bad Request
              </button>
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
                        <Link href={`/host/${host.host?.host ?? "undefined"}`} className="dark:hover:text-neutral-200">
                          {host.host?.host}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Rack;
