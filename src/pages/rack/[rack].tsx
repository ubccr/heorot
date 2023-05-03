import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import Link from "next/link";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

const Rack: NextPage = () => {
  const router = useRouter();
  const rack = router.query.rack as string;

  const rack_res = api.frontend.rack.list.useQuery(rack);

  return (
    <>
      {rack_res.isSuccess && (
        <table className="table-fixed">
          <thead>
            <tr>
              <th colSpan={2} className="border dark:border-white">
                <div className="flex items-center justify-between gap-2 px-3 py-1">
                  <Link href={"/floorplan"}>
                    <ArrowUturnLeftIcon className="h-4 w-4 hover:text-neutral-300" />
                  </Link>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/rack/${rack_res.data?.left_rack ?? "undefined"}`}
                    >
                      <ChevronLeftIcon className="h-4 w-4 dark:hover:text-neutral-300" />
                    </Link>
                    {rack}
                    <Link
                      href={`/rack/${rack_res.data?.right_rack ?? "undefined"}`}
                    >
                      <ChevronRightIcon className="h-4 w-4 dark:hover:text-neutral-300" />
                    </Link>
                  </div>
                  <ArrowPathIcon className={`h-4 w-4 hover:text-neutral-300`} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rack_res.data?.rack.map((host, index) => (
              <tr key={index}>
                <td className="h-8 border dark:border-white">{host.u}</td>
                <td className="h-8 w-60 border dark:border-white">
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
      )}
    </>
  );
};

export default Rack;
