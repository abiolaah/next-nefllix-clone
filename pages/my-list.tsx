import React from "react";
import Navbar from "@/components/Navbar";
import MovieList from "@/components/MovieList";

import useFavourites from "@/hooks/useFavourites";

const MyList = () => {
  const { data: favourites = [] } = useFavourites();
  return (
    <div>
      <Navbar />
      <div className="pt-20 px-4 md:px-16 pb-40">
        <h1 className="text-white text-3xl font-bold mt-8 mb-6">My List</h1>
        {favourites.length === 0 ? (
          <div>
            <p className="text-white text-lg font-bold">
              No movies in your list
            </p>
          </div>
        ) : (
          <MovieList title="" data={favourites} />
        )}
      </div>
    </div>
  );
};

export default MyList;
