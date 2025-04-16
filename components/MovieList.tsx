import React from "react";
import { isEmpty } from "lodash";
import MovieCard from "./MovieCard";

interface MovieData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string[];
  rating: number | null;
  duration: string;
  releaseDate?: string;
  adult?: boolean;
  isTvShow?: boolean;
  numberOfSeasons?: number;
}

interface MovieListProps {
  data: MovieData[];
  title: string;
}

const MovieList: React.FC<MovieListProps> = ({ data, title }) => {
  if (isEmpty(data)) {
    return null;
  }

  return (
    <div className="px-4 md:px-12 mt-4 space-y-8">
      <div>
        <p className="text-white text-md md:text-xl lg:text-2xl font-semibold mb-4">
          {title}
        </p>
        <div className="relative">
          <div className="flex space-x-4 overflow-x-scroll scrollbar-hide pb-4">
            {data.map((movie) => (
              <div key={movie.id} className="flex-none">
                <MovieCard data={movie} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieList;
