import { NextPageContext } from "next";
import { getSession } from "next-auth/react";

import InfoModal from "@/components/InfoModal";
import MovieList from "@/components/MovieList";
import Navbar from "@/components/Navbar";

import useMovies from "@/hooks/useMovies";
import useInfoModal from "@/hooks/useInfoModal";

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
  const { data: upcomingMovies, isLoading: upcomingMoviesLoading } = useMovies({
    type: "upcoming",
  });
  const { data: nowPlayingMovies, isLoading: nowPlayingMoviesLoading } =
    useMovies({ type: "now_playing" });
  const { data: movies, isLoading: moviesLoading } = useMovies({
    type: "trending",
  });
  const { data: trendingMovies, isLoading: trendingMoviesLoading } = useMovies({
    type: "trending",
    page: 2,
  });
  const { isOpen, closeModal } = useInfoModal();

  if (
    moviesLoading ||
    trendingMoviesLoading ||
    nowPlayingMoviesLoading ||
    upcomingMoviesLoading
  ) {
    return (
      <>
        <Navbar />
        <div className="pb-40">
          <div className="text-white">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <InfoModal visible={isOpen} onClose={closeModal} />
      <Navbar />
      <div className="relative h-[6vw]" />
      <div className="pb-20">
        {/* Trending Movies */}
        <MovieList
          title="Trending Movies WorldWide"
          data={movies?.tmdb || []}
        />
        <MovieList title="Trending Movies" data={trendingMovies?.tmdb || []} />

        {/* Movies Now Playing */}
        <MovieList
          title="Now Playing Movies"
          data={nowPlayingMovies?.tmdb || []}
        />

        {/* Upcoming Movies */}
        <MovieList title="Upcoming Movies" data={upcomingMovies?.tmdb || []} />
      </div>
    </>
  );
}
