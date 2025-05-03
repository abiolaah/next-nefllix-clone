import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
import { useRouter } from "next/router";

import useMovieDetails from "@/hooks/useMovieDetails";
import useTvShowDetails from "@/hooks/useTvShowDetails";
import useProfile from "@/hooks/useProfile";
import useWatching from "@/hooks/useWatching";
import axios from "axios";

const DEFAULT_VIDEOS = [
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
];

// Define interface for the watching data to fix TypeScript error
interface WatchingData {
  mediaId: string | string[];
  profileId: string;
  mediaType: string;
  progress: number;
  completed: boolean;
  source: string;
  currentSeason?: number;
  currentEpisode?: number;
}

const Watch = () => {
  const router = useRouter();
  const { mediaId, type } = router.query;

  // Track content type retrived from the URL
  const contentType = type === "tv" ? "tv" : "movie";

  // Fetch both movie and TV show data
  const { data: movieDetailsResponse, isLoading: movieLoading } =
    useMovieDetails(contentType === "movie" ? (mediaId as string) : "");
  const { data: tvDetailsResponse, isLoading: tvLoading } = useTvShowDetails(
    contentType === "tv" ? (mediaId as string) : ""
  );

  // Get user data to determine which profile is active
  const { currentProfileId: profileId } = useProfile();

  // Fetch existing watching data for this media if available
  const { data: watchingData, mutate: mutateWatching } = useWatching({
    profileId: profileId || "",
    completed: undefined,
    mediaId: mediaId as string,
  });

  // get watching progress
  const watchingRecord = watchingData?.[0];

  // Cast to proper types
  const movieData = movieDetailsResponse?.details;
  const tvData = tvDetailsResponse?.details;

  const movieSource = movieDetailsResponse?.source || "tmdb";
  const tvSource = tvDetailsResponse?.source || "tmdb";

  const dataSource = contentType === "movie" ? movieSource : tvSource;

  // Use refs for timers to preserve values between renders
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs for timers to preserve values between renders for saved progress
  const saveProgressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressSaveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Flag to track if at least 25% of the video has been watched
  const hasWatchedQuarterRef = useRef<boolean>(false);

  // Flag to prevent duplicate API calls when closing/navigating
  const isSavingProgressRef = useRef<boolean>(false);

  // Video player ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // State that triggers re-renders
  const [playerState, setPlayerState] = useState({
    isPaused: false,
    showOverlay: false,
    progress: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    showControls: true,
    showVolumeSlider: false,
    isVideoLoading: true,
    videoError: false,
    usingFallbackVideo: false,
    currentFallbackVideoIndex: 0,
  });

  const [tvShowState, setTvShowState] = useState({
    currentSeason: 1,
    currentEpisode: 1,
    showEpisodeList: false,
  });

  // Helper to update player state without overwriting other properties
  const updatePlayerState = useCallback(
    (newState: Partial<typeof playerState>) => {
      setPlayerState((prev) => ({ ...prev, ...newState }));
    },
    []
  );

  // Helper to update TV show state
  const updateTvShowState = useCallback(
    (newState: Partial<typeof tvShowState>) => {
      setTvShowState((prev) => ({ ...prev, ...newState }));
    },
    []
  );

  // Helper function to validte URLs
  const isValidUrl = useCallback((url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Function to save watching progress to database
  const saveProgress = useCallback(
    async (forceSave = false) => {
      // If already in the process of saving or missing required data, skip
      if (isSavingProgressRef.current || !profileId || !mediaId) return;

      // Clear any existing debounce timer if this is a forced save
      if (forceSave && progressSaveDebounceRef.current) {
        clearTimeout(progressSaveDebounceRef.current);
        progressSaveDebounceRef.current = null;
      }

      // Set up debounce unless it's a force save
      if (!forceSave) {
        if (progressSaveDebounceRef.current) {
          clearTimeout(progressSaveDebounceRef.current);
        }

        progressSaveDebounceRef.current = setTimeout(async () => {
          await performSave();
          progressSaveDebounceRef.current = null;
        }, 2000); // 2 second debounce

        return;
      }

      await performSave();

      async function performSave() {
        try {
          isSavingProgressRef.current = true;

          const video = videoRef.current;
          if (!video) return;

          const currentProgress = (video.currentTime / video.duration) * 100;

          // Check if completed
          const completed = currentProgress >= 98;

          // Only save if watched at least 25% or completed or force save
          const shouldSave =
            hasWatchedQuarterRef.current || completed || forceSave;

          if (shouldSave) {
            // Ensure mediaId and profileId are strings before using them
            if (typeof mediaId !== "string" || !profileId) {
              console.error("Invalid mediaId or profileId");
              return;
            }
            const watchingData: WatchingData = {
              mediaId,
              profileId,
              mediaType: contentType,
              progress: Math.min(Math.round(currentProgress), 100),
              completed,
              source: dataSource,
            };

            // Add season and episode for TV Shows
            if (contentType === "tv") {
              watchingData["currentSeason"] = tvShowState.currentSeason;
              watchingData["currentEpisode"] = tvShowState.currentEpisode;
            }

            await axios.post("/api/watching", watchingData);

            // Refresh watching data
            mutateWatching();
          }
        } catch (error) {
          console.error("Error saving watching progress:", error);
        } finally {
          isSavingProgressRef.current = false;
        }
      }
    },
    [
      contentType,
      mediaId,
      profileId,
      tvShowState.currentSeason,
      tvShowState.currentEpisode,
      dataSource,
      mutateWatching,
    ]
  );

  // Get episodes for the current season
  const getCurrentSeasonEpisodes = useCallback(() => {
    if (contentType !== "tv" || !tvData) return [];

    // Find the current season
    const season = tvData.seasons?.find(
      (s) => s.season_number === tvShowState.currentSeason
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
        videoUrl: DEFAULT_VIDEOS[0],
      }));
    }

    return season.episodes;
  }, [contentType, tvShowState.currentSeason, tvData]);

  // Get current episode video URL
  const getVideoUrl = useMemo(() => {
    let primaryUrl = "";

    if (contentType === "movie") {
      primaryUrl = movieData?.videoUrl || "";
    } else {
      const episodes = getCurrentSeasonEpisodes();
      const currentEpisodeData = episodes.find(
        (e) => e.episodeNumber === tvShowState.currentEpisode
      );
      primaryUrl = currentEpisodeData?.videoUrl || tvData?.trailerUrl || "";
    }

    if (primaryUrl && isValidUrl(primaryUrl)) {
      return primaryUrl;
    }

    return DEFAULT_VIDEOS[
      playerState.currentFallbackVideoIndex % DEFAULT_VIDEOS.length
    ];
  }, [
    contentType,
    isValidUrl,
    playerState.currentFallbackVideoIndex,
    movieData?.videoUrl,
    getCurrentSeasonEpisodes,
    tvData?.trailerUrl,
    tvShowState.currentEpisode,
  ]);

  // Update usingFallbackVideo state when videoUrl changes, but not during render
  useEffect(() => {
    const primaryUrl =
      contentType === "movie"
        ? movieData?.videoUrl || ""
        : getCurrentSeasonEpisodes().find(
            (e) => e.episodeNumber === tvShowState.currentEpisode
          )?.videoUrl ||
          tvData?.trailerUrl ||
          "";

    const needsFallback = !primaryUrl || !isValidUrl(primaryUrl);

    if (needsFallback != playerState.usingFallbackVideo) {
      updatePlayerState({ usingFallbackVideo: needsFallback });
    }
  }, [
    getVideoUrl,
    contentType,
    movieData?.videoUrl,
    tvData?.trailerUrl,
    getCurrentSeasonEpisodes,
    tvShowState.currentEpisode,
    playerState.usingFallbackVideo,
    isValidUrl,
    updatePlayerState,
  ]);

  // Effect to restore playback position if returning to a previously watched media
  useEffect(() => {
    if (videoRef.current && watchingRecord && !hasWatchedQuarterRef.current) {
      // Only set if the video is loaded and has duration
      if (videoRef.current.duration > 0 && (watchingRecord.progress || 0) > 0) {
        const targetTime =
          ((watchingRecord.progress || 0) / 100) * videoRef.current.duration;

        //Set the video to the saved position
        videoRef.current.currentTime = targetTime;

        // If they watched more that 25%, set the flag
        if ((watchingRecord.progress || 0) >= 25) {
          hasWatchedQuarterRef.current = true;
        }

        // Update progress state
        updatePlayerState({ progress: watchingRecord.progress });
      }
    }

    // Set the TV show state from watching record if available
    if (
      contentType === "tv" &&
      watchingRecord &&
      watchingRecord.currentSeason &&
      watchingRecord.currentEpisode
    ) {
      updateTvShowState({
        currentSeason: watchingRecord.currentSeason,
        currentEpisode: watchingRecord.currentEpisode,
      });
    }
  }, [watchingRecord, contentType, updatePlayerState, updateTvShowState]);

  // Set up periodic progress saving (every 30 seconds)
  useEffect(() => {
    if (profileId && mediaId) {
      saveProgressTimerRef.current = setInterval(() => {
        saveProgress();
      }, 30000);
    }

    return () => {
      if (saveProgressTimerRef.current) {
        clearInterval(saveProgressTimerRef.current);
      }
      if (progressSaveDebounceRef.current) {
        clearTimeout(progressSaveDebounceRef.current);
      }
    };
  }, [profileId, mediaId, saveProgress]);

  // Save Progress when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress(true);
    };

    // Save progress when navigating away
    const handleRouteChange = () => {
      saveProgress(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [saveProgress, router]);

  // Play next episode function
  const playNextEpisode = useCallback(() => {
    if (contentType !== "tv") return;

    const episodes = getCurrentSeasonEpisodes();
    const nextEpisodeNumber = tvShowState.currentEpisode + 1;
    const nextEpisode = episodes.find(
      (e) => e.episodeNumber === nextEpisodeNumber
    );

    if (nextEpisode) {
      // Save progress with completed=true for current episode before moving to next
      saveProgress(true);

      // Next episode in current season
      updateTvShowState({ currentEpisode: nextEpisodeNumber });
      // Reset video position and play
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }

      // Reset tracking for new episode
      hasWatchedQuarterRef.current = false;
    } else {
      // Check for next season
      const nextSeasonNumber = tvShowState.currentSeason + 1;
      const nextSeason = tvData?.seasons?.find(
        (s) => s.season_number === nextSeasonNumber
      );

      if (nextSeason) {
        // Save progress with completd=true for current episode before moving to next
        saveProgress(true);

        updateTvShowState({
          currentSeason: nextSeasonNumber,
          currentEpisode: 1,
        });

        // Reset video position and play
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }

        // Reset tracking for new episode
        hasWatchedQuarterRef.current = false;
      } else {
        // End of series
        updatePlayerState({ showOverlay: true });
        saveProgress(true);
      }
    }
  }, [
    contentType,
    getCurrentSeasonEpisodes,
    tvData?.seasons,
    tvShowState.currentEpisode,
    tvShowState.currentSeason,
    updatePlayerState,
    updateTvShowState,
    saveProgress,
  ]);

  // Handle video error
  const handleVideoError = useCallback(() => {
    updatePlayerState({ videoError: true, isVideoLoading: true });

    if (!playerState.usingFallbackVideo) {
      // Try switching to fallback videos
      updatePlayerState({ usingFallbackVideo: true });
      if (videoRef.current) {
        videoRef.current.src =
          DEFAULT_VIDEOS[
            playerState.currentFallbackVideoIndex % DEFAULT_VIDEOS.length
          ];
        videoRef.current.load();
        videoRef.current
          .play()
          .catch((e) => console.error("Error playing fallback video:", e));
      }
    } else {
      // Cycle to next fallback video
      const nextIndex =
        (playerState.currentFallbackVideoIndex + 1) % DEFAULT_VIDEOS.length;
      updatePlayerState({ currentFallbackVideoIndex: nextIndex });
      if (videoRef.current) {
        videoRef.current.src = DEFAULT_VIDEOS[nextIndex];
        videoRef.current.load();
        videoRef.current
          .play()
          .catch((e) => console.error("Error playing next fallback video:", e));
      }
    }
  }, [
    updatePlayerState,
    playerState.usingFallbackVideo,
    playerState.currentFallbackVideoIndex,
  ]);

  // Handle loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      updatePlayerState({
        duration: videoRef.current.duration,
        isVideoLoading: false,
        videoError: false,
      });
    }
  }, [updatePlayerState]);

  // Handle video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration || 1;
        const progress = (currentTime / duration) * 100;
        updatePlayerState({ progress });

        // Check if we've reached 25% of the video
        if (progress >= 25 && !hasWatchedQuarterRef.current) {
          hasWatchedQuarterRef.current = true;
        }
      }
    };

    const onPause = () => {
      updatePlayerState({ isPaused: true, showControls: true });

      // Show overlay after 2 seconds of being paused
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }

      overlayTimerRef.current = setTimeout(() => {
        updatePlayerState({ showOverlay: true });
      }, 2000);
    };

    const onPlay = () => {
      updatePlayerState({
        isPaused: false,
        showOverlay: false,
        isVideoLoading: false,
      });

      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }

      // Hide controls after 3 seconds of playing
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }

      controlsTimerRef.current = setTimeout(() => {
        updatePlayerState({ showControls: false });
      }, 3000);
    };

    // Check if video has ended
    const onEnded = () => {
      // Save progress as 100% and completed when vidoe ends
      if (videoRef.current) {
        videoRef.current.currentTime = videoRef.current.duration;
      }

      saveProgress(true);

      if (playerState.usingFallbackVideo) {
        const nextIndex =
          (playerState.currentFallbackVideoIndex + 1) % DEFAULT_VIDEOS.length;
        updatePlayerState({ currentFallbackVideoIndex: nextIndex });
        if (videoRef.current) {
          videoRef.current.src = DEFAULT_VIDEOS[nextIndex];
          videoRef.current.play();
        }
      } else if (contentType === "tv") {
        playNextEpisode();
      } else {
        updatePlayerState({
          isPaused: true,
          showControls: true,
          showOverlay: true,
        });
      }
    };

    const onWaiting = () => {
      updatePlayerState({ isVideoLoading: true });
    };

    const onPlaying = () => {
      updatePlayerState({ isVideoLoading: false });
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", handleVideoError);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", handleVideoError);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);

      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }

      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [
    contentType,
    handleLoadedMetadata,
    handleVideoError,
    playNextEpisode,
    playerState.usingFallbackVideo,
    playerState.currentFallbackVideoIndex,
    updatePlayerState,
    saveProgress,
  ]);

  // Determine active data based on content type
  const activeData = useMemo(
    () => (contentType === "tv" ? tvData : movieData),
    [contentType, tvData, movieData]
  );

  // Get current episode information
  const getCurrentEpisodeInfo = () => {
    if (contentType !== "tv") return null;

    const episodes = getCurrentSeasonEpisodes();
    return episodes.find((e) => e.episodeNumber === tvShowState.currentEpisode);
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
    updatePlayerState({ volume: newVolume });
    video.volume = newVolume;
    updatePlayerState({ isMuted: newVolume === 0 });
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playerState.isMuted) {
      video.volume = playerState.volume || 1;
      updatePlayerState({ isMuted: false });
    } else {
      video.volume = 0;
      updatePlayerState({ isMuted: true });
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
    updatePlayerState({ progress: parseFloat(e.target.value) });
  };

  const formatTime = (time: number | string) => {
    let totalSeconds: number;

    // Handle string input
    if (typeof time === "string") {
      const minutes = parseInt(time.replace(/\D/g, "")) || 0;
      totalSeconds = minutes * 60;
    } else {
      totalSeconds = time;
    }

    if (isNaN(totalSeconds)) return "00:00";

    const hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);

    // Format with hours if duration is 60 minutes or more
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    // Format without hours for durations less than 60 minutes
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    updatePlayerState({ showControls: true });

    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    if (!playerState.isPaused) {
      controlsTimerRef.current = setTimeout(() => {
        updatePlayerState({ showControls: false });
      }, 3000);
    }
  };

  const toggleEpisodeList = () => {
    updateTvShowState({ showEpisodeList: !tvShowState.showEpisodeList });

    // Pause video when showing episode list
    if (
      !tvShowState.showEpisodeList &&
      videoRef.current &&
      !videoRef.current.paused
    ) {
      videoRef.current.pause();
    }
  };

  const selectEpisode = (episodeNumber: number) => {
    // Save progress for current episode before switching
    saveProgress(true);

    updateTvShowState({
      currentEpisode: episodeNumber,
      showEpisodeList: false,
    });

    // Reset video position and play
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }

    // Reset tracking for new episode
    hasWatchedQuarterRef.current = false;
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
              S{tvShowState.currentSeason}:E{tvShowState.currentEpisode}
            </span>
            {getCurrentEpisodeInfo()?.name && (
              <span className="ml-2">- {getCurrentEpisodeInfo()?.name}</span>
            )}
          </div>
        )}
      </nav>

      {/* Loading Overlay */}
      {playerState.isVideoLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/70">
          <div className="text-white text-xl">Loading Video...</div>
        </div>
      )}

      {/* Error message */}
      {playerState.videoError && playerState.usingFallbackVideo && (
        <div className="absolute bott0m-20 left-0 p-2 bg-black/50 text-white text-xs z-20">
          Playing fallback content
        </div>
      )}

      {/* Video player */}
      <video
        ref={videoRef}
        autoPlay
        src={getVideoUrl}
        className="h-full w-full"
        onClick={handlePlayPause}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleVideoError}
        aria-label={`Video player for ${activeData.title} || 'Media`}
      ></video>

      {/* Episode list modal for TV shows */}
      {contentType === "tv" && tvShowState.showEpisodeList && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/80 z-20 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-white text-xl font-bold">
              {activeData.title} - Season {tvShowState.currentSeason}
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
                value={tvShowState.currentSeason}
                onChange={(e) =>
                  updateTvShowState({ currentSeason: Number(e.target.value) })
                }
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
                  episode.episodeNumber === tvShowState.currentEpisode
                    ? "bg-zinc-700"
                    : ""
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
      {playerState.showOverlay && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex flex-col items-center justify-center p-8 z-10">
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
            {activeData.title}
          </h1>
          {contentType === "tv" && getCurrentEpisodeInfo() && (
            <h2 className="text-white text-2xl md:text-3xl mb-4">
              S{tvShowState.currentSeason}:E{tvShowState.currentEpisode} -{" "}
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
      {playerState.showControls && (
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
              value={playerState.progress}
              onChange={handleProgressChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
              title={`Progress: ${Math.round(playerState.progress)}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(playerState.progress)}
              aria-label="Video progress"
              style={{
                background: `linear-gradient(to right, #e50914 ${playerState.progress}%, rgba(255, 255, 255, 0.3) ${playerState.progress}%)`,
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
            <p className="text-white ml-2 text-sm">
              {formatTime(playerState.duration)}
            </p>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="text-white"
                aria-label={playerState.isPaused ? "Play" : "Pause"}
                title={playerState.isPaused ? "Play" : "Pause"}
              >
                {playerState.isPaused ? (
                  <FiPlay size={28} />
                ) : (
                  <AiOutlinePause size={28} />
                )}
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
                onMouseEnter={() =>
                  updatePlayerState({ showVolumeSlider: true })
                }
                onMouseLeave={() =>
                  updatePlayerState({ showVolumeSlider: false })
                }
              >
                <button
                  onClick={toggleMute}
                  className="text-white"
                  aria-label={playerState.isMuted ? "Unmute" : "Mute"}
                  title={playerState.isMuted ? "Unmute" : "Mute"}
                >
                  {playerState.isMuted ? (
                    <BiVolumeMute size={24} />
                  ) : (
                    <BiVolumeFull size={24} />
                  )}
                </button>
                {playerState.showVolumeSlider && (
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
                      value={playerState.isMuted ? 0 : playerState.volume}
                      onChange={handleVolumeChange}
                      className="w-20 rotate-270"
                      title={`Volume: ${Math.round(
                        (playerState.isMuted ? 0 : playerState.volume) * 100
                      )}%`}
                      aria-valuemin={0}
                      aria-valuemax={1}
                      aria-valuenow={
                        playerState.isMuted ? 0 : playerState.volume
                      }
                      aria-label="Volume control"
                      style={{
                        background: `linear-gradient(to right, #e50914 ${
                          (playerState.isMuted ? 0 : playerState.volume) * 100
                        }%, rgba(255, 255, 255, 0.3) ${
                          (playerState.isMuted ? 0 : playerState.volume) * 100
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
                  ? `${activeData.title} - S${tvShowState.currentSeason}:E${
                      tvShowState.currentEpisode
                    } ${getCurrentEpisodeInfo()?.name}`
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
