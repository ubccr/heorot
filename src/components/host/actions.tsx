import { ArrowDownOnSquareStackIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

import Button from "../button";
import Image from "next/image";
import ProgressBar from "../progressbar";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useRef } from "react";

export const Actions = ({ host }: { host: string }) => {
  const screen_shot = api.redfish.get.screen_shot.useQuery(host);
  const refresh_screen_shot = api.redfish.refresh.screen_shot.useMutation({
    onSuccess: () => {
      toast.success("Screenshot refreshed");
      void screen_shot.refetch();
    },
    onError: (data) => {
      toast.error(data.message);
    },
  });
  const support_assist_collections = api.redfish.get.support_assist_collection.useQuery(host, { enabled: false });
  const refresh_support_assist_collection = api.redfish.refresh.support_assist_collection.useMutation({
    onSuccess: () => {
      toast.success("Support Assist Collection refreshed");
      void support_assist_collections.refetch();
    },
    onError: (data) => {
      toast.error(data.message);
    },
  });

  interface Collection {
    id: string;
    host: string;
    collection: string;
    name: string;
    created: Date;
  }
  const handleDownload = (collection: Collection) => {
    if (!collection) return;
    const content = new Blob([collection.collection], { type: "base64" });
    const encodedUri = window.URL.createObjectURL(content);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TSR_${collection.name}_${host}.zip`);
    link.click();
  };
  const collection_ref = useRef<HTMLInputElement | null>(null);
  const td_classes = "border border-gray-300 p-2";

  return (
    <>
      <div className="flex justify-center">
        <table>
          <thead>
            <tr>
              <td colSpan={3} className={td_classes}>
                <input type="text" className="rounded-lg border p-2" placeholder="Name" ref={collection_ref} />
                <Button
                  type="button"
                  addClasses="mb-2"
                  onClick={() =>
                    refresh_support_assist_collection.mutate({ host, name: collection_ref.current?.value ?? "" })
                  }
                >
                  Create Collection
                </Button>
                {refresh_support_assist_collection.isLoading && <ProgressBar />}
              </td>
            </tr>
            <tr>
              <td className={td_classes}>
                <button onClick={() => void support_assist_collections.refetch()}>
                  <ArrowPathIcon className={`h-5 w-5 ${support_assist_collections.isFetching ? "animate-spin" : ""}`} />
                </button>
              </td>
              <td className={td_classes}>Name</td>
              <td className={td_classes}>Created</td>
            </tr>
          </thead>
          <tbody>
            {!support_assist_collections.data && (
              <tr>
                <td colSpan={3} className={td_classes}>
                  Create a collection or refresh to populate table!
                </td>
              </tr>
            )}
            {!!support_assist_collections.data &&
              support_assist_collections.data.map((collection, index) => (
                <tr key={index}>
                  <td className={td_classes}>
                    <button onClick={() => handleDownload(collection)}>
                      <ArrowDownOnSquareStackIcon className="h-5 w-5" />
                    </button>
                  </td>
                  <td className={td_classes}>{collection.name}</td>
                  <td className={td_classes}>{collection.created.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <hr className="my-6 h-px border-0 bg-gray-200 dark:bg-gray-700" />
      <h1>Screenshot</h1>

      <button type="button" className="rounded-lg p-2" onClick={() => refresh_screen_shot.mutate(host)}>
        <ArrowPathIcon className={`h-5 w-5 ${refresh_screen_shot.isLoading ? "animate-spin" : ""}`} />
      </button>
      {!!screen_shot.data && (
        <>
          <h1>Screenshot</h1>
          <div className="flex items-center justify-center gap-2">
            <h1>Captured at {screen_shot.data.created.toLocaleString()}</h1>
          </div>
          <Image src={`data:image/png;base64,${screen_shot.data.image}`} alt="iDRAC screen" height={800} width={800} />
        </>
      )}
    </>
  );
};
