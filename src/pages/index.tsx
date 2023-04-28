import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useUserContext } from "~/provider";

const Home: NextPage = () => {
  const { user } = useUserContext();
  return (
    <>
      <Head>
        <title>Heorot</title>
        <meta
          name="description"
          content="Heorot - A custom DCIM solution created by UBCCR"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="mb-3 text-7xl text-white">Heorot</h1>
      <h2 className="text-sm text-white ">
        {!!user && user.message}
        {!user && (
          <span>
            New users can register{" "}
            <Link
              as="p"
              href="/auth/login"
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
