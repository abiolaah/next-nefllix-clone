// hooks/useFavourites.ts
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { MediaItem } from "@/lib/types/api";

type FavoritesItems = MediaItem & {
  source: "local" | "tmdb";
};

const useFavourites = (profileId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<FavoritesItems[]>(
    profileId ? `/api/favourites?profileId=${profileId}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false, // Prevent infinite retries on 500 errors
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
    mutate,
  };
};

export default useFavourites;
