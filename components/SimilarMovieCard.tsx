"use client";

import type React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import FavouriteButton from "./FavouriteButton";
import { TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";

interface SimilarContentItem {
  id: string | number;
  title: string;
  description: string;
  thumbnailUrl: string;
  releaseDate: string;
  duration?: string;
  numberOfSeasons?: string;
  videoUrl?: string;
  trailerUrl?: string;
  isAdult: boolean;
  isTvShow: boolean;
}

interface SimilarMovieCardProps {
  data: SimilarContentItem;
}

const SimilarMovieCard: React.FC<SimilarMovieCardProps> = ({ data }) => {
  const router = useRouter();

  const maturityRating = data ? (data.isTvShow ? "TV-14" : "PG-13") : "PG-14";

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

  return (
    <div
      onClick={() => router.push(`/watch/${data.id}`)}
      className="bg-zinc-800 rounded-md overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative h-36">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={data.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-800 to-transparent" />
      </div>

      {/* Content section */}
      <div className="p-3">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <span className="border border-white/30 text-white/70 text-xs px-1 py-0.5">
              {maturityRating}
            </span>
            <span className="text-white/70 text-xs">
              {data.isTvShow
                ? `${data.numberOfSeasons || 9}`
                : data.duration || "1h 54m"}
            </span>
            <span className="text-white/70 text-xs">HD</span>
          </div>
          <div className="flex items-center gap-2">
            <FavouriteButton movieId={data.id} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-medium text-sm mb-1">{data.title}</h3>

        {/* Metadata */}
        <p className="text-white/70 text-sm">{data.description}</p>
      </div>
    </div>
  );
};

export default SimilarMovieCard;
