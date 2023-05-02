import type { NextPage } from "next";
import { api } from "~/utils/api";

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
  const test = api.frontend.floorplan.useQuery();

  return (
    <div>
      <h1 className="text-2xl text-white">Floorplan</h1>
      <br />
      <table className="table-fixed">
        <thead>
          <tr>
            <th className="border border-gray-400 px-4 py-2"></th>
            {floorplan_y.map((y, index) => (
              <th key={index} className="border border-gray-400 px-4 py-2">
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {test.isSuccess &&
            test.data?.map((x, index_x) => (
              <tr key={index_x}>
                <td className="border border-gray-400 px-4 py-2"></td>
                {x.map((y, index_y) => (
                  <td
                    key={index_y}
                    width={55}
                    height={35}
                    className="border border-gray-400 px-4 py-2"
                  >
                    {y}
                  </td>
                ))}
              </tr>
            ))}
          {/* {floorplan_x.map((x, index_x) => (
            <tr key={index_x}>
              <td className="border border-gray-400 px-4 py-2">{x}</td>
              {floorplan_y.map((y, index_y) => (
                <td
                  key={index_y}
                  className="border border-gray-400 px-4 py-2"
                >{`${x}${y}`}</td>
              ))}
            </tr>
          ))} */}
        </tbody>
      </table>
    </div>
  );
};

export default Floorplan;
