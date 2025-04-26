import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { TvShowDetailsResponse } from "@/lib/types/api";

const useTvShowDetails = (id: string) => {
  const { data, isLoading, error, mutate } = useSWR<TvShowDetailsResponse>(
    id ? `/api/tv/${id}` : null,
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

export default useTvShowDetails;
