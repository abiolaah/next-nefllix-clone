import axios from "axios";

import React, { useCallback, useMemo } from "react";
import { AiOutlinePlus, AiOutlineCheck } from "react-icons/ai";

import useCurrentUser from "@/hooks/useCurrentUser";
import useFavourites from "@/hooks/useFavourites";

interface FavouriteButtonProps {
  mediaId: string | number;
  mediaType: "movie" | "tv";
  profileId: string;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({
  mediaId,
  mediaType,
  profileId,
}) => {
  const { mutate: mutateFavourites } = useFavourites();
  const { data: currentUser, mutate } = useCurrentUser();

  // Check if movie is already in favourites
  const isFavourite = useMemo(() => {
    if (!currentUser?.favorites) return false;

    return currentUser.favorites.some(
      (fav: { mediaId: string | number; mediaType: string }) =>
        fav.mediaId === mediaId && fav.mediaType === mediaType
    );
  }, [currentUser, mediaId, mediaType]);

  //Toggle Favourite
  const toggleFavourite = useCallback(async () => {
    try {
      if (isFavourite) {
        await axios.delete("/api/favourite", {
          data: { mediaId, profileId },
        });
      } else {
        await axios.post("/api/favourite", {
          mediaId,
          profileId,
          mediaType,
        });
      }

      // Update local state
      mutate();
      mutateFavourites();
    } catch (error) {
      console.error("Error toggling favourite:", error);
    }
  }, [mediaId, mediaType, profileId, isFavourite, mutate, mutateFavourites]);

  // Dynamic icon
  const Icon = isFavourite ? AiOutlineCheck : AiOutlinePlus;

  return (
    <div
      onClick={toggleFavourite}
      className="cursor-pointer group/item w-6 h-6 lg:w-10 lg:h-10 border-white border-2 rounded-full flex justify-center items-center transition hover:border-neutral-300"
    >
      <Icon className="text-white" size={25} />
    </div>
  );
};

export default FavouriteButton;
