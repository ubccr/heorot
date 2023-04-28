import type { NextPage } from "next";
import { useRouter } from "next/router";

const Node: NextPage = () => {
  const router = useRouter();
  const rack = router.query.rack as string;

  return (
    <>
      <h1>{rack}</h1>
    </>
  );
};

export default Node;
