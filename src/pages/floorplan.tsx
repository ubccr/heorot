import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import { toast } from "react-toastify";

const Floorplan: NextPage = () => {
  const floorplan_res = api.frontend.floorplan.list.useQuery();
  const floorplan_refresh = api.frontend.floorplan.refresh.useMutation({
    onSuccess: async () => {
      await floorplan_res.refetch();
      toast.success("Successfully refreshed floorplan");
    },
  });
  floorplan_res.isError && toast.error(floorplan_res.error.message);
  
  return (
    <div>
      <h1 className="text-2xl dark:text-white">Floorplan</h1>
      <br />
      <table className="table-fixed">
        <thead>
          <tr>
            {/* refresh button */}
            <th className="border border-gray-400 px-4 py-2">
              <ArrowPathIcon
                className={`h-5 w-5 ${
                  floorplan_refresh.isLoading ? "animate-spin" : ""
                }`}
                onClick={() => floorplan_refresh.mutate()}
              />
            </th>
            {/* map column numbers to header */}
            {floorplan_res.isSuccess &&
              !!floorplan_res.data &&
              floorplan_res.data[0]?.map((y, index) => (
                <th key={index} className="border border-gray-400 px-4 py-2">
                  {y.rack.replace(/[a-zA-Z]/g, "")}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {/* map floorplan res */}
          {floorplan_res.isSuccess &&
            floorplan_res.data?.map((x, index_x) => (
              <tr key={index_x}>
                {/* set first td to row name */}
                <td className="border border-gray-400 px-4 py-2">
                  {x[0]?.rack[0]}
                </td>
                {x.map((y, index_y) => (
                  <td
                    key={index_y}
                    width={55}
                    height={35}
                    className="border border-gray-400 px-4 py-2"
                  >
                    {y.populated && (
                      <Link
                        href={`/rack/${y.rack}`}
                        className="rounded-md border px-2 py-1 border-neutral-300 hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-700"
                      >
                        {y.rack}
                      </Link>
                    )}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Floorplan;
