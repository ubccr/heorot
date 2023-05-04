import { ArrowPathIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import Grendel from "~/components/node/grendel";
import Link from "next/link";
// import Backups from "~/components/node/backups";
import type { NextPage } from "next";
import PortManagement from "~/components/node/portManagement";
import { Tab } from "@headlessui/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

const Node: NextPage = () => {
  const router = useRouter();
  const host = router.query.host as string;
  const rack = host.split("-")[1] ?? "";

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  const host_res = api.grendel.host.find.useQuery(host);

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Link href={`/rack/${rack}`}>
          <ArrowUturnLeftIcon className="h-5 w-5 hover:text-neutral-200" />
        </Link>
        <h1 className="text-xl">{host}</h1>
        <ArrowPathIcon
          className={`h-5 w-5 hover:text-neutral-200 ${
            host_res.isLoading ? "animate-spin" : ""
          }`}
          onClick={() => void host_res.refetch()}
        />
      </div>
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
            <Grendel host={host} />
          </Tab.Panel>
          <Tab.Panel></Tab.Panel>
          <Tab.Panel>{!!host && <PortManagement host={host} />}</Tab.Panel>
          {/* <Tab.Panel>{!!host && <Backups host={host} />}</Tab.Panel> */}
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

export default Node;
