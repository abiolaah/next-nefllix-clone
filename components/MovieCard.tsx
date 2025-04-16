import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { BsFillPlayFill } from "react-icons/bs";
import FavouriteButton from "./FavouriteButton";
import {
  BsHandThumbsUp,
  BsHandThumbsDownFill,
  BsHandThumbsUpFill,
} from "react-icons/bs";
import { AiFillHeart } from "react-icons/ai";

interface MovieData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string;
  rating: number | null;
  duration: string;
}

interface MovieCardProps {
  data: MovieData;
}

const MovieCard: React.FC<MovieCardProps> = ({ data }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setLiked] = useState(false);
  const [isDisliked, setDisliked] = useState(false);
  const [isLoved, setLoved] = useState(false);

  const handleReactionHover = (hoverState: boolean) => {
    setIsHovered(hoverState);
  };

  const handleLikeButton = () => {
    setLiked(!isLiked);
    setDisliked(false);
    setLoved(false);
    setIsHovered(false); // Close the reaction menu after selection
  };

  const handleDislikeButton = () => {
    setDisliked(!isDisliked);
    setLiked(false);
    setLoved(false);
    setIsHovered(false); // Close the reaction menu after selection
  };

  const handleLoveButton = () => {
    setLoved(!isLoved);
    setDisliked(false);
    setLiked(false);
    setIsHovered(false); // Close the reaction menu after selection
  };

  return (
    <div className="group bg-zinc-900 col-span relative h-[12vw]">
      <Image
        src={data.thumbnailUrl}
        alt="Thumbnail"
        width={200}
        height={300}
        className="cursor-pointer object-cover transition duration shadow-xl rounded-md group-hover:opacity-90 sm:group-hover:opacity-0 delay-300 w-full h-[12vw]"
      />
      <div className="opacity-0 absolute top-0 transition duration-200 z-10 invisible sm:visible delay-300 w-full scale-0 group-hover:scale-110 group-hover:-translate-y-[6vw] group-hover:translate-x-[2vw] group-hover:opacity-100">
        <Image
          src={data.thumbnailUrl}
          alt="Thumbnail"
          width={200}
          height={300}
          className="cursor-pointer object-cover transition duration shadow-xl rounded-t-md w-full h-[12vw]"
        />
        <div className="z-10 bg-zinc-800 p-2 lg:p-4 w-full transition shadow-md rounded-b-md">
          <div className="flex flex-row items-center gap-3">
            <div
              onClick={() => router.push(`/watch/${data?.id}`)}
              className="cursor-pointer w-6 h-6 lg:w-10 lg:h-10 bg-white rounded-full flex justify-center items-center transition hover:bg-neutral-300"
            >
              <BsFillPlayFill size={30} />
            </div>
            <FavouriteButton movieId={data?.id} />

            {/* Reactions Container */}
            <div className="relative">
              <div
                onMouseEnter={() => handleReactionHover(true)}
                className="cursor-pointer rounded-lg"
              >
                {isLiked ? (
                  <BsHandThumbsUpFill
                    className={isLiked ? "text-blue-400" : "text-white"}
                    size={30}
                  />
                ) : isDisliked ? (
                  <BsHandThumbsDownFill
                    className={isDisliked ? "text-red-400" : "text-white"}
                    size={30}
                  />
                ) : isLoved ? (
                  <AiFillHeart
                    className={isLoved ? "text-pink-400" : "text-white"}
                    size={30}
                  />
                ) : (
                  <BsHandThumbsUp className="text-white" size={30} />
                )}
              </div>

              {/* Reaction Options */}
              {isHovered && (
                <div
                  className="absolute bottom-full left-0 mb-2 bg-zinc-700 p-2 rounded-md shadow-lg flex gap-2"
                  onMouseEnter={() => handleReactionHover(true)}
                  onMouseLeave={() => handleReactionHover(false)}
                >
                  <div
                    className="cursor-pointer hover:scale-110 transition-transform"
                    onClick={handleLikeButton}
                    title="Like"
                  >
                    <BsHandThumbsUpFill
                      className={isLiked ? "text-blue-400" : "text-white"}
                      size={25}
                    />
                  </div>
                  <div
                    className="cursor-pointer hover:scale-110 transition-transform"
                    onClick={handleDislikeButton}
                    title="Dislike"
                  >
                    <BsHandThumbsDownFill
                      className={isDisliked ? "text-red-400" : "text-white"}
                      size={25}
                    />
                  </div>
                  <div
                    className="cursor-pointer hover:scale-110 transition-transform"
                    onClick={handleLoveButton}
                    title="Love"
                  >
                    <AiFillHeart
                      className={isLoved ? "text-pink-400" : "text-white"}
                      size={25}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-green-400 font-semibold mt-4">
            New <span className="text-white">2025</span>
          </p>

          <div className="flex flex-row mt-4 gap-2 items-center">
            <p className="text-white text-[10px] lg:text-sm">{data.duration}</p>
          </div>

          <div className="flex flex-row mt-4 gap-2 items-center">
            <p className="text-white text-[10px] lg:text-sm">{data.genre}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
