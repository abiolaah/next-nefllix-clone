"use client";
import React, { useCallback, useEffect, useState } from "react";

import { AiOutlineClose } from "react-icons/ai";
import { BsFillPlayFill, BsVolumeMute, BsVolumeUp } from "react-icons/bs";
import { BiChevronDown } from "react-icons/bi";

import Image from "next/image";
import { useRouter } from "next/router";

import FavouriteButton from "./FavouriteButton";
import ReactionsButton from "./ReactionsButton";
import SimilarMovieCard from "./SimilarMovieCard";

import useInfoModal from "@/hooks/useInfoModal";
import useMovieDetails from "@/hooks/useMovieDetails";
import useTvShowDetails from "@/hooks/useTvShowDetails";

import { MovieDetailsResponse, TvShowDetailsResponse } from "@/lib/types/api";
import useProfile from "@/hooks/useProfile";
import useWatching from "@/hooks/useWatching";

interface InfoModalProps {
  visible?: boolean;
  onClose: () => void;
}

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

const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(!!visible);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const { movieId, contentType: storeContentType } = useInfoModal();
  const [isAlreadyWatched, setIsAlreadyWatched] = useState(false);

  const [isMuted, setIsMuted] = useState(true);

  const { currentProfileId } = useProfile();

  // Watching data for the media
  const { data: watchingData } = useWatching({
    profileId: currentProfileId || undefined,
    mediaId: movieId as string,
    completed: false,
  });

  const watchingRecord = watchingData?.[0];

  // Important: We maintain the content type from the store consistently
  const [contentType, setContentType] = useState<"movie" | "tv">(
    storeContentType
  );

  const [similarContent, setSimilarContent] = useState<SimilarContentItem[]>(
    []
  );

  // Fetch data based on content type
  const { data: movieResponse, isLoading: movieLoading } = useMovieDetails(
    contentType === "movie" ? movieId || "" : ""
  );

  const { data: tvResponse, isLoading: tvLoading } = useTvShowDetails(
    contentType === "tv" ? movieId || "" : ""
  );

  // Cast to proper types
  const movieDetailsResponse = movieResponse as
    | MovieDetailsResponse
    | undefined;
  const tvDetailsResponse = tvResponse as TvShowDetailsResponse | undefined;

  // Extract the details from the response
  const movieData = movieDetailsResponse?.details;
  const tvData = tvDetailsResponse?.details;

  const movieSource = movieDetailsResponse?.source || "tmdb";
  const tvSource = tvDetailsResponse?.source || "tmdb";

  const dataSource = contentType === "movie" ? movieSource : tvSource;

  // Toggle for muted
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Update the effect that watches for contentType changes
  useEffect(() => {
    setContentType(storeContentType);
  }, [storeContentType]);

  // Update content type only after data is loaded and if needed
  useEffect(() => {
    // If we're in TV mode but don't have TV data after it finished loading, check if we have movie data
    if (contentType === "tv" && !tvLoading && !tvData && movieData) {
      setContentType("movie");
    }
    // If we're in movie mode but don't have movie data after it finished loading, check if we have TV data
    else if (contentType === "movie" && !movieLoading && !movieData && tvData) {
      setContentType("tv");
    }
  }, [contentType, movieData, tvData, movieLoading, tvLoading]);

  // Set up similar content
  useEffect(() => {
    const apiSimilarMovies = movieDetailsResponse?.similar || [];
    const apiSimilarTvShows = tvDetailsResponse?.similar || [];

    if (contentType === "movie" && apiSimilarMovies.length > 0) {
      setSimilarContent(apiSimilarMovies.slice(0, 3));
    } else if (contentType === "tv" && apiSimilarTvShows.length > 0) {
      setSimilarContent(apiSimilarTvShows.slice(0, 3));
    }
  }, [contentType, movieDetailsResponse?.similar, tvDetailsResponse?.similar]);

  // Update visibility based on prop changes
  useEffect(() => {
    setIsVisible(!!visible);
    // For demo purposes, randomly set if the content is already being watched
    if (
      watchingRecord &&
      (watchingRecord.progress || 0) >= 25 &&
      (watchingRecord?.progress || 0) < 98
    ) {
      setIsAlreadyWatched(true);
    } else {
      setIsAlreadyWatched(false);
    }
  }, [visible, watchingRecord]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Determine which data to use based on content type
  const data = contentType === "tv" ? tvData : movieData;
  const isLoading = contentType === "tv" ? tvLoading : movieLoading;

  if (!visible) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="z-50 transition duration-300 bg-black/80 flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0">
        <div className="relative w-auto mx-auto max-w-4xl rounded-md overflow-hidden">
          <div className="relative bg-zinc-900 p-10 flex justify-center items-center">
            <div className="text-white text-2xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Explicitly determine if this is a TV show based on content type
  const isTvShow = contentType === "tv" || data.isTvShow;

  // Format genres for display
  const formattedGenres = Array.isArray(data.genre)
    ? data.genre.map((g) => (typeof g === "object" && g.name ? g.name : g))
    : typeof data.genre === "string"
    ? [data.genre]
    : ["Unknown"];

  // Format content rating
  const contentRating = isTvShow
    ? data.isAdult
      ? "TV-MA"
      : "TV-14"
    : data.isAdult
    ? "R"
    : "PG-13";

  // Format content warning based on rating
  const contentWarning =
    contentRating === "TV-MA" || contentRating === "R"
      ? "Language, violence, sexual content. Not suitable for viewers under 17."
      : contentRating === "TV-14" || contentRating === "PG-13"
      ? "Fear, language. Parents strongly cautioned. May not be suitable for ages under 14."
      : "Suitable for most audiences";

  // Extract cast from the nested credits structure
  const castMembers = data.credits?.cast
    ? data.credits.cast.map((cast) => cast.name)
    : [];

  // Handle creators/directors differently based on content type
  const creators =
    isTvShow && tvData && "createdBy" in tvData
      ? (tvData.createdBy || []).map(
          (creator: { name: string }) => creator.name
        )
      : (
          data.credits as { crew?: Array<{ department: string; name: string }> }
        )?.crew
          ?.filter(
            (person: { department: string }) =>
              person.department === "Directing"
          )
          .map((director: { name: string }) => director.name) || [];

  // Writers only apply to movies
  const writers = !isTvShow
    ? (
        data.credits as { crew?: Array<{ department: string; name: string }> }
      )?.crew
        ?.filter(
          (person: { department: string }) => person.department === "Writing"
        )
        .map((writer: { name: string }) => writer.name) || []
    : [];

  // Extract keywords
  const keywordsList =
    data.keywords?.keywords?.map((keyword) => keyword.name) || [];

  // Format episodes for TV shows
  const episodes =
    isTvShow &&
    tvData &&
    "seasons" in tvData &&
    tvData.seasons &&
    tvData.seasons.length > 0
      ? (
          tvData.seasons.find((s) => s.season_number === selectedSeason)
            ?.episodes || []
        ).map((episode) => ({
          id: episode.id.toString(),
          thumbnail:
            episode.thumbnailUrl ||
            data.thumbnailUrl ||
            "/images/placeholder.jpg",
          title: episode.name || `Episode ${episode.episodeNumber}`,
          duration: episode.duration || "42m",
          description: episode.description || "No description available.",
        }))
      : isTvShow
      ? [
          {
            id: "1",
            thumbnail: data.thumbnailUrl || "/images/placeholder.jpg",
            title: "Episode 1",
            duration: "42m",
            description: data.description || "No description available.",
          },
          {
            id: "2",
            thumbnail: data.thumbnailUrl || "/images/placeholder.jpg",
            title: "Episode 2",
            duration: "42m",
            description: "The adventure continues in this thrilling episode.",
          },
          {
            id: "3",
            thumbnail: data.thumbnailUrl || "/images/placeholder.jpg",
            title: "Episode 3",
            duration: "42m",
            description: "Our heroes face unexpected challenges.",
          },
        ]
      : [];

  // Handle the number of seasons for TV shows
  const numberOfSeasons =
    isTvShow && tvData
      ? typeof tvData.numberOfSeasons === "string"
        ? Math.max(1, parseInt(tvData.numberOfSeasons)) || 1
        : Math.max(tvData.numberOfSeasons || 1)
      : 1;

  // Format display text for seasons/duration based on content type
  const durationText = isTvShow
    ? `${numberOfSeasons} ${numberOfSeasons === 1 ? "Season" : "Seasons"}`
    : (data as MovieDetailsResponse["details"]).duration || "N/A";

  // Format time for display (e.g., "45 of 120 minutes")
  const formatTime = () => {
    // Get progress from watching record if available
    const progress = watchingRecord?.progress || 0;

    // Handle TV show case
    if (isTvShow) {
      // Type-safe access to episode details from watching record
      const episodeDuration = watchingRecord?.episodeDetails?.duration;
      if (!episodeDuration) return "";

      const totalMinutes =
        parseInt(episodeDuration.replace(/\D/g, ""), 10) || 0;
      if (totalMinutes <= 0) return "";

      const watchedMinutes = Math.floor(totalMinutes * (progress / 100));
      return `${watchedMinutes} of ${totalMinutes} minutes`;
    }

    // Handle movie case - safely cast to movie type
    const movieData = data as MovieDetailsResponse["details"];
    const movieDuration = movieData.duration;
    if (!movieDuration) return "";

    const totalMinutes = parseInt(movieDuration.replace(/\D/g, ""), 10) || 0;
    if (totalMinutes <= 0) return "";

    const watchedMinutes = Math.floor(totalMinutes * (progress / 100));
    return `${watchedMinutes} of ${totalMinutes} minutes`;
  };

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
            {data.trailerUrl ? (
              <video
                poster={data.thumbnailUrl || "/images/placeholder.jpg"}
                autoPlay
                muted={isMuted}
                loop
                src={data.trailerUrl}
                className="w-full brightness-[60%] object-cover h-full"
              ></video>
            ) : (
              <Image
                src={data.thumbnailUrl || "/images/placeholder.jpg"}
                alt={data.title}
                fill
                className="w-full brightness-[60%] object-cover h-full"
              />
            )}

            {/* Close Button */}
            <div
              onClick={handleClose}
              className="cursor-pointer absolute top-3 right-3 h-10 w-10 rounded-full bg-black/70 flex items-center justify-center z-10"
            >
              <AiOutlineClose className="text-white w-6" />
            </div>

            <div className="absolute bottom-10 right-10 flex items-center gap-4">
              <button
                onClick={toggleMute}
                className="border-white/60 p-2 rounded-full hover:border-white/80 transition"
              >
                {isMuted ? (
                  <BsVolumeMute size={20} className="text-white" />
                ) : (
                  <BsVolumeUp size={20} className="text-white" />
                )}
              </button>
            </div>

            {/* Movie/Show Title and Action Buttons */}
            <div className="absolute bottom-[10%] left-10">
              <p className="text-white text-3xl md:text-4xl h-full lg:text-5xl font-bold mb-8">
                {data.title}
              </p>
              {/* Progress Info */}
              {watchingRecord && (
                <div className="flex flex-row items-center w-full gap-4">
                  {/* Progress bar on expanded card */}
                  <div className="left-0 right-0 h-1 bg-gray-800 w-1/2">
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${watchingRecord.progress}%` }}
                    />
                  </div>
                  {/* Watch progress information */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/70 text-xs">
                      {formatTime()}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-row gap-4 items-center">
                <button
                  onClick={() =>
                    router.push(`/watch/${data.id}?type=${contentType}`)
                  }
                  className="bg-white text-black rounded-md py-2 px-4 md:py-2 md:px-6 font-bold flex flex-row items-center gap-2"
                >
                  <BsFillPlayFill className="w-6 h-6" />
                  {isAlreadyWatched ? <span>Resume</span> : <span>Play</span>}
                </button>
                <FavouriteButton
                  mediaId={data.id}
                  mediaType={data.isTvShow ? "tv" : "movie"}
                  profileId={currentProfileId || ""}
                  source={
                    (dataSource as "tmdb" | "local" | undefined) || "tmdb"
                  }
                />
                <ReactionsButton
                  mediaId={data.id}
                  mediaType={contentType}
                  profileId={currentProfileId || ""}
                  source={
                    (dataSource as "tmdb" | "local" | undefined) || "tmdb"
                  }
                />
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
                  <span className="text-white/50 font-bold">
                    {data.releaseDate
                      ? new Date(data.releaseDate).getFullYear()
                      : "N/A"}
                  </span>
                  <span className="text-white/70">{durationText}</span>
                  <span className="border border-white/40 text-white/70 text-xs px-1 py-0.5 rounded">
                    HD
                  </span>
                </div>

                <div className="flex items-center mb-6">
                  <span className="text-white/70 text-xs border px-1 py-0.5 border-white/40 mr-3 w-16 h-6 rounded-md">
                    {contentRating}
                  </span>
                  <span className="text-white/70 text-sm">
                    {contentWarning}
                  </span>
                </div>

                <p className="text-white text-xl mb-4">{data.title}</p>
                <p className="text-white text-base mb-2">
                  {data.description || "No description available."}
                </p>
              </div>

              {/* Right Column */}
              <div className="flex flex-col w-1/3">
                <div className="mb-2">
                  <span className="text-white/50 text-sm">Cast: </span>
                  <span className="text-white/70 text-sm">
                    {castMembers.length > 0
                      ? castMembers.slice(0, 3).join(", ")
                      : "Cast information unavailable"}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-white/50 text-sm">Genres: </span>
                  <span className="text-white/70 text-sm">
                    {formattedGenres.join(", ")}
                  </span>
                </div>

                <div>
                  <span className="text-white/50 text-sm">
                    This {isTvShow ? "Show" : "Movie"} Is:{" "}
                  </span>
                  <span className="text-white/70 text-sm">
                    {keywordsList.length > 0
                      ? keywordsList.slice(0, 3).join(", ")
                      : "Exciting"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Section */}
          <div className="px-12 py-6 overflow-y-auto">
            {/* TV Show Episodes Section - Only render for TV shows */}
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
                      {tvData && "seasons" in tvData && tvData.seasons
                        ? tvData.seasons
                            .filter((season) => season.season_number > 0)
                            .map((season) => (
                              <option
                                key={season.id}
                                value={season.season_number}
                              >
                                Season {season.season_number}
                              </option>
                            ))
                        : Array.from(
                            { length: numberOfSeasons },
                            (_, i) => i + 1
                          ).map((season) => (
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
                  {episodes.map((episode, index) => (
                    <div
                      key={episode.id}
                      className="flex gap-4 cursor-pointer hover:bg-zinc-800 p-2 rounded-md"
                    >
                      <div className="flex-shrink-0 text-center text-white/70 w-6">
                        {index + 1}
                      </div>
                      <div className="relative h-24 w-40 flex-shrink-0">
                        <Image
                          src={episode.thumbnail || "/images/placeholder.jpg"}
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
                {similarContent.map((item) => (
                  <SimilarMovieCard key={item.id} data={item} />
                ))}
              </div>
            </div>

            {/* Trailers & More */}
            <div className="mt-8 mb-8">
              <h2 className="text-white text-xl font-bold mb-5">
                Trailers & More
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    title: `${data.title} Trailer`,
                    thumbnailUrl: data.thumbnailUrl,
                  },
                  {
                    id: 2,
                    title: `Behind the Scenes: ${data.title}`,
                    thumbnailUrl: data.thumbnailUrl,
                  },
                ].map((video) => (
                  <div key={video.id} className="relative">
                    <div className="relative h-40 rounded-md overflow-hidden">
                      <Image
                        src={video.thumbnailUrl || "/images/placeholder.jpg"}
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

            {/* About - Different display based on content type */}
            <div className="mt-8">
              <h2 className="text-white text-xl font-bold mb-4">
                About <strong>{data.title}</strong>
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {isTvShow ? (
                  <>
                    <div>
                      <span className="text-white/50 text-sm">Creators: </span>
                      <span className="text-white/70 text-sm">
                        {creators.length > 0
                          ? creators.join(", ")
                          : "Information unavailable"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 text-sm">Cast: </span>
                      <span className="text-white/70 text-sm">
                        {castMembers.length > 0
                          ? castMembers.join(", ")
                          : "Cast information unavailable"}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-white/50 text-sm">Director: </span>
                      <span className="text-white/70 text-sm">
                        {creators.length > 0
                          ? creators.join(", ")
                          : "Information unavailable"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 text-sm">Cast: </span>
                      <span className="text-white/70 text-sm">
                        {castMembers.length > 0
                          ? castMembers.join(", ")
                          : "Cast information unavailable"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 text-sm">Writer: </span>
                      <span className="text-white/70 text-sm">
                        {writers.length > 0
                          ? writers.join(", ")
                          : "Information unavailable"}
                      </span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-white/50 text-sm">Genres: </span>
                  <span className="text-white/70 text-sm">
                    {formattedGenres.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-white/50 text-sm">
                    This {isTvShow ? "Show" : "Movie"} Is:{" "}
                  </span>
                  <span className="text-white/70 text-sm">
                    {keywordsList.length > 0
                      ? keywordsList.join(", ")
                      : "Exciting"}
                  </span>
                </div>
                <div>
                  <span className="text-white/50 text-sm">
                    Maturity Rating:{" "}
                  </span>
                  <div className="inline-flex items-center">
                    <span className="text-white/70 text-xs border px-1 py-0.5 border-white/40 mr-3">
                      {contentRating}
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
