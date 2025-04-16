import { TMDB_IMAGE_BASE_URL, TMDB_IMAGE_SIZES } from "./tmdb";

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

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

const getImageUrl = (path: string | null): string => {
  if (!path) {
    return "/images/placeholder.jpg";
  }

  // Remove any leading slashes and any size parameters from the path
  const cleanPath = path.replace(/^\/+/, "").replace(/^w\d+\//, "");

  return `${TMDB_IMAGE_BASE_URL}${TMDB_IMAGE_SIZES.POSTER.ORIGINAL}/${cleanPath}`;
};

export const transformTMDBToLocal = (tmdbMovie: TMDBMovie): LocalMovie => {
  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    description: tmdbMovie.overview,
    videoUrl: "", // TMDB doesn't provide video URLs
    thumbnailUrl: getImageUrl(tmdbMovie.poster_path),
    genre: "", // You might want to map TMDB genres to your local genres
    rating: tmdbMovie.vote_average,
    duration: "", // TMDB provides runtime in minutes, you might want to format it
  };
};

export const transformLocalToTMDB = (localMovie: LocalMovie): TMDBMovie => {
  return {
    id: parseInt(localMovie.id),
    title: localMovie.title,
    overview: localMovie.description,
    poster_path: localMovie.thumbnailUrl.split("/").pop() || null,
    backdrop_path: null, // You might want to store this in your local database
    release_date: "", // You might want to store this in your local database
    vote_average: localMovie.rating || 0,
  };
};
