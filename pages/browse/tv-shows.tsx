import React from "react";

import Billboard from "@/components/Billboard";
import InfoModal from "@/components/InfoModal";
import MovieList from "@/components/MovieList";
import Navbar from "@/components/Navbar";

import useFavourites from "@/hooks/useFavourites";
import useInfoModal from "@/hooks/useInfoModal";
import useMovieList from "@/hooks/useMovieList";

const TvShow = () => {
  const { data: movies = [] } = useMovieList();
  const { data: favourites = [] } = useFavourites();
  const { isOpen, closeModal } = useInfoModal();
  return (
    <>
      <InfoModal visible={isOpen} onClose={closeModal} />
      <Navbar />
      <Billboard />
      <div className="pb-40">
        <MovieList title="Trending Now" data={movies} />
        <MovieList title="Young Adult Shows" data={movies} />
        <MovieList title="Today's Top Picks for You" data={movies} />
        <MovieList title="Popular TV shows" data={movies} />
        <MovieList title="My List" data={favourites} />
        <MovieList title="Top 10 TV Shows" data={movies} />
        <MovieList title="Familiar TV Favourites" data={movies} />
      </div>
    </>
  );
};

export default TvShow;
