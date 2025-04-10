import Billboard from "@/components/Billboard";
import Navbar from "@/components/Navbar";

import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

// Using GetServerSideProps type and no mixing with getStaticProps/getStaticPaths
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default function Home() {
  return (
    <>
      <Navbar />
      <Billboard />
    </>
  );
}
