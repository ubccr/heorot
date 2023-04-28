import Grendel from "~/components/node/grendel";
// import Backups from "~/components/node/backups";
import type { NextPage } from "next";
import PortManagement from "~/components/node/portManagement";
import { Tab } from "@headlessui/react";
import { useRouter } from "next/router";

const Node: NextPage = () => {
  const router = useRouter();
  const node = router.query.node as string;

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
            <Grendel node={node} />
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
