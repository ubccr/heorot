import Link from "next/link";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

type FormData = {
  username: string;
  password: string;
};

const Login: NextPage = () => {
  const router = useRouter();
  const { data: auth } = useSession()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>();

  useEffect(() => {
    if (auth?.user.role === "disabled") {
      toast.info("Account is disabled. This is normal if you are a new user. Please ask an administrator to enable your account.", 
      { delay: 300, autoClose: false })
    }
  }, [auth])
  

  const onSubmit = handleSubmit( async data => {
    const signin_res = await signIn("credentials", {
      redirect: false,
      username: data.username,
      password: data.password,
    })
    if (!signin_res) return

    if (signin_res.ok) {
       toast.success("Successfully logged in")       
       const url = new URL(signin_res.url as string)        
       void router.push(url.searchParams.get("callbackUrl") ?? "/")
    } else {
      if (signin_res.error === "CredentialsSignin") toast.error("Invalid credentials or account does not exist.")
      if (signin_res.error === "Default") toast.error("Unknown error occured") && console.error(signin_res)
    }
  });

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-8 py-12">
      <h2 className="text-center text-2xl font-bold">Login to Heorot</h2>

      <div className="mt-10">
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
              login
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
