import { useState, useEffect } from "react";
import { MediaItem } from "@/lib/types/api";

interface TvShowsResponse {
  local: MediaItem[];
  tmdb: MediaItem[];
}

const useTvShows = () => {
  const [data, setData] = useState<TvShowsResponse>({ local: [], tmdb: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTvShows = async () => {
      try {
        const response = await fetch("/api/tv", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch TV shows: ${response.status}`);
        }

        const responseData = await response.json();

        // Ensure we have the correct data structure
        const tvShowsData: TvShowsResponse = {
          local: Array.isArray(responseData?.local) ? responseData.local : [],
          tmdb: Array.isArray(responseData?.tmdb) ? responseData.tmdb : [],
        };

        setData(tvShowsData);
      } catch (err) {
        console.error("Error fetching TV shows:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTvShows();
  }, []);

  return { data, isLoading, error };
};

export default useTvShows;
