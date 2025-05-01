import React, { useEffect, useState } from "react";
import {
  BsHandThumbsUp,
  BsHandThumbsDown,
  BsHandThumbsDownFill,
  BsHandThumbsUpFill,
} from "react-icons/bs";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import axios from "axios";
import useReactions from "@/hooks/useReactions";

interface ReactionsButtonProps {
  mediaId: string | number;
  mediaType: "movie" | "tv";
  profileId: string;
  source?: "local" | "tmdb";
}

const ReactionsButton: React.FC<ReactionsButtonProps> = ({
  mediaId,
  mediaType,
  profileId,
  source = "tmdb",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setLiked] = useState(false);
  const [isDisliked, setDisliked] = useState(false);
  const [isLoved, setLoved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get all user reactions
  const { data: reactions, mutate } = useReactions(profileId);

  useEffect(() => {
    if (reactions && reactions.length > 0) {
      // FInd the reaction of this specific media item
      const existiongReaction = reactions.find((item) => item.id === mediaId);

      if (existiongReaction) {
        setLiked(existiongReaction.reactionType === "liked");
        setDisliked(existiongReaction.reactionType === "disliked");
        setLoved(existiongReaction.reactionType === "loved");
      } else {
        setLiked(false);
        setDisliked(false);
        setLoved(false);
      }
    }
  }, [reactions, mediaId]);

  const handleReactionHover = (hoverState: boolean) => {
    setIsHovered(hoverState);
  };

  const submitReaction = async (
    reactionType: "liked" | "disliked" | "loved"
  ) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // If the reaction is already set and the user clicks the same reaction again, delete it
      if (
        (reactionType === "liked" && isLiked) ||
        (reactionType === "disliked" && isDisliked) ||
        (reactionType === "loved" && isLoved)
      ) {
        await axios.delete(`/api/reaction`, {
          data: {
            mediaId,
            profileId,
          },
        });

        // Reset all state
        setLiked(false);
        setDisliked(false);
        setLoved(false);
      } else {
        // Otherwise create/update the reaction
        await axios.post(`/api/reaction`, {
          mediaId,
          profileId,
          mediaType,
          reactionType,
          source,
        });

        // Set the appropriate reaction state
        setLiked(reactionType === "liked");
        setDisliked(reactionType === "disliked");
        setLoved(reactionType === "loved");
      }

      // Update the cached data
      await mutate();
    } catch (error) {
      console.error("Error submitting reaction:", error);
    } finally {
      setIsLoading(false);
      setIsHovered(false); // Close the reaction menu after selection
    }
  };

  const handleLikeButton = () => {
    submitReaction("liked");
  };

  const handleDislikeButton = () => {
    submitReaction("disliked");
  };

  const handleLoveButton = () => {
    submitReaction("loved");
  };

  return (
    <div className="relative">
      <div
        onMouseEnter={() => handleReactionHover(true)}
        onMouseLeave={() => handleReactionHover(false)}
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
            {isLiked ? (
              <BsHandThumbsUpFill className="text-blue-400" size={25} />
            ) : (
              <BsHandThumbsUp className="text-white" size={25} />
            )}
          </div>
          <div
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={handleDislikeButton}
            title="Dislike"
          >
            {isDisliked ? (
              <BsHandThumbsDownFill className="text-red-400" size={25} />
            ) : (
              <BsHandThumbsDown className="text-white" size={25} />
            )}
          </div>
          <div
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={handleLoveButton}
            title="Love"
          >
            {isLoved ? (
              <AiFillHeart className="text-pink-400" size={25} />
            ) : (
              <AiOutlineHeart className="text-white" size={25} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionsButton;
