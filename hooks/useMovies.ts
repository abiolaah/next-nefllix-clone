import { useState, useEffect } from "react";
import { MediaItem } from "@/lib/types/api";

interface MoviesResponse {
  local: MediaItem[];
  tmdb: MediaItem[];
}

export type MovieEndpointType =
  | "popular"
  | "top_rated"
  | "now_playing"
  | "upcoming"
  | "trending";

interface useMoviesOptions {
  type?: MovieEndpointType;
  page?: number;
  initialFetch?: boolean;
}

const useMovies = ({
  type = "popular",
  page = 1,
  initialFetch = true,
}: useMoviesOptions = {}) => {
  const [data, setData] = useState<MoviesResponse>({ local: [], tmdb: [] });
  const [isLoading, setIsLoading] = useState(initialFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async (movieType = type, pageNumber = page) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/movies?type=${movieType}&page=${pageNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        // Set empty data to prevent undefined errors in components
        setData({ local: [], tmdb: [] });
        setError(
          `Failed to fetch movies: ${response.status} - ${response.statusText} -${errorData}`
        );
        return;
      }

      const responseData = await response.json();

      // Ensure we have the correct data structure
      const moviesData: MoviesResponse = {
        local: Array.isArray(responseData?.local) ? responseData.local : [],
        tmdb: Array.isArray(responseData?.tmdb) ? responseData.tmdb : [],
      };

      setData(moviesData);
      setError(null);
    } catch (err) {
      // Set empty data to prevent undefined errors in components
      setData({ local: [], tmdb: [] });
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching movies"
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (initialFetch) {
      fetchMovies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, isLoading, error, fetchMovies, refetch: fetchMovies };
};

export default useMovies;
