"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";

import { AiOutlineClose } from "react-icons/ai";
import { BsFillPlayFill } from "react-icons/bs";
import { BiChevronDown } from "react-icons/bi";

import Image from "next/image";

import FavouriteButton from "./FavouriteButton";
import ReactionsButton from "./ReactionsButton";
import SimilarMovieCard from "./SimilarMovieCard";

import useInfoModal from "@/hooks/useInfoModal";
import useMovieDetails from "@/hooks/useMovieDetails";
import { sampleMovies } from "@/constants/data";

import type {
  MediaItem,
  TransformedMovie,
  TransformedTvShow,
} from "@/lib/types/api";

interface InfoModalProps {
  visible?: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose }) => {
  const [isVisible, setIsVisible] = useState(!!visible);
  const [selectedSeason, setSelectedSeason] = useState(4); // Default to season 4 for TV shows
  const { movieId } = useInfoModal();
  const { data } = useMovieDetails(movieId || "");
  const [isAlreadyWatched, setIsAlreadyWatched] = useState(false); // To track if movie is being watched

  useEffect(() => {
    setIsVisible(!!visible);
    // For demo purposes, randomly set if the movie is already being watched
    setIsAlreadyWatched(Math.random() > 0.5);
  }, [visible]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  if (!visible || !data) {
    return null;
  }

  // Ensure we have default data to work with even if data isn't loaded yet
  const movieData = data || {
    id: "default",
    title: "Loading...",
    thumbnailUrl: "/images/placeholder.jpg",
    videoUrl: "",
    isTvShow: false,
    numberOfSeasons: 1,
    duration: "1h 54m",
  };

  const isTvShow = movieData.isTvShow || false;

  // Sample data
  const sampleCastData = isTvShow
    ? [
        { id: 1, name: "Grant Gustin" },
        { id: 2, name: "Candice Patton" },
        { id: 3, name: "Danielle Panabaker" },
        { id: 4, name: "Carlos Valdes" },
        { id: 5, name: "Jesse L. Martin" },
      ]
    : [
        { id: 1, name: "Jamie Foxx" },
        { id: 2, name: "Cameron Diaz" },
        { id: 3, name: "Glenn Close" },
        { id: 4, name: "Kyle Chandler" },
        { id: 5, name: "Andrew Scott" },
      ];

  const sampleGenres = isTvShow
    ? ["Sci-Fi TV", "TV Action & Adventure", "TV Shows Based on Comics"]
    : ["Comedy Movies", "Action & Adventure Movies", "Spy Movies"];

  const movieKeywords = isTvShow
    ? ["Adrenaline Rush", "Exciting"]
    : ["Exciting"];

  const moreVideos = isTvShow
    ? [
        { id: 1, title: "The Flash Season 4 Trailer" },
        { id: 2, title: "The Flash Season 3 Trailer" },
        { id: 3, title: "The Flash Season 2 Trailer" },
      ]
    : [
        { id: 1, title: "Teaser: Back In Action" },
        { id: 2, title: "Trailer: Back In Action" },
      ];

  const releaseYear = isTvShow ? "2023" : "2025";
  const rating = isTvShow ? "TV-14" : "PG-13";
  const maturityRating = movieData
    ? movieData.isTvShow
      ? "TV-14"
      : "PG-13"
    : rating;
  const contentWarning = isTvShow
    ? "Fear, language. Parents strongly cautioned. May not be suitable for ages under 14."
    : "sequences of violence and action, some suggestive references and strong language, and brief teen partying";

  // Sample episodes data for TV shows
  const sampleEpisodes = [
    {
      id: 1,
      thumbnail: "/images/placeholder.jpg",
      title: "The Flash Reborn",
      duration: "42m",
      description:
        "As Barry remains trapped in the speed force, a powerful new villain issues a deadly ultimatum, putting the team in a tough spot.",
    },
    {
      id: 2,
      thumbnail: "/images/placeholder.jpg",
      title: "Mixed Signals",
      duration: "42m",
      description:
        "While struggling to adjust to Cisco's upgraded suit, Barry takes on a dangerous meta who has the power to control technology.",
    },
    {
      id: 3,
      thumbnail: "/images/placeholder.jpg",
      title: "Luck Be a Lady",
      duration: "42m",
      description:
        "When Barry and company are hit by a flurry of accidents and problems, they realize they may be close to poor fortune than actual bad luck.",
    },
    {
      id: 4,
      thumbnail: "/images/placeholder.jpg",
      title: "Elongated Journey Into Night",
      duration: "41m",
      description:
        "Cisco is shocked to see Danny and her father, Breacher, on Earth-1. Meanwhile, Barry collides with an old foe, the recently thoughtful Dibny.",
    },
    {
      id: 5,
      thumbnail: "/images/placeholder.jpg",
      title: "Girl's Night Out",
      duration: "41m",
      description:
        "Barry and the boys hit the town for a bachelor party while Iris enjoys a night out with the girls. But the celebration hits a few snags along the way.",
    },
  ];

  // Prepare media items for SimilarMovieCard
  const similarMediaItems: MediaItem[] = sampleMovies
    .slice(0, 3)
    .map((movie) => {
      // Create a base media item with common properties
      const baseItem = {
        id: movie.id,
        title: movie.title,
        thumbnailUrl: movie.thumbnailUrl || "/images/placeholder.jpg",
        description: movie.description || "",
        videoUrl: movie.videoUrl || "",
        trailerUrl: movie.trailerUrl || "",
        genre:
          typeof movie.genre === "string" ? [movie.genre] : movie.genre || [],
        rating: movie.rating || null,
      };

      // Return either a TransformedMovie or TransformedTvShow based on isTvShow flag
      if (movie.isTvShow) {
        return {
          ...baseItem,
          numberOfSeasons: movie.numberOfSeasons || 1,
          isTvShow: true as const, //Using `as const` to specify it's the literal 'true' value
        } as TransformedTvShow;
      } else {
        return {
          ...baseItem,
          duration: movie.duration || "1h 54m",
          isTvShow: false as const, //Using `as const` to specify it's the literal 'false' value,
        } as TransformedMovie;
      }
    });

  // Add formattedGenre function

  return (
    <div className="z-50 transition duration-300 bg-black/80 flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0">
      <div className="relative w-auto mx-auto max-w-4xl rounded-md overflow-hidden">
        <div
          className={`${
            isVisible ? "scale-100" : "scale-0"
          } transform duration-300 relative flex-auto bg-zinc-900 drop-shadow-md max-h-[90vh] overflow-y-auto`}
        >
          {/* Hero Section with Video/Image */}
          <div className="relative h-96 w-full">
            <video
              poster={data.thumbnailUrl || "/images/placeholder.jpg"}
              autoPlay
              muted
              loop
              src={data.videoUrl}
              className="w-full brightness-[60%] object-cover h-full"
            ></video>
            {/* Close Button */}
            <div
              onClick={handleClose}
              className="cursor-pointer absolute top-3 right-3 h-10 w-10 rounded-full bg-black/70 flex items-center justify-center z-10"
            >
              <AiOutlineClose className="text-white w-6" />
            </div>

            {/* Movie/Show Title and Action Buttons */}
            <div className="absolute bottom-[10%] left-10">
              <p className="text-white text-3xl md:text-4xl h-full lg:text-5xl font-bold mb-8">
                {data.title || (isTvShow ? "The Flash" : "Back in Action")}
              </p>
              <div className="flex flex-row gap-4 items-center">
                <button className="bg-white text-black rounded-md py-2 px-4 md:py-2 md:px-6 font-bold flex flex-row items-center gap-2">
                  <BsFillPlayFill className="w-6 h-6" />
                  {isAlreadyWatched ? <span>Resume</span> : <span>Play</span>}
                </button>
                <FavouriteButton movieId={data.id} />
                <ReactionsButton />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-12 py-8">
            {/* Movie/Show Details - First Row */}
            <div className="flex flex-row gap-5 mb-6">
              {/* Left Column */}
              <div className="flex flex-col w-2/3">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-white/50 font-bold">{releaseYear}</span>
                  <span className="text-white/70">
                    {data.isTvShow
                      ? `${data.numberOfSeasons || 9}`
                      : data.duration || "1h 54m"}
                  </span>
                  <span className="border border-white/40 text-white/70 text-xs px-1 py-0.5 rounded">
                    HD
                  </span>
                </div>

                <div className="flex items-center mb-6">
                  <span className="text-white/70 text-xs border px-1 py-0.5 border-white/40 mr-3 w-16 h-6 rounded-md">
                    {maturityRating}
                  </span>
                  <span className="text-white/70 text-sm">
                    {contentWarning}
                  </span>
                </div>

                <p className="text-white text-base mb-4">
                  {isTvShow
                    ? "Barry takes time to travel while desperately searching for a way to stop an already-exploding bomb from destroying Central City."
                    : "Two ex-spies (Jamie Foxx and Cameron Diaz) living undercover in suburbia whisk their unsuspecting kids away on a global adventure in this action comedy."}
                </p>
              </div>

              {/* Right Column */}
              <div className="flex flex-col w-1/3">
                <div className="mb-2">
                  <span className="text-white/50 text-sm">Cast: </span>
                  <span className="text-white/70 text-sm">
                    {sampleCastData.map((cast, index) => (
                      <span key={cast.id}>
                        {cast.name}
                        {index < sampleCastData.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-white/50 text-sm">Genres: </span>
                  <span className="text-white/70 text-sm">
                    {sampleGenres.join(", ")}
                  </span>
                </div>

                <div>
                  <span className="text-white/50 text-sm">
                    This {isTvShow ? "Show" : "Movie"} Is:{" "}
                  </span>
                  <span className="text-white/70 text-sm">
                    {movieKeywords.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Section */}
          <div className="px-12 py-6 overflow-y-auto">
            {/* TV Show Episodes Section */}
            {isTvShow && (
              <div className="mt-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-white text-xl font-bold">Episodes</h2>
                  <div className="relative">
                    <select
                      value={selectedSeason}
                      onChange={(e) =>
                        setSelectedSeason(Number(e.target.value))
                      }
                      className="appearance-none bg-zinc-800 text-white pl-4 pr-10 py-2 rounded-md border border-zinc-700 cursor-pointer"
                      aria-label="Select season"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((season) => (
                        <option key={season} value={season}>
                          Season {season}
                        </option>
                      ))}
                    </select>
                    <BiChevronDown
                      className="absolute right-3 top-2.5 text-white"
                      size={20}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  {sampleEpisodes.map((episode, index) => (
                    <div
                      key={episode.id}
                      className="flex gap-4 cursor-pointer hover:bg-zinc-800 p-2 rounded-md"
                    >
                      <div className="flex-shrink-0 text-center text-white/70 w-6">
                        {index + 1}
                      </div>
                      <div className="relative h-24 w-40 flex-shrink-0">
                        <Image
                          src={
                            episode.thumbnail ||
                            data.thumbnailUrl ||
                            "/images/placeholder.jpg" ||
                            "/placeholder.svg"
                          }
                          alt={episode.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                          <BsFillPlayFill className="text-white w-12 h-12" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-white font-medium">
                            {episode.title}
                          </h3>
                          <span className="text-white/70 text-sm">
                            {episode.duration}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">
                          {episode.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* More Like This */}
            <div className="mt-2 mb-8">
              <h2 className="text-white text-xl font-bold mb-5">
                More Like This
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {similarMediaItems.map((movie) => (
                  <SimilarMovieCard key={movie.id} data={movie} />
                ))}
              </div>
            </div>

            {/* Trailers & More */}
            <div className="mt-8 mb-8">
              <h2 className="text-white text-xl font-bold mb-5">
                Trailers & More
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {moreVideos.map((video) => (
                  <div key={video.id} className="relative">
                    <div className="relative h-40 rounded-md overflow-hidden">
                      <Image
                        src={data.thumbnailUrl || "/images/placeholder.jpg"}
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/30 rounded-full p-3">
                          <BsFillPlayFill className="text-white w-8 h-8" />
                        </div>
                      </div>
                    </div>
                    <p className="text-white mt-2">{video.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="mt-8">
              <h2 className="text-white text-xl font-bold mb-4">
                About{" "}
                <strong>
                  {data.title || isTvShow ? "The Flash" : "Back in Action"}{" "}
                </strong>
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {isTvShow ? (
                  <>
                    <div>
                      <span className="text-white/50 text-sm">Creators: </span>
                      <span className="text-white/70 text-sm">
                        Greg Berlanti, Geoff Johns, Andrew Kreisberg
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 text-sm">Cast: </span>
                      <span className="text-white/70 text-sm">
                        Grant Gustin, Candice Patton, Danielle Panabaker, Carlos
                        Valdes, Tom Cavanagh, Jesse L. Martin
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-white/50 text-sm">Director: </span>
                      <span className="text-white/70 text-sm">Seth Gordon</span>
                    </div>
                    <div>
                      <span className="text-white/50 text-sm">Cast: </span>
                      <span className="text-white/70 text-sm">
                        Jamie Foxx, Cameron Diaz, Glenn Close, Kyle Chandler,
                        Andrew Scott
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 text-sm">Writer: </span>
                      <span className="text-white/70 text-sm">
                        Seth Gordon, Brendan O&apos;Brien
                      </span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-white/50 text-sm">Genres: </span>
                  <span className="text-white/70 text-sm">
                    {sampleGenres.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-white/50 text-sm">
                    This {isTvShow ? "Show" : "Movie"} Is:{" "}
                  </span>
                  <span className="text-white/70 text-sm">
                    {movieKeywords.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-white/50 text-sm">
                    Maturity Rating:{" "}
                  </span>
                  <div className="inline-flex items-center">
                    <span className="text-white/70 text-xs border px-1 py-0.5 border-white/40 mr-3">
                      {maturityRating}
                    </span>
                    <span className="text-white/70 text-sm">
                      {contentWarning}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
