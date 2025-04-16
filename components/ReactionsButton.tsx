import React, { useState } from "react";
import {
  BsHandThumbsUp,
  BsHandThumbsDownFill,
  BsHandThumbsUpFill,
} from "react-icons/bs";
import { AiFillHeart } from "react-icons/ai";

const ReactionsButton = () => {
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
  );
};

export default ReactionsButton;
