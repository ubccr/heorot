import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import { toast } from "react-toastify";

const Floorplan: NextPage = () => {
  const floorplan_x = [..."defghijklmnopqrstuv"];
  const floorplan_y = [
    "28",
    "27",
    "26",
    "25",
    "24",
    "23",
    "22",
    "21",
    "17",
    "16",
    "15",
    "14",
    "13",
    "12",
    "11",
    "10",
    "09",
    "08",
    "07",
    "06",
    "05",
  ];
  const floorplan_res = api.frontend.floorplan.list.useQuery();
  const floorplan_refresh = api.frontend.floorplan.refresh.useMutation({
    onSuccess: async () => {
      await floorplan_res.refetch();
      toast.success("Successfully refreshed floorplan");
    },
  });

  return (
    <div>
      <h1 className="text-2xl text-white">Floorplan</h1>
      <br />
      <table className="table-fixed">
        <thead>
          <tr>
            <th className="border border-gray-400 px-4 py-2">
              <ArrowPathIcon
                className={`h-5 w-5 ${
                  floorplan_refresh.isLoading ? "animate-spin" : ""
                }`}
                onClick={() => floorplan_refresh.mutate()}
              />
            </th>
            {floorplan_y.map((y, index) => (
              <th key={index} className="border border-gray-400 px-4 py-2">
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {floorplan_res.isSuccess &&
            floorplan_res.data?.map((x, index_x) => (
              <tr key={index_x}>
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
                        className="rounded-md border px-2 py-1 dark:border-white hover:dark:bg-neutral-700"
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
