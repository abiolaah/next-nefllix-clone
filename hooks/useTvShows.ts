import { useState, useEffect } from "react";
import { MediaItem } from "@/lib/types/api";

interface TvShowsResponse {
  local: MediaItem[];
  tmdb: MediaItem[];
}

export type TvShowEndpointType =
  | "popular"
  | "top_rated"
  | "on_air"
  | "trending";

interface UseTvShowsOptions {
  type?: TvShowEndpointType;
  page?: number;
  initialFetch?: boolean;
}

const useTvShows = ({
  type = "popular",
  page = 1,
  initialFetch = true,
}: UseTvShowsOptions = {}) => {
  const [data, setData] = useState<TvShowsResponse>({ local: [], tmdb: [] });
  const [isLoading, setIsLoading] = useState(initialFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchTvShows = async (showType = type, pageNumber = page) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/tv?type=${showType}&page=${pageNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        throw new Error(`Failed to fetch TV shows: ${response.status}`);
      }

      const responseData = await response.json();

      // Ensure we have the correct data structure
      const tvShowsData: TvShowsResponse = {
        local: Array.isArray(responseData?.local) ? responseData.local : [],
        tmdb: Array.isArray(responseData?.tmdb) ? responseData.tmdb : [],
      };

      setData(tvShowsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching TV shows:", err);
      setData({ local: [], tmdb: [] });
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (initialFetch) {
      fetchTvShows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, isLoading, error, fetchTvShows, refetch: fetchTvShows };
};

export default useTvShows;
