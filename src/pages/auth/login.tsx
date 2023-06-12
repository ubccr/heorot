import Link from "next/link";
import type { NextPage } from "next";
import ProgressSpinner from "~/components/progressSpinner";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useUserContext } from "~/provider";

type FormData = {
  username: string;
  password: string;
};

const Login: NextPage = () => {
  const router = useRouter();
  const { setUser } = useUserContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>();

  const login_req = api.auth.login.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);
      setUser({
        username: data.username,
        role: data.role,
        theme: data.theme,
        message: data.message,
      });
      await router.push("/");
    },
    onError: (error) => {
      setError("password", { message: error.message });
    },
  });

  const onSubmit = handleSubmit((data) => {
    login_req.mutate(data);
  });

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-8 py-12">
      <h2 className="text-center text-2xl font-bold">Login to Heorot</h2>

      <div className="mt-10">
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises*/}
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="mt-2">
            <label htmlFor="username" className="block">
              Username
            </label>
            {!!errors.username && (
              <p role="alert" className="text-sm text-red-500">
                {errors.username?.message}
              </p>
            )}
            <input
              id="username"
              autoComplete="username"
              type="text"
              className="block w-full rounded-md border border-gray-500 px-1 py-1.5 text-gray-900 placeholder:text-gray-400"
              {...register("username", {
                required: "Please enter a Username.",
              })}
            />
          </div>
          <div className="mt-2">
            <label htmlFor="password" className="block">
              Password
            </label>
            {!!errors.password && (
              <p role="alert" className="text-sm text-red-500">
                {errors.password?.message}
              </p>
            )}
            <input
              id="password"
              autoComplete="current-password"
              type="password"
              className="block w-full rounded-md border border-gray-500 px-1 py-1.5 text-gray-900 placeholder:text-gray-400"
              {...register("password", {
                required: "Please enter a Password.",
              })}
            />
          </div>

          <div className="flex justify-center pt-3">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-white shadow-lg hover:bg-blue-500"
            >
              {login_req.isLoading ? (
                <ProgressSpinner classes="fill-white w-5 h-5" />
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-300">
          Need an Account?{" "}
          <Link
            href="/auth/register"
            className="text-blue-500 hover:text-blue-400"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
