import type { NextPage } from "next";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useState } from "react";

const Users: NextPage = () => {
    const [selected, setSelected] = useState<string[]>([])
    const [role, setRole] = useState<string>("disabled")
    const {data: auth} = useSession()

    const users = api.auth.users.list.useQuery()
    const edit_role = api.auth.users.edit.role.useMutation({
        onSuccess: (data) => { 
            toast.success(data)
            void users.refetch()
         },
        onError: (err) => { toast.error(err.message) }
    })

    
    const handleSelect = (username: string) => {
        if (selected.includes(username)) setSelected(selected.filter((x) => x !== username))
        else setSelected([...selected, username])
    }
    const handleSubmit = () => {
        edit_role.mutate({ role: role, users: selected})
    }

    const td_classes = " p-3 border border-neutral-300 dark:border-neutral-500"
    
  return (
    <>
      <table>
        <thead>
            <tr>
                <td colSpan={5} className={td_classes}>Users</td>
            </tr>
            <tr>
                <td className={td_classes}></td>
                <td className={td_classes}>Username</td>
                <td className={td_classes}>Role</td>
                <td className={td_classes}>Updated At</td>
                <td className={td_classes}>Created At</td>
            </tr>
        </thead>
        <tbody>
            {users.data?.map((user, index) => (
                <tr key={index}>
                    <td className={td_classes}>
                        <input type="checkbox" disabled={auth?.user.username === user.username} onChange={() => handleSelect(user.username)} />
                    </td>
                    <td className={td_classes}>{user.username}</td>
                    <td className={td_classes}>{user.role}</td>
                    <td className={td_classes}>{new Date(user.updatedAt).toLocaleString()}</td>
                    <td className={td_classes}>{new Date(user.createdAt).toLocaleString()}</td>
                </tr>
            ))}
        </tbody>
      </table>
        <br />
        <div className="flex flex-row justify-center gap-3">
        <select onChange={(e) => setRole(e.target.value)} className="border rounded-md border-netural-300 dark:border-neutral-500 p-2">
            <option value="disabled">Disabled</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
        </select>
        <button type="button" className="border border-neutral-300 dark:border-neutral-500 rounded-md p-2" onClick={() => handleSubmit()}>
            Submit
        </button>
        </div>

    </>
  );
};

export default Users;
