import React, { useRef, useState } from "react";

import { BsFillPlayFill } from "react-icons/bs";
import { BiChevronDown } from "react-icons/bi";
import FavouriteButton from "./FavouriteButton";
import ReactionsButton from "./ReactionsButton";

import Image from "next/image";
import { useRouter } from "next/router";

import useInfoModal from "@/hooks/useInfoModal";

import { MediaItem } from "@/lib/types/api";
import { useExpandedPosition } from "@/lib/useExpandedPosition";
import { TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";

interface TopMovieCardProps {
  data: MediaItem;
  index: number;
}

const TopMovieCard: React.FC<TopMovieCardProps> = ({ data, index }) => {
  const router = useRouter();
  const expandedRef = useRef<HTMLDivElement>(null);
  const { getPosition } = useExpandedPosition(expandedRef);
  const { openModal } = useInfoModal();
  const [isHovered, setIsHovered] = useState(false);

  const refPosition = getPosition();

  const getImageUrl = (path: string) => {
    if (!path) {
      console.warn("No image path provided for:", data.title);
      return "/images/placeholder.jpg";
    }

    // If it's already a full URL, return it
    if (path.startsWith("http")) {
      return path;
    }

    // If it's a local path, return it
    if (path.startsWith("/")) {
      return path;
    }

    // For TMDB paths, ensure we don't have duplicate size parameters
    const cleanPath = path.replace(/^\/+/, "").replace(/^w\d+\//, "");
    const imageUrl = `${TMDB_IMAGE_BASE_URL}w500/${cleanPath}`;

    return imageUrl;
  };

  const imageUrl = getImageUrl(data.thumbnailUrl);

  // Calculate position adjustments for the expanded card
  const getExpandedCardStyle = () => {
    const baseStyle = {
      transition: "all 0.3s ease-in-out",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
      pointerEvents: "auto" as const,
    };

    return {
      ...baseStyle,
      left: refPosition.left,
      top: refPosition.top,
      transform: "scale(1.2)",
      width: "22vw",
    };
  };

  const handleOpenModal = () => {
    const contentType: "movie" | "tv" =
      data?.isTvShow === true ? "tv" : "movie";
    openModal(data?.id, contentType);
    setIsHovered(false);
  };
  return (
    <div
      className={`relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: "transform 0.3s ease, z-index 0s",
        zIndex: isHovered ? 1000 : 1,
        isolation: isHovered ? "isolate" : "auto",
      }}
      ref={expandedRef}
    >
      {/* Base Card with Number */}
      <div className="relative flex items-center">
        <span className="text-[400px] font-bold text-green-800/30 leading-none">
          {index}
        </span>
        <div className="-left-12 show-card w-[220px]">
          <div
            className={`relative rounded-lg overflow-hidden transition-opacity duration-300 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          >
            <Image
              src={imageUrl || "/images/placeholder.jpg"}
              alt={data.title}
              width={300}
              height={400}
              className="w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
              <h2 className="text-xl font-bold text-center">{data.title}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Card on Hover */}
      {isHovered && (
        <div
          className="netflix-expanded-card z-100"
          style={getExpandedCardStyle()}
        >
          <div
            onClick={() => router.push(`/watch/${data.id}`)}
            className="relative w-full h-[10vw] rounded-t-md overflow-hidden mt-5"
          >
            <Image
              src={imageUrl || "/images/placeholder.jpg"}
              alt={data.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="cursor-pointer object-cover shadow-xl w-full h-full"
            />
          </div>

          {/* Content section */}
          <div className="bg-zinc-800 p-4 rounded-b-md">
            {/* Action Buttons */}
            <div className="flex flex-row items-center gap-3 mb-4">
              <div
                onClick={() => router.push(`/watch/${data.id}`)}
                className="cursor-pointer w-6 h-6 lg:w-10 lg:h-10 border-2 border-white/60 rounded-full flex justify-center items-center transition hover:border-white"
              >
                <BsFillPlayFill className="text-white" size={25} />
              </div>
              <FavouriteButton movieId={data.id} />
              <ReactionsButton />
              <div
                onClick={handleOpenModal}
                className="cursor-pointer ml-auto w-6 h-6 lg:w-10 lg:h-10 border-white/60 border-2 rounded-full flex justify-center items-center transition hover:border-white"
              >
                <BiChevronDown className="text-white" size={25} />
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/70 text-xs border px-1 border-white/40">
                {data.isTvShow
                  ? data.isAdult
                    ? "TV_MA"
                    : "TV-14"
                  : data.isAdult
                  ? "R"
                  : "PG-13"}
              </span>
              <span className="text-white/70 text-xs">
                {data.isTvShow
                  ? `${data.numberOfSeasons} Seasons`
                  : data.duration}
              </span>
              <span className="text-white/70 text-xs font-bold">HD</span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(data.genre) ? (
                data.genre.map((g, i) => (
                  <span key={i} className="text-white/70 text-xs">
                    {i > 0 && "•"} {g}
                  </span>
                ))
              ) : (
                <span className="text-white/70 text-xs">{data.genre}</span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-white font-medium text-sm mb-1">
              {data.title}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopMovieCard;
