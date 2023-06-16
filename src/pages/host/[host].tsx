import { ArrowPathIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import Grendel from "~/components/host/grendel";
import Link from "next/link";
// import Backups from "~/components/node/backups";
import type { NextPage } from "next";
import PortManagement from "~/components/host/portManagement";
import Redfish from "~/components/host/redfish";
import { Tab } from "@headlessui/react";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const Node: NextPage = () => {
  const router = useRouter();
  const host = (router.query.host as string) ?? "";
  const rack = host.split("-")[1] ?? "";

  const grendel_res = api.grendel.host.find.useQuery(host);
  const host_res = api.frontend.host.get.useQuery(host);
  const redfish = api.redfish.get.useQuery(host);
  const refresh_redfish = api.redfish.refresh.useMutation({
    onSuccess: () => {
      void grendel_res.refetch();
      void host_res.refetch();
      void redfish.refetch();
      toast.success("Successfully refreshed node data.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const tab_classes =
    "border-b border-white px-2 py-1 selection:bg-neutral-200 hover:bg-neutral-200 dark:selection:bg-neutral-600 dark:hover:bg-neutral-600";

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Link href={`/rack/${rack}`}>
          <ArrowUturnLeftIcon className="h-5 w-5 hover:text-neutral-500 dark:hover:text-neutral-200" />
        </Link>
        <h1 className="text-xl">{host}</h1>
        <ArrowPathIcon
          className={`h-5 w-5 hover:text-neutral-500 dark:hover:text-neutral-200 ${
            refresh_redfish.isLoading ? "animate-spin" : ""
          }`}
          /* eslint-disable-next-line @typescript-eslint/no-misused-promises*/
          onClick={() => {
            void refresh_redfish.mutate(host);
          }}
        />
      </div>
      <br />
      <Tab.Group>
        <Tab.List className="flex justify-center gap-3 ">
          <Tab
            className={({ selected }) =>
              `${tab_classes} ${selected ? "bg-neutral-100 shadow dark:bg-neutral-600" : ""}`
            }
          >
            Grendel
          </Tab>
          <Tab
            className={({ selected }) =>
              `${tab_classes} ${selected ? "bg-neutral-100 shadow dark:bg-neutral-600" : ""} ${
                host_res.isSuccess && host_res.data?.host_type === "node" ? "" : "hidden"
              }`
            }
          >
            Redfish
          </Tab>
          <Tab
            className={({ selected }) =>
              `${tab_classes} ${selected ? "bg-neutral-100 shadow dark:bg-neutral-600" : ""} ${
                host_res.isSuccess && host_res.data?.host_type === "switch" ? "" : "hidden"
              }`
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
            <Grendel host={host} />
          </Tab.Panel>
          <Tab.Panel>
            <Redfish host={host} />
          </Tab.Panel>
          <Tab.Panel>
            <PortManagement host={host} />
          </Tab.Panel>
          {/* <Tab.Panel>{!!host && <Backups host={host} />}</Tab.Panel> */}
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

export default Node;
