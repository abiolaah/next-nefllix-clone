// hooks/useReactions.ts
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { MediaItem } from "@/lib/types/api";

type ReactionItems = MediaItem & {
  source: "local" | "tmdb";
  reactionType: "liked" | "loved" | "disliked";
};

const useReactions = (profileId?: string, reactionType?: string) => {
  const url = profileId
    ? reactionType
      ? `/api/reactions?profileId=${profileId}&reactionType=${reactionType}`
      : `/api/reactions?profileId=${profileId}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<ReactionItems[]>(
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

export default useReactions;
