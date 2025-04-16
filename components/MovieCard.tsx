import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { BsFillPlayFill } from "react-icons/bs";
import { BiChevronDown } from "react-icons/bi";
import FavouriteButton from "./FavouriteButton";
import ReactionsButton from "./ReactionsButton";
import useInfoModal from "@/hooks/useInfoModal";

interface MovieData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string | string[];
  rating: number | null;
  duration: string;
  releaseDate?: string;
  adult?: boolean;
  isTvShow?: boolean;
  numberOfSeasons?: number;
}

interface MovieCardProps {
  data: MovieData;
}

const MovieCard: React.FC<MovieCardProps> = ({ data }) => {
  const router = useRouter();
  const { openModal } = useInfoModal();

  const getRating = () => {
    if (data.isTvShow) {
      return data.adult ? "TV-MA" : "TV-14";
    }
    return data.adult ? "18+" : "PG-13";
  };

  const getReleaseYear = () => {
    if (data.isTvShow) return null;
    return data.releaseDate ? new Date(data.releaseDate).getFullYear() : null;
  };

  const getDuration = () => {
    if (data.isTvShow) {
      if (data.numberOfSeasons === 1) return "Limited Series";
      return `${data.numberOfSeasons} Seasons`;
    }
    return data.duration;
  };

  const getGenres = () => {
    if (!data.genre) return "No genres";

    if (typeof data.genre === "string") {
      return data.genre;
    }

    if (Array.isArray(data.genre)) {
      if (data.genre.length === 0) return "No genres";
      if (data.genre.length <= 3) return data.genre.join(", ");
      return data.genre.slice(0, 3).join(", ");
    }

    return "No genres";
  };

  return (
    <div className="group relative w-[200px] h-[300px]">
      <div className="relative w-full h-full">
        <Image
          src={data.thumbnailUrl}
          alt="Thumbnail"
          fill
          className="object-contain transition duration shadow-xl rounded-md group-hover:opacity-90 sm:group-hover:opacity-0 delay-300"
        />
      </div>
      <div className="opacity-0 absolute top-0 transition duration-200 z-10 invisible sm:visible delay-300 w-full group-hover:opacity-100">
        <div className="relative w-full h-[200px]">
          <Image
            src={data.thumbnailUrl}
            alt="Thumbnail"
            fill
            className="object-contain transition duration shadow-xl rounded-t-md"
          />
        </div>
        <div className="z-10 bg-zinc-800 p-2 w-full transition shadow-md rounded-b-md">
          <div className="flex flex-row items-center gap-2">
            <div
              onClick={() => router.push(`/watch/${data?.id}`)}
              className="cursor-pointer w-6 h-6 bg-white rounded-full flex justify-center items-center transition hover:bg-neutral-300"
            >
              <BsFillPlayFill size={20} />
            </div>
            <FavouriteButton movieId={data?.id} />
            <ReactionsButton />
            <div
              className="cursor-pointer ml-auto group/item w-6 h-6 border-white rounded-full flex justify-center items-center transition hover:border-neutral-300"
              onClick={() => openModal(data?.id)}
            >
              <BiChevronDown
                className="text-white group-hover/item:text-neutral-300"
                size={20}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <p className="text-green-400 font-semibold text-xs">
              {getRating()}
              {getReleaseYear() && (
                <span className="text-white ml-1">{getReleaseYear()}</span>
              )}
            </p>
            <p className="text-white text-xs">{getDuration()}</p>
            <p className="text-white text-xs">{getGenres()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
