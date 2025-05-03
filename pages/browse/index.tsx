import { useEffect, useState } from "react";

import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

import Billboard from "@/components/Billboard";
import InfoModal from "@/components/InfoModal";
import LoadingScreen from "@/components/LoadingScreen";
import MovieList from "@/components/MovieList";
import Navbar from "@/components/Navbar";
import TopMovieList from "@/components/TopMovieList";

import useFavourites from "@/hooks/useFavourites";
import useInfoModal from "@/hooks/useInfoModal";
import useMovies from "@/hooks/useMovies";
import useProfile from "@/hooks/useProfile";
import useTvShows from "@/hooks/useTvShows";

import useWatching from "@/hooks/useWatching";
import WatchingMovieList from "@/components/WatchingMovieList";

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
  const router = useRouter();

  const { currentProfileId, currentProfile } = useProfile();

  const [isProfileSwitching, setIsProfileSwitching] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const handleProfileSwitch = () => {
      if (router.query.profileSwitch === "true") {
        setIsProfileSwitching(true);

        // Remove the query parameter without triggering a navigation
        const { pathname } = router;
        router
          .replace(pathname, undefined, { shallow: true })
          .then(() => {
            // Simulate loading time for the profile switch
            setTimeout(() => {
              setIsProfileSwitching(false);
            }, 2000);
          })
          .catch((err) => {
            console.error("Error during navigation:", err);
            setIsProfileSwitching(false);
          });
      }
    };

    handleProfileSwitch();
  }, [router, router.query.profileSwitch]);

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
  // const {data: watchingData, isLoading: watchLoading} = useWatching({profileId:currentProfileId || undefined, completed:true})
  const { data: watchingData, isLoading: watchLoading } = useWatching({
    profileId: currentProfileId || undefined,
    completed: false,
  });

  const { isOpen, closeModal } = useInfoModal();

  const isDataLoading =
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
    favouritesLoading ||
    watchLoading;

  useEffect(() => {
    if (!isDataLoading) {
      setDataLoaded(true);
    }
  }, [isDataLoading]);

  // Show the Netflix-style loading screen when switching profiles
  if (isProfileSwitching && currentProfile) {
    return (
      <LoadingScreen
        profileAvatar={currentProfile.avatar}
        profileName={currentProfile.name}
      />
    );
  }

  if (isDataLoading) {
    return (
      <>
        <Navbar />
        <div className="fixed inset-0 bg-black z-40 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-red-600 rounded-full animate-spin"></div>
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
        <WatchingMovieList title="Continue Watching" data={watchingData} />

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
