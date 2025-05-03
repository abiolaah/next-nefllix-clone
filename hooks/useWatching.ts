// hooks/useWatching.ts
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { WatchingItem } from "@/lib/types/api";

interface UseWatchingParams {
  profileId?: string;
  completed?: boolean;
  mediaId?: string;
}

const useWatching = (params: UseWatchingParams = {}) => {
  const { profileId, completed, mediaId } = params;

  // Build URL with query parameters
  let url = profileId ? `/api/watchings?profileId=${profileId}` : null;

  if (url && completed !== undefined) {
    url += `&completed=${completed}`;
  }

  if (url && mediaId) {
    url += `&mediaId=${mediaId}`;
  }

  const { data, error, isLoading, mutate } = useSWR<WatchingItem[]>(
    url,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
    mutate,
  };
};

export default useWatching;
