import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useMovieDetails from "@/hooks/useMovieDetails";
import { AiOutlineArrowLeft, AiOutlinePause } from "react-icons/ai";
import { BiFullscreen, BiVolumeFull, BiVolumeMute } from "react-icons/bi";
import { FiPlay } from "react-icons/fi";
import { MdForward10, MdReplay10 } from "react-icons/md";
import { MdSubtitles } from "react-icons/md";
// import { MediaItem } from "@/lib/types/api";

const Watch = () => {
  const router = useRouter();
  const { movieId } = router.query;
  const { data } = useMovieDetails(movieId as string);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use refs for timers to preserve values between renders
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

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

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);

      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }

      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

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

  if (!data) {
    return null;
  }

  return (
    <div
      className="relative h-screen w-screen bg-black"
      id="video-container"
      onMouseMove={handleMouseMove}
    >
      <nav
        className="
          fixed
          w-full
          p-4
          z-10
          flex
          flex-row
          items-center
          gap-8
          bg-black
          bg-opacity-70
        "
      >
        <AiOutlineArrowLeft
          onClick={() => router.push("/")}
          className="text-white cursor-pointer"
          size={40}
        />
        <p className="text-white text-1xl md:text-3xl font-bold">
          <span className="font-light">Watching:</span> {data.title}
          {data.isTvShow && data.numberOfSeasons && (
            <span className="font-light ml-2">
              ({data.numberOfSeasons}{" "}
              {data.numberOfSeasons === 1 ? "Season" : "Seasons"})
            </span>
          )}
        </p>
      </nav>

      {/* Video player */}
      <video
        ref={videoRef}
        autoPlay
        controls
        src={data.videoUrl}
        className="h-full w-full"
        onClick={handlePlayPause}
        aria-label={`Video player for ${data.title}`}
      ></video>

      {/* Overlay with title and description when paused */}
      {showOverlay && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex flex-col items-center justify-center p-8 z-10">
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
            {data.title}
          </h1>
          <p className="text-white text-lg md:text-xl max-w-3xl text-center">
            {data.description}
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
                {data.title}
              </p>
            </div>

            <div className="flex items-center space-x-4">
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
