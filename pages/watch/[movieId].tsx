import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useMovieDetails from "@/hooks/useMovieDetails";
import { AiOutlineArrowLeft, AiOutlinePause } from "react-icons/ai";
import {
  BiFullscreen,
  BiSkipNext,
  BiVolumeFull,
  BiVolumeMute,
  BiX,
} from "react-icons/bi";
import { FiPlay } from "react-icons/fi";
import { MdForward10, MdReplay10 } from "react-icons/md";
import { MdSubtitles } from "react-icons/md";
import { TfiLayersAlt } from "react-icons/tfi";

import Image from "next/image";
import useTvShowDetails from "@/hooks/useTvShowDetails";

const DEFAULT_VIDEO =
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const Watch = () => {
  const router = useRouter();
  const { movieId } = router.query;

  // State to track content type
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");

  // Fetch both movie and TV show data
  const { data: movieDetailsResponse, isLoading: movieLoading } =
    useMovieDetails(contentType === "movie" ? (movieId as string) : "");
  const { data: tvDetailsResponse, isLoading: tvLoading } = useTvShowDetails(
    contentType === "tv" ? (movieId as string) : ""
  );

  // Cast to proper types
  const movieData = movieDetailsResponse?.details;
  const tvData = tvDetailsResponse?.details;

  // Video player ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use refs for timers to preserve values between renders
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Player state
  const [isPaused, setIsPaused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // TV show specific state
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [showEpisodeList, setShowEpisodeList] = useState(false);

  // Determine content type based on data availability
  useEffect(() => {
    // If we have TV data with episodes, it's definitely a TV show
    if (tvData?.seasons && tvData.seasons.length > 0) {
      setContentType("tv");
      return;
    }

    // Check isTvShow flag if available
    if (tvData?.isTvShow === true) {
      setContentType("tv");
      return;
    }

    if (movieData?.isTvShow === false) {
      setContentType("movie");
      return;
    }

    // Fallback based on which data is available
    if (tvData && !tvLoading) {
      setContentType("tv");
    } else if (movieData && !movieLoading) {
      setContentType("movie");
    }
  }, [movieData, tvData, movieLoading, tvLoading]);

  // Handle video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const onPause = () => {
      setIsPaused(true);
      setShowControls(true);

      // Show overlay after 2 seconds of being paused
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }

      overlayTimerRef.current = setTimeout(() => {
        setShowOverlay(true);
      }, 2000);
    };

    const onPlay = () => {
      setIsPaused(false);
      setShowOverlay(false);

      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }

      // Hide controls after 3 seconds of playing
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }

      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    // Check if video has ended
    const onEnded = () => {
      // For TV shows, play next episode if available
      if (contentType === "tv") {
        playNextEpisode();
      } else {
        setIsPaused(true);
        setShowControls(true);
        setShowOverlay(true);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("ended", onEnded);

      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }

      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType]);

  // Determine active data based on content type
  const activeData = contentType === "tv" ? tvData : movieData;

  // Get episodes for the current season
  const getCurrentSeasonEpisodes = () => {
    if (contentType !== "tv" || !tvData) return [];

    // Find the current season
    const season = tvData.seasons?.find(
      (s) => s.season_number === currentSeason
    );

    if (!season || !season.episodes) {
      // Return default episodes if none available
      return Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `Episode ${i + 1}`,
        episodeNumber: i + 1,
        description: "Episode description unavailable",
        thumbnailUrl: tvData.thumbnailUrl,
        duration: "30m",
        videoUrl: DEFAULT_VIDEO,
      }));
    }

    return season.episodes;
  };

  // Get current episode video URL
  const getVideoUrl = () => {
    if (contentType === "movie") {
      return movieData?.videoUrl || DEFAULT_VIDEO;
    } else {
      // For TV shows, use the episode's video URL if available
      const episodes = getCurrentSeasonEpisodes();
      const currentEpisodeData = episodes.find(
        (e) => e.episodeNumber === currentEpisode
      );

      // Use a default URL or determine based on what's available
      return (
        currentEpisodeData?.videoUrl || tvData?.trailerUrl || DEFAULT_VIDEO
      );
    }
  };

  // Get current episode information
  const getCurrentEpisodeInfo = () => {
    if (contentType !== "tv") return null;

    const episodes = getCurrentSeasonEpisodes();
    return episodes.find((e) => e.episodeNumber === currentEpisode);
  };

  // Play next episode function
  const playNextEpisode = () => {
    if (contentType !== "tv") return;

    const episodes = getCurrentSeasonEpisodes();
    const nextEpisodeNumber = currentEpisode + 1;
    const nextEpisode = episodes.find(
      (e) => e.episodeNumber === nextEpisodeNumber
    );

    if (nextEpisode) {
      // Next episode in current season
      setCurrentEpisode(nextEpisodeNumber);
      // Reset video position and play
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else {
      // Check for next season
      const nextSeasonNumber = currentSeason + 1;
      const nextSeason = tvData?.seasons?.find(
        (s) => s.season_number === nextSeasonNumber
      );

      if (nextSeason) {
        setCurrentSeason(nextSeasonNumber);
        setCurrentEpisode(1);
        // Reset video position and play
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      } else {
        // End of series
        setShowOverlay(true);
      }
    }
  };

  // Player Controls
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSkipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += 10;
  };

  const handleSkipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime -= 10;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById("video-container");
    if (!videoContainer) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainer.requestFullscreen();
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    if (!isPaused) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const toggleEpisodeList = () => {
    setShowEpisodeList(!showEpisodeList);

    // Pause video when showing episode list
    if (!showEpisodeList && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  };

  const selectEpisode = (episodeNumber: number) => {
    setCurrentEpisode(episodeNumber);
    setShowEpisodeList(false);

    // Reset video position and play
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // Handle loading states
  const isLoading =
    (contentType === "tv" && tvLoading) ||
    (contentType === "movie" && movieLoading);

  if (!activeData || isLoading) {
    return (
      <div className="relative h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen w-screen bg-black"
      id="video-container"
      onMouseMove={handleMouseMove}
    >
      <nav className="fixed w-full p-4 z-10 flex flex-row items-center gap-8 bg-black bg-opacity-70">
        <AiOutlineArrowLeft
          onClick={() => router.push("/browse")}
          className="text-white cursor-pointer"
          size={40}
          aria-label="Go back to browse"
          title="Go back to browse"
        />

        {contentType === "tv" && (
          <div className="text-white">
            <span className="font-bold">{activeData.title}</span>
            <span className="mx-2">-</span>
            <span>
              S{currentSeason}:E{currentEpisode}
            </span>
            {getCurrentEpisodeInfo()?.name && (
              <span className="ml-2">- {getCurrentEpisodeInfo()?.name}</span>
            )}
          </div>
        )}
      </nav>

      {/* Video player */}
      <video
        ref={videoRef}
        autoPlay
        src={getVideoUrl()}
        className="h-full w-full"
        onClick={handlePlayPause}
        aria-label={`Video player for ${activeData.title}`}
      ></video>

      {/* Episode list modal for TV shows */}
      {contentType === "tv" && showEpisodeList && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 z-20 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-white text-xl font-bold">
              {activeData.title} - Season {currentSeason}
            </h2>
            <button
              onClick={toggleEpisodeList}
              className="text-white"
              aria-label="Close episode list"
            >
              <BiX size={30} />
            </button>
          </div>

          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <h3 className="text-white">Episodes</h3>
            <div className="relative">
              <select
                value={currentSeason}
                onChange={(e) => setCurrentSeason(Number(e.target.value))}
                className="appearance-none bg-zinc-800 text-white pl-4 pr-10 py-2 rounded-md border border-zinc-700 cursor-pointer"
                aria-label="Select season"
              >
                {tvData?.seasons
                  ? tvData.seasons
                      .filter((season) => season.season_number > 0)
                      .map((season) => (
                        <option key={season.id} value={season.season_number}>
                          Season {season.season_number}
                        </option>
                      ))
                  : Array.from(
                      {
                        length:
                          typeof tvData?.numberOfSeasons === "string"
                            ? parseInt(tvData.numberOfSeasons)
                            : tvData?.numberOfSeasons || 1,
                      },
                      (_, i) => i + 1
                    ).map((season) => (
                      <option key={season} value={season}>
                        Season {season}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {getCurrentSeasonEpisodes().map((episode) => (
              <div
                key={episode.id}
                className={`flex gap-4 p-3 hover:bg-zinc-800 rounded-md mb-2 cursor-pointer ${
                  episode.episodeNumber === currentEpisode ? "bg-zinc-700" : ""
                }`}
                onClick={() => selectEpisode(episode.episodeNumber)}
              >
                <div className="flex-shrink-0 text-center text-white/70 w-6">
                  {episode.episodeNumber}
                </div>
                <div className="relative h-24 w-40 flex-shrink-0">
                  <Image
                    src={
                      episode.thumbnailUrl ||
                      activeData.thumbnailUrl ||
                      "/images/placeholder.jpg"
                    }
                    alt={episode.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                    <FiPlay className="text-white w-12 h-12" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-white font-medium">{episode.name}</h3>
                    <span className="text-white/70 text-sm">
                      {episode.duration}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">{episode.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlay with title and description when paused */}
      {showOverlay && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex flex-col items-center justify-center p-8 z-10">
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
            {activeData.title}
          </h1>
          {contentType === "tv" && getCurrentEpisodeInfo() && (
            <h2 className="text-white text-2xl md:text-3xl mb-4">
              S{currentSeason}:E{currentEpisode} -{" "}
              {getCurrentEpisodeInfo()?.name}
            </h2>
          )}
          <p className="text-white text-lg md:text-xl max-w-3xl text-center">
            {contentType === "tv" && getCurrentEpisodeInfo()
              ? getCurrentEpisodeInfo()?.description
              : activeData.description}
          </p>
          <p className="text-white uppercase mt-4">paused</p>
        </div>
      )}

      {/* Custom controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
          {/* Progress bar */}
          <div className="flex items-center mb-2">
            <p className="text-white mr-2 text-sm">
              {formatTime(videoRef.current?.currentTime || 0)}
            </p>
            <label htmlFor="progress-slider" className="sr-only">
              Video progress slider
            </label>
            <input
              id="progress-slider"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
              title={`Progress: ${Math.round(progress)}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-label="Video progress"
              style={{
                background: `linear-gradient(to right, #e50914 ${progress}%, rgba(255, 255, 255, 0.3) ${progress}%)`,
                height: "6px",
                borderRadius: "3px",
                outline: "none",
                WebkitAppearance: "none",
              }}
            />
            <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: #e50914;
                cursor: pointer;
              }
              input[type="range"]::-moz-range-thumb {
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: #e50914;
                cursor: pointer;
                border: none;
              }
              input[type="range"]::-ms-thumb {
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: #e50914;
                cursor: pointer;
              }
            `}</style>
            <p className="text-white ml-2 text-sm">{formatTime(duration)}</p>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="text-white"
                aria-label={isPaused ? "Play" : "Pause"}
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? <FiPlay size={28} /> : <AiOutlinePause size={28} />}
              </button>
              <button
                onClick={handleSkipBackward}
                className="text-white"
                aria-label="Rewind 10 seconds"
                title="Rewind 10 seconds"
              >
                <MdReplay10 size={28} />
              </button>
              <button
                onClick={handleSkipForward}
                className="text-white"
                aria-label="Forward 10 seconds"
                title="Forward 10 seconds"
              >
                <MdForward10 size={28} />
              </button>
              <div
                className="relative flex items-center ml-2"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  className="text-white"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <BiVolumeMute size={24} />
                  ) : (
                    <BiVolumeFull size={24} />
                  )}
                </button>
                {showVolumeSlider && (
                  <div className="absolute bottom-8 left-0 bg-black/70 p-2 rounded">
                    <label htmlFor="volume-slider" className="sr-only">
                      Volume slider
                    </label>
                    <input
                      id="volume-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 rotate-270"
                      title={`Volume: ${Math.round(
                        (isMuted ? 0 : volume) * 100
                      )}%`}
                      aria-valuemin={0}
                      aria-valuemax={1}
                      aria-valuenow={isMuted ? 0 : volume}
                      aria-label="Volume control"
                      style={{
                        background: `linear-gradient(to right, #e50914 ${
                          (isMuted ? 0 : volume) * 100
                        }%, rgba(255, 255, 255, 0.3) ${
                          (isMuted ? 0 : volume) * 100
                        }%)`,
                        height: "4px",
                        borderRadius: "2px",
                        WebkitAppearance: "none",
                      }}
                    />
                    <style jsx>{`
                      input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: #e50914;
                        cursor: pointer;
                      }
                      input[type="range"]::-moz-range-thumb {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: #e50914;
                        cursor: pointer;
                        border: none;
                      }
                      input[type="range"]::-ms-thumb {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: #e50914;
                        cursor: pointer;
                      }
                    `}</style>
                  </div>
                )}
              </div>
            </div>

            {/* Title in the middle */}
            <div className="flex-1 text-center">
              <p className="text-white font-medium truncate mx-4">
                {contentType === "tv" && getCurrentEpisodeInfo()
                  ? `${
                      activeData.title
                    } - S${currentSeason}:E${currentEpisode} ${
                      getCurrentEpisodeInfo()?.name
                    }`
                  : activeData.title}
              </p>
            </div>

            <div className="flex items-center space-x-4 gap-4">
              {contentType === "tv" && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="text-white"
                    aria-label="Next Episode"
                    title="Next"
                    onClick={playNextEpisode}
                  >
                    <BiSkipNext size={45} />
                  </button>
                  <button
                    type="button"
                    className="text-white"
                    aria-label="Episode List"
                    title="Episode List"
                    onClick={toggleEpisodeList}
                  >
                    <TfiLayersAlt size={25} />
                  </button>
                </div>
              )}

              <button
                type="button"
                className="text-white"
                aria-label="Subtitles"
                title="Subtitles"
              >
                <MdSubtitles size={24} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white"
                aria-label="Toggle fullscreen"
                title="Toggle fullscreen"
              >
                <BiFullscreen size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watch;
