import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { MediaItem } from "@/lib/types/api";

const useMovieDetails = (id: string) => {
  const { data, isLoading, error, mutate } = useSWR<MediaItem>(
    id ? `/api/movies/${id}` : null,
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

export default useMovieDetails;
