import type { NextPage } from "next";
import { api } from "~/utils/api";
import { useUserContext } from "~/provider";

const Login: NextPage = () => {
  const logout_req = api.auth.logout.useMutation();
  const { setUser } = useUserContext();

  const onClick = () => {
    logout_req.mutate();
    setUser(null);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-300">
      <div className="flex gap-4">
        <button onClick={onClick}>Logout</button>
        {logout_req.error && (
          <p>Something went wrong! {logout_req.error.message}</p>
        )}
        {logout_req.isSuccess && <p>{logout_req.data.message}</p>}
      </div>
    </main>
  );
};

export default Login;
