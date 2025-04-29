// hooks/useWatching.ts
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { MediaItem } from "@/lib/types/api";

interface EpisodeDetails {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

type WatchingItem = MediaItem & {
  source: "local" | "tmdb";
  progress: number;
  completed: boolean;
  lastWatched: Date;
  currentSeason?: number;
  currentEpisode?: number;
  episodeDetails?: EpisodeDetails;
};

const useWatching = (
  profileId?: string,
  completed?: boolean,
  mediaId?: string
) => {
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
