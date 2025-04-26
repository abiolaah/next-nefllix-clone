import useSWR from "swr";

import fetcher from "@/lib/fetcher";
import { MediaItem } from "@/lib/types/api";

const useFavourites = (profileId?: string) => {
  const { data, isLoading, error, mutate } = useSWR<MediaItem[]>(
    profileId ? `/api/favourites?profileId=${profileId}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
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
