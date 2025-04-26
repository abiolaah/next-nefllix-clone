import Billboard from "@/components/Billboard";
import InfoModal from "@/components/InfoModal";
import MovieList from "@/components/MovieList";
import Navbar from "@/components/Navbar";
import useInfoModal from "@/hooks/useInfoModal";
import useMovies from "@/hooks/useMovies";
import useTvShows from "@/hooks/useTvShows";
import useFavourites from "@/hooks/useFavourites";

import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { MediaItem } from "@/lib/types/api";
import TopMovieList from "@/components/TopMovieList";

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

const Browse = () => {
  const currentProfileId =
    typeof window !== "undefined"
      ? localStorage.getItem("currentProfile")
      : null;

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
  const { data: tvShows, isLoading: tvShowsLoading } = useTvShows({
    type: "trending",
  });
  const { data: popularTvShows, isLoading: popularTvShowsLoading } = useTvShows(
    { type: "popular", page: 2 }
  );
  const { data: onAirTvShows, isLoading: onAirTvShowsLoading } = useTvShows({
    type: "on_air",
  });
  const { data: topRatedTvShows, isLoading: topRatedTvShowsLoading } =
    useTvShows({ type: "top_rated" });
  const { data: tredningTvShows, isLoading: tredningTvShowsLoading } =
    useTvShows({ type: "trending", page: 2 });

  const { data: favourites, isLoading: favouritesLoading } = useFavourites(
    currentProfileId || undefined
  );
  const watching: MediaItem[] = [];

  // Debugging
  console.log("Current Profile ID:", currentProfileId);
  console.log("Favourites Data:", favourites);

  const { isOpen, closeModal } = useInfoModal();

  if (
    moviesLoading ||
    popularMoviesLoading ||
    topRatedMoviesLoading ||
    trendingMoviesLoading ||
    nowPlayingMoviesLoading ||
    upcomingMoviesLoading ||
    tvShowsLoading ||
    onAirTvShowsLoading ||
    topRatedTvShowsLoading ||
    tredningTvShowsLoading ||
    popularTvShowsLoading ||
    favouritesLoading
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
      <div className="pb-40">
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

        {/* Favourite */}
        <MovieList title="My List" data={favourites || []} />

        {/* Continue Watching */}
        <MovieList title="Continue Watching" data={watching} />

        {/* TV Shows Only on This Platform */}
        <MovieList
          title="TV Shows Only on This Platform"
          data={tvShows?.local || []}
        />

        <MovieList title="Popular TV Shows" data={popularTvShows?.tmdb || []} />
        <MovieList
          title="Top Rated TV Shows"
          data={topRatedTvShows?.tmdb || []}
        />
        <MovieList
          title="Trending TV Shows"
          data={tredningTvShows?.tmdb || []}
        />
        <MovieList title="On Air TV Shows" data={onAirTvShows?.tmdb || []} />

        <TopMovieList
          title="Top 10 Movies"
          data={(movies?.tmdb || []).slice(0, 10)}
        />
        <TopMovieList
          title="Top 10 TV Shows"
          data={(tvShows?.tmdb || []).slice(0, 10)}
        />
      </div>
    </>
  );
};

export default Browse;
