import React from "react";
import Navbar from "@/components/Navbar";
import MovieList from "@/components/MovieList";
import useFavourites from "@/hooks/useFavourites";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import useProfile from "@/hooks/useProfile";
import useWatching from "@/hooks/useWatching";
import WatchingMovieList from "@/components/WatchingMovieList";
import useReactions from "@/hooks/useReactions";
import useInfoModal from "@/hooks/useInfoModal";
import InfoModal from "@/components/InfoModal";

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

const MyList = () => {
  const { currentProfileId } = useProfile();
  const { data: favourites = [], isLoading: favouriteLoading } = useFavourites(
    currentProfileId || undefined
  );
  const { data: watchedData = [], isLoading: watchedLoading } = useWatching({
    profileId: currentProfileId || undefined,
    completed: true,
  });
  const { data: watchingData = [], isLoading: watchLoading } = useWatching({
    profileId: currentProfileId || undefined,
    completed: false,
  });

  const { data: likedData = [], isLoading: likedLoading } = useReactions(
    currentProfileId || undefined,
    "liked"
  );
  const { data: lovedData = [], isLoading: lovedLoading } = useReactions(
    currentProfileId || undefined,
    "loved"
  );

  // Check if all data arrays are empty
  const hasNoData = [
    favourites,
    watchedData,
    watchingData,
    likedData,
    lovedData,
  ].every((array) => array.length === 0);

  const favouriteTvShow =
    favourites.filter((favourite) => favourite.isTvShow === true) || [];
  const favouriteMovies =
    favourites.filter((favourite) => favourite.isTvShow === false) || [];

  const watchedTvShow =
    watchedData.filter((watched) => watched.isTvShow === true) || [];
  const watchedMovies =
    watchedData.filter((watched) => watched.isTvShow === false) || [];

  const watchingTvShow =
    watchingData.filter((watching) => watching.isTvShow === true) || [];
  const watchingMovies =
    watchingData.filter((watching) => watching.isTvShow === false) || [];

  const likedTvShow =
    likedData.filter((liked) => liked.isTvShow === true) || [];
  const likedMovies =
    likedData.filter((liked) => liked.isTvShow === false) || [];

  const lovedTvShow =
    lovedData.filter((loved) => loved.isTvShow === true) || [];
  const lovedMovies =
    lovedData.filter((loved) => loved.isTvShow === false) || [];

  const { isOpen, closeModal } = useInfoModal();

  const isDataLoading =
    favouriteLoading ||
    watchedLoading ||
    watchLoading ||
    likedLoading ||
    lovedLoading;

  if (isDataLoading || currentProfileId === null) {
    return (
      <div>
        <Navbar />
        <div className="pt-20 px-4 md:px-16 pb-40">
          <p className="text-white text-lg">Loading your list...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="pt-20 px-4 md:px-16 pb-40">
        <h1 className="text-white text-3xl font-bold mt-8 mb-6">My List</h1>
        {hasNoData ? (
          <div>
            <p className="text-white text-lg font-bold">
              No movies in your list
            </p>
          </div>
        ) : (
          <>
            <InfoModal visible={isOpen} onClose={closeModal} />

            {/* All Favourites List */}
            <MovieList title="WishList" data={favourites || []} />

            {/* Favourites Movies List */}
            <MovieList title="Movie WishList" data={favouriteMovies || []} />

            {/* Favourites TvShow List */}
            <MovieList title="TvShow WishList" data={favouriteTvShow || []} />

            {/* All Continue Watching  */}
            <WatchingMovieList
              title="Continue Watching"
              data={watchingData || []}
            />

            {/* All Watched Medias */}
            <MovieList title="Watched" data={watchedData || []} />

            {/* Watched Movies */}
            <MovieList title="Watched Movies" data={watchedMovies || []} />

            {/* Watched TvShows */}
            <MovieList title="Watched TvShows" data={watchedTvShow || []} />

            {/* Watching Movies */}
            <MovieList title="Watching Movies" data={watchingMovies || []} />

            {/* Watching TvShows */}
            <MovieList title="Watching TvShows" data={watchingTvShow || []} />

            {/* Liked Media */}
            <MovieList title="Liked List" data={likedData || []} />

            {/* Liked Movies */}
            <MovieList title="Liked Movies" data={likedMovies || []} />

            {/* Liked TvShows */}
            <MovieList title="Liked TvShow" data={likedTvShow || []} />

            {/* Loved Media */}
            <MovieList title="Loved List" data={lovedData || []} />

            {/* Loved Movies */}
            <MovieList title="Loved Movies" data={lovedMovies || []} />

            {/* Loved TvShows */}
            <MovieList title="Loved TvShow" data={lovedTvShow || []} />
          </>
        )}
      </div>
    </div>
  );
};

export default MyList;
