import { useState, useEffect } from "react";
import { MediaItem } from "@/lib/types/api";

interface MoviesResponse {
  local: MediaItem[];
  tmdb: MediaItem[];
}

const useMovies = () => {
  const [data, setData] = useState<MoviesResponse>({ local: [], tmdb: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        console.log("Fetching movies...");
        const response = await fetch("/api/movies", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
          });

          // Set empty data to prevent undefined errors in components
          setData({ local: [], tmdb: [] });
          setError(
            `Failed to fetch movies: ${response.status} - ${response.statusText}`
          );
          return;
        }

        const responseData = await response.json();
        console.log("Raw API Response:", responseData);

        // Ensure we have the correct data structure
        const moviesData: MoviesResponse = {
          local: Array.isArray(responseData?.local) ? responseData.local : [],
          tmdb: Array.isArray(responseData?.tmdb) ? responseData.tmdb : [],
        };

        console.log("Processed Movies Data:", moviesData);
        setData(moviesData);
        setError(null);
      } catch (err) {
        console.error("Error in fetchMovies:", err);
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

    fetchMovies();
  }, []);

  return { data, isLoading, error };
};

export default useMovies;
