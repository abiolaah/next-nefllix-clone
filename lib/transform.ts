import { TMDB_IMAGE_BASE_URL, TMDB_IMAGE_SIZES } from "./tmdb";
import { TMDBMovie, TMDBTvShow } from "./types/tmdb";
import { MediaItem } from "./types/api";

interface LocalMovie {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string;
  rating: number | null;
  duration: string;
}

interface ExtendedTMDBTvShow extends TMDBTvShow {
  episode_run_time?: number[];
}

const getImageUrl = (path: string | null): string => {
  if (!path) {
    return "/images/placeholder.jpg";
  }

  // Remove any leading slashes and any size parameters from the path
  const cleanPath = path.replace(/^\/+/, "").replace(/^w\d+\//, "");

  return `${TMDB_IMAGE_BASE_URL}${TMDB_IMAGE_SIZES.POSTER.ORIGINAL}/${cleanPath}`;
};

export const transformMovie = (movie: TMDBMovie): MediaItem => {
  return {
    id: movie.id.toString(),
    title: movie.title,
    description: movie.overview,
    videoUrl: "",
    thumbnailUrl: getImageUrl(movie.poster_path),
    trailerUrl: "",
    genre: movie.genre_ids.map((id) => id.toString()),
    rating: movie.vote_average,
    duration: `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`,
    isTvShow: false,
    source: "tmdb",
  };
};

export const transformTvShow = (show: ExtendedTMDBTvShow): MediaItem => {
  return {
    id: show.id.toString(),
    title: show.name,
    description: show.overview,
    videoUrl: "",
    thumbnailUrl: getImageUrl(show.poster_path),
    trailerUrl: "",
    genre: show.genre_ids.map((id) => id.toString()),
    rating: show.vote_average,
    duration: `${show.episode_run_time?.[0] || 45}m`,
    isTvShow: true,
    numberOfSeasons: show.number_of_seasons,
    source: "tmdb",
  };
};

export const transformTMDBToLocal = (tmdbMovie: TMDBMovie): LocalMovie => {
  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    description: tmdbMovie.overview,
    videoUrl: "", // TMDB doesn't provide video URLs
    thumbnailUrl: getImageUrl(tmdbMovie.poster_path),
    genre: tmdbMovie.genre_ids.join(", "),
    rating: tmdbMovie.vote_average,
    duration: `${Math.floor(tmdbMovie.runtime / 60)}h ${
      tmdbMovie.runtime % 60
    }m`,
  };
};

export const transformLocalToTMDB = (
  localMovie: LocalMovie
): Partial<TMDBMovie> => {
  return {
    id: parseInt(localMovie.id),
    title: localMovie.title,
    overview: localMovie.description,
    poster_path: localMovie.thumbnailUrl.split("/").pop() || "",
    release_date: "",
    vote_average: localMovie.rating || 0,
  };
};
