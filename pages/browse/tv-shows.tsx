import { NextPageContext } from "next";
import { getSession } from "next-auth/react";

import Billboard from "@/components/Billboard";
import InfoModal from "@/components/InfoModal";
import MovieList from "@/components/MovieList";
import Navbar from "@/components/Navbar";
import TopMovieList from "@/components/TopMovieList";

import useInfoModal from "@/hooks/useInfoModal";
import useTvShows from "@/hooks/useTvShows";

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

  const { isOpen, closeModal } = useInfoModal();

  if (
    tvShowsLoading ||
    onAirTvShowsLoading ||
    topRatedTvShowsLoading ||
    tredningTvShowsLoading ||
    popularTvShowsLoading
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
          title="Top 10 TV Shows"
          data={(tvShows?.tmdb || []).slice(0, 10)}
        />
      </div>
    </>
  );
}
