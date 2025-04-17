import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import MovieList from "@/components/MovieList";
import useMovies from "@/hooks/useMovies";
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

export default function Latest() {
  const { data: moviesData = {} } = useMovies();
  const movies = moviesData as CategoryResponse;

  return (
    <>
      <Navbar />
      <div className="pt-20">
        {Object.entries(movies).map(([category, items]) => (
          <MovieList key={category} title={category} data={items} />
        ))}
      </div>
    </>
  );
}
