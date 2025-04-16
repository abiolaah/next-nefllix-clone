import React from "react";
import Navbar from "@/components/Navbar";
import MovieList from "@/components/MovieList";

import useMovieList from "@/hooks/useMovieList";

const Latest = () => {
  const { data: movies = [] } = useMovieList();
  return (
    <div>
      <Navbar />
      <div className="pt-20 px-4 md:px-16 pb-40">
        <h1 className="text-white text-3xl font-bold mt-8 mb-6">
          New & Popular
        </h1>
        <MovieList title="Trending Now" data={movies} />
        <MovieList title="Young Adult Shows" data={movies} />
        <MovieList title="Today's Top Picks for You" data={movies} />
        <MovieList title="Popular TV shows" data={movies} />
        <MovieList title="My List" data={movies} />
        <MovieList title="Top 10 TV Shows" data={movies} />
        <MovieList title="Familiar TV Favourites" data={movies} />
      </div>
    </div>
  );
};

export default Latest;
