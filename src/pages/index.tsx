import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
// import { useUserContext } from "~/provider";

const Home: NextPage = () => {
  // const { user } = useUserContext();
  const { data, status } = useSession()
  console.log(status, data);
  
  return (
    <>
      <Head>
        <title>Heorot</title>
        <meta
          name="description"
          content="Heorot - A custom DCIM solutiow created by UBCCR"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="mb-3 text-7xl dark:text-white">Heorot</h1>
      <h2 className="text-sm dark:text-white ">
        {!!data && (
          <p>
            Welcome <span className="font-medium">{data.user.username}</span>! Successfully logged in.
          </p>
        )}
        {!data && (
          <span>
            New users can register{" "}
            <Link
              href="/auth/register"
              className="text-blue-500 hover:text-blue-400"
            >
              here
            </Link>
            .
          </span>
        )}
      </h2>
    </>
  );
};

export default Home;
