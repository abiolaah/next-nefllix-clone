import React, { useCallback, useEffect, useState } from "react";

import { AiOutlineInfoCircle } from "react-icons/ai";
import { BsVolumeMute, BsVolumeUp } from "react-icons/bs";
import PlayButton from "./PlayButton";

import useBillboard from "@/hooks/useBillboard";
import useInfoModal from "@/hooks/useInfoModal";

const Billboard = () => {
  const { data, isLoading } = useBillboard();
  const [isMounted, setIsMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const { openModal } = useInfoModal();

  const handleOpenModal = useCallback(() => {
    openModal(data?.id, "movie");
  }, [openModal, data?.id]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading || !isMounted || !data) {
    return <div className="relative h-[56.25vw] bg-black"></div>;
  }

  const contentRating = data.isTvShow
    ? data.isAdult
      ? "TV-MA"
      : "TV-14"
    : data.isAdult
    ? "R"
    : "PG-13";

  return (
    <div className="relative h-[56.25vw]">
      <video
        className="w-full h-[56.25vw] object-cover brightness-[60%]"
        autoPlay
        muted={isMuted}
        loop
        poster={data.thumbnailUrl}
        src={data.trailerUrl}
      ></video>
      <div className="absolute top-[30%] md:top-[40%] ml-4 md:ml-16">
        <p className="text-white text-xl md:text-5xl h-full w-[50%] lg:text-6xl font-bold drop-shadow-xl">
          {data.title}
        </p>
        <p className="text-white text-[8px] md:text-lg mt-3 md:mt-8 w-[90%] md:w-[80%] lg:w-[50%] drop-shadow-xl">
          {data.description}
        </p>
        <div className="flex flex-row items-center mt-3 md:mt-4 gap-3">
          <PlayButton movieId={data?.id} />
          <button
            type="button"
            onClick={handleOpenModal}
            className="bg-white/30 text-white rounded-md py-1 md:py-2 px-2 md:px-4 w-auto text-sm lg:text-lg font-semibold flex flex-row items-center hover:bg-white/20 transition"
          >
            <AiOutlineInfoCircle className="mr-1" />
            More Info
          </button>
        </div>
      </div>
      {/* Volume Control and content ratimg */}
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

        <span className="text-white bg-white/60 px-2 py-1 rounded text-sm font-semibold">
          {contentRating}
        </span>
      </div>
    </div>
  );
};

export default Billboard;
