import { NextPageContext } from "next";
import { getSession } from "next-auth/react";

import Billboard from "@/components/Billboard";
import InfoModal from "@/components/InfoModal";
import MovieList from "@/components/MovieList";
import Navbar from "@/components/Navbar";
import TopMovieList from "@/components/TopMovieList";

import useInfoModal from "@/hooks/useInfoModal";
import useMovies from "@/hooks/useMovies";

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

export default function Movies() {
  const { data: movies, isLoading: moviesLoading } = useMovies({
    type: "trending",
  });
  const { data: popularMovies, isLoading: popularMoviesLoading } = useMovies({
    type: "popular",
  });
  const { data: topRatedMovies, isLoading: topRatedMoviesLoading } = useMovies({
    type: "top_rated",
  });
  const { data: nowPlayingMovies, isLoading: nowPlayingMoviesLoading } =
    useMovies({ type: "now_playing" });
  const { data: trendingMovies, isLoading: trendingMoviesLoading } = useMovies({
    type: "trending",
    page: 2,
  });
  const { data: upcomingMovies, isLoading: upcomingMoviesLoading } = useMovies({
    type: "upcoming",
  });

  const { isOpen, closeModal } = useInfoModal();

  if (
    moviesLoading ||
    popularMoviesLoading ||
    topRatedMoviesLoading ||
    trendingMoviesLoading ||
    nowPlayingMoviesLoading ||
    upcomingMoviesLoading
  ) {
    return (
      <>
        <Navbar />
        <Billboard />
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
      <Billboard />
      <div className="pb-20">
        {/* Movies Available on this platform */}
        <MovieList
          title="Movies Only on This Platform"
          data={movies?.local || []}
        />
        {/* Popular Movies */}
        <MovieList title="Popular Movies" data={popularMovies?.tmdb || []} />

        {/* Trending Movies */}
        <MovieList title="Trending Movies" data={trendingMovies?.tmdb || []} />

        {/* Top Rated Movies */}
        <MovieList title="Top Rated Movies" data={topRatedMovies?.tmdb || []} />

        {/* Movies Now Playing */}
        <MovieList
          title="Now Playing Movies"
          data={nowPlayingMovies?.tmdb || []}
        />

        {/* Upcoming Movies */}
        <MovieList title="Upcoming Movies" data={upcomingMovies?.tmdb || []} />

        {/* Top 10 Movies */}
        <TopMovieList
          title="Top 10 Movies"
          data={(movies?.tmdb || []).slice(0, 10)}
        />
      </div>
    </>
  );
}
