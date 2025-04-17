import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import MovieList from "@/components/MovieList";
import useTvShows from "@/hooks/useTvShows";
import { CategoryResponse } from "@/lib/types/api";

export async function getServerSideProps(context: NextPageContext) {
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
}

export default function TvShows() {
  const { data: tvShowsData = {} } = useTvShows();
  const tvShows = tvShowsData as CategoryResponse;

  return (
    <>
      <Navbar />
      <div className="pt-20">
        {Object.entries(tvShows).map(([category, items]) => (
          <MovieList key={category} title={category} data={items} />
        ))}
      </div>
    </>
  );
}
