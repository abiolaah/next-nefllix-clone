import Billboard from "@/components/Billboard";
import InfoModal from "@/components/InfoModal";
import MovieList from "@/components/MovieList";
import Navbar from "@/components/Navbar";
import useInfoModal from "@/hooks/useInfoModal";
import useMovies from "@/hooks/useMovies";
import useTvShows from "@/hooks/useTvShows";
import { MediaItem } from "@/lib/types/api";

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

const Browse = () => {
  const { data: movies, isLoading: moviesLoading } = useMovies();
  const { data: tvShows, isLoading: tvShowsLoading } = useTvShows();
  const { isOpen, closeModal } = useInfoModal();

  if (moviesLoading || tvShowsLoading) {
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

  // Combine local and TMDB data
  const allMovies: MediaItem[] = [
    ...(movies?.local || []),
    ...(movies?.tmdb || []),
  ];

  const allTvShows: MediaItem[] = [
    ...(tvShows?.local || []),
    ...(tvShows?.tmdb || []),
  ];

  const allMedia: MediaItem[] = [...allMovies, ...allTvShows];

  return (
    <>
      <InfoModal visible={isOpen} onClose={closeModal} />
      <Navbar />
      <Billboard />
      <div className="pb-40">
        <MovieList
          title="Movies Only on This Platform"
          data={movies?.local || []}
        />
        <MovieList title="Popular Movies" data={movies?.tmdb || []} />
        <MovieList
          title="TV Shows Only on This Platform"
          data={tvShows?.local || []}
        />
        <MovieList title="Popular TV Shows" data={tvShows?.tmdb || []} />
        <MovieList title="Top 10" data={allMedia} />
      </div>
    </>
  );
};

export default Browse;
