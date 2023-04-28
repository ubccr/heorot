import Link from "next/link";
import type { NextPage } from "next";
import ProgressSpinner from "~/components/progressSpinner";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

type FormData = {
  username: string;
  password: string;
  verify_password: string;
};

const Register: NextPage = ({}) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<FormData>();
  const register_req = api.auth.register.useMutation({
    onSuccess: async (data) => {
      toast.success(data?.message);
      await router.push("/auth/login");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const onSubmit = handleSubmit((data) => {
    register_req.mutate(data);
  });

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-8 py-12">
      <h2 className="text-center text-2xl font-bold">Register for Heorot</h2>

      <div className="mt-10">
        {/*eslint-disable-next-line @typescript-eslint/no-misused-promises*/}
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
              className="block w-full rounded-md border-0 px-1 py-1.5 text-gray-900 placeholder:text-gray-400"
              {...register("username", {
                required: "Please enter a Username.",
              })}
            />
          </div>

          <div>
            <div className="mt-2">
              <label htmlFor="password" className="block">
                Password
              </label>
              {!!errors.password && (
                <p role="alert" className="text-sm text-red-500">
                  {errors.password?.message}
                </p>
              )}
            </div>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password", {
                required: "Please enter a Password.",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long.",
                },
              })}
              className="block w-full rounded-md border-0 px-1 py-1.5 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div>
            <div className="mt-2">
              <label htmlFor="verify_password" className="block">
                Re-enter Password
              </label>
              {!!errors.verify_password && (
                <p role="alert" className="text-sm text-red-500">
                  {errors.verify_password?.message}
                </p>
              )}
            </div>
            <input
              id="verify_password"
              type="password"
              autoComplete="new-password"
              {...register("verify_password", {
                required: "Please enter a Password.",
                validate: (val: string) => {
                  if (watch("password") !== val)
                    return "Passwords do not match.";
                },
              })}
              className="block w-full rounded-md border-0 px-1 py-1.5 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="flex justify-center pt-3">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-white shadow-lg hover:bg-blue-500"
            >
              {register_req.isLoading ? (
                <ProgressSpinner classes="fill-white w-5 h-5" />
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-gray-300">
          Already have an Account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-500 hover:text-indigo-400"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
