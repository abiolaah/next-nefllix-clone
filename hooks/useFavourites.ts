import useSWR from "swr";

import fetcher from "@/lib/fetcher";

interface FavoritesMovieResponse {
  duration: string;
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  trailerUrl: string;
  genre: string[];
  rating: number | null;
  isAdult: boolean;
}

interface FavoritesTvResponse {
  id: string;
  title: string;
  numberOfSeasons: number;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  trailerUrl: string;
  genre: string[];
  rating: number | null;
  isAdult: boolean;
}

interface FavoritesResponse {
  movies: FavoritesMovieResponse[];
  tvShows: FavoritesTvResponse[];
}

const useFavourites = () => {
  const { data, isLoading, error, mutate } = useSWR<FavoritesResponse>(
    "/api/favourites",
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

export default useFavourites;
