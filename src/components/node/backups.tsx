// import React, { useState } from "react";

// import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";
// import Modal from "../modal";
// import { api } from "~/utils/api";
// import { toast } from "react-toastify";
// import { useForm } from "react-hook-form";

// const Backups = ({ node }: { node: string }) => {
//   const [open, setOpen] = useState(false);

//   const backups = api.switches.backups.useQuery(node);
//   const create_backup = api.switches.interface.backup.useMutation({
//     onSuccess: async (data) => {
//       toast.success("Successfully created backup");
//     },
//   });
//   const restore_backup = api.switches.interface.restore.useMutation({
//     onSuccess: async (data) => {
//       toast.success("Successfully restored backup");
//     },
//   });
//   type FormData = {
//     node: string;
//     description: string;
//   };

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm<FormData>();
//   console.log(backups.data);

//   const onSubmit = async (data: FormData) => {
//     await create_backup.mutateAsync({
//       node: node,
//       description: data.description,
//     });
//     backups.refetch();
//   };
//   const restore = (backup_id: string) => {
//     restore_backup.mutate({
//       node,
//       id: backup_id,
//     });
//   };
//   return (
//     <div>
//       <h1>Create Backup:</h1>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="flex justify-center gap-3"
//       >
//         <input
//           className="rounded-md p-2 text-black"
//           placeholder="Description"
//           {...register("description")}
//         />

//         <button type="submit" className="border p-2 dark:border-white">
//           Create Backup
//         </button>
//       </form>

//       <br />

//       <h2>Previous Backups:</h2>
//       {backups.isSuccess && (
//         <table className="w-full table-auto">
//           <thead>
//             <tr>
//               <th>Description</th>
//               <th>Created At</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {backups.data.map((backup) => (
//               <tr key={backup.id}>
//                 <td>{backup.description}</td>
//                 <td>{backup.created_at.toLocaleString()}</td>
//                 <td>
//                   <button type="button" onClick={() => setOpen(true)}>
//                     <MagnifyingGlassCircleIcon className="h-5 w-5" />
//                   </button>
//                   <Modal
//                     open={open}
//                     setOpen={setOpen}
//                     title={`Backup: ${backup.id}`}
//                     actions={
//                       <button
//                         type="button"
//                         className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
//                         onClick={() => restore(backup.id)}
//                       >
//                         Restore
//                       </button>
//                     }
//                   >
//                     <pre>{backup.config}</pre>
//                   </Modal>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Backups;
