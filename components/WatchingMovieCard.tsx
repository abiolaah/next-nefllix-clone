"use client";
import React, { useState, useRef } from "react";

import { BsFillPlayFill } from "react-icons/bs";
import { BiChevronDown } from "react-icons/bi";

import Image from "next/image";
import { useRouter } from "next/router";

import { TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";

import useInfoModal from "@/hooks/useInfoModal";

import FavouriteButton from "./FavouriteButton";
import ReactionsButton from "./ReactionsButton";
import { useExpandedPosition } from "@/lib/useExpandedPosition";
import useProfile from "@/hooks/useProfile";
import { IoClose } from "react-icons/io5";
import { WatchingItem } from "@/lib/types/api";
import axios from "axios";

interface WatchingMovieCardProps {
  data: WatchingItem;
}

const WatchingMovieCard: React.FC<WatchingMovieCardProps> = ({ data }) => {
  const router = useRouter();
  const expandedRef = useRef<HTMLDivElement>(null);
  const { getPosition } = useExpandedPosition(expandedRef);
  const { openModal } = useInfoModal();
  const [isHovered, setIsHovered] = useState(false);

  const { currentProfileId } = useProfile();

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

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await axios.delete(`/api/watching`, {
      data: {
        mediaId: data.id,
        profileId: currentProfileId,
        source: data.source,
      },
    });
  };

  // Format time for display (e.g., "45 of 120 minutes")
  const formatTime = () => {
    // For TV shows, use episode duration if available
    if (data.isTvShow) {
      if (data.episodeDetails?.duration) {
        const totalMinutes = Number.parseInt(
          data.episodeDetails?.duration.replace(/\D/g, "")
        );
        if (isNaN(totalMinutes)) return "";

        const watchedMinutes = Math.floor(
          totalMinutes * ((data.progress || 0) / 100)
        );
        return `${watchedMinutes} of ${totalMinutes} minutes`;
      }
      return "";
    }

    // For movies, use the movie duration
    if (data.duration) {
      // Parse duration (assuming format like "120 min" or just "120")
      const totalMinutes = Number.parseInt(data.duration.replace(/\D/g, ""));
      if (isNaN(totalMinutes)) return "";

      // Calculate watched minutes based on progress (0-100%)
      const watchedMinutes = Math.floor(
        totalMinutes * ((data.progress || 0) / 100)
      );
      return `${watchedMinutes} of ${totalMinutes} minutes`;
    }

    return "";
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: "transform 0.3s ease, z-index 0s",
        zIndex: isHovered ? 1000 : 1,
        isolation: isHovered ? "isolate" : "auto",
      }}
      ref={expandedRef}
    >
      {/* Base Card */}
      <div className="relative h-[12vw] w-[16vw] netflix-card-wrapper">
        <div
          className={`relative w-full h-full rounded-md overflow-hidden transition-opacity duration-300 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={data.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="cursor-pointer object-cover shadow-xl rounded-md"
            onError={(e) => {
              console.error(
                "Error loading image for",
                data.title,
                ":",
                imageUrl
              );
              (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
            }}
          />
          {/* Progress bar (always visible) */}
          <div className="absolute botton-0 left-0 right-0 h-1 bg-gray-800">
            <div
              className="h-full bg-red-600"
              style={{ width: `${data.progress}%` }}
            />
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
            className="relative w-full h-[8vw] rounded-t-md overflow-hidden mt-5"
          >
            <Image
              src={imageUrl || "/images/placeholder.jpg"}
              alt={data.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="cursor-pointer object-cover shadow-xl w-full h-full"
              onError={(e) => {
                console.error(
                  "Error loading image for",
                  data.title,
                  ":",
                  imageUrl
                );
                (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
              }}
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
              <FavouriteButton
                mediaId={data.id}
                mediaType={data.isTvShow ? "tv" : "movie"}
                profileId={currentProfileId || ""}
              />
              {/* New Remove Button */}
              <div
                onClick={handleRemove}
                className="cursor-pointer w-6 h-6 lg:w-10 lg:h-10 border-2 border-white/60 rounded-full flex justify-center items-center transition hover:border-white hover:bg-red-500/20"
              >
                <IoClose className="text-white" size={20} />
              </div>
              <ReactionsButton
                mediaId={data.id}
                mediaType={data.isTvShow ? "tv" : "movie"}
                profileId={currentProfileId || ""}
                source={data.source || "tmdb"}
              />
              <div
                onClick={handleOpenModal}
                className="cursor-pointer ml-auto w-6 h-6 lg:w-10 lg:h-10 border-white/60 border-2 rounded-full flex justify-center items-center transition hover:border-white"
              >
                <BiChevronDown className="text-white" size={25} />
              </div>
            </div>

            {/* Current episode for TV shows */}
            {data.isTvShow && data.episodeDetails && (
              <div className="mb-2">
                <span className="text-white/90 text-xs">
                  S{data.currentSeason} E{data.currentEpisode}:{" "}
                  {data.episodeDetails.title}
                </span>
              </div>
            )}

            {/* Progress Info */}
            <div className="flex flex-row w-full gap-4">
              {/* Progress bar on expanded card */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 w-3/4">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
              {/* Watch progress information */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/70 text-xs">{formatTime()}</span>
              </div>
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

export default WatchingMovieCard;
