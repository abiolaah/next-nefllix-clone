import useSWR from "swr";
import fetcher from "@/lib/fetcher";

interface TvShowData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string[];
  rating: number | null;
  duration: string;
  releaseDate: string;
  adult: boolean;
  isTvShow: boolean;
  numberOfSeasons: number;
}

const useTvShows = () => {
  const { data, isLoading, error, mutate } = useSWR<TvShowData[]>(
    "/api/tv",
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

export default useTvShows;
