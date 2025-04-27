import axios from "axios";

import React, { useCallback, useMemo } from "react";
import { AiOutlinePlus, AiOutlineCheck } from "react-icons/ai";

import useCurrentUser from "@/hooks/useCurrentUser";
import useFavourites from "@/hooks/useFavourites";

interface FavouriteButtonProps {
  mediaId: string | number;
  mediaType: "movie" | "tv";
  profileId: string;
  source?: "local" | "tmdb"; // Optional source prop
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({
  mediaId,
  mediaType,
  profileId,
  source = "tmdb", // Default to "tmdb" if not provided
}) => {
  const { data: favourites = [], mutate: mutateFavourites } =
    useFavourites(profileId);
  const { mutate } = useCurrentUser();

  // Check if movie is already in favourites
  const isFavourite = useMemo(() => {
    return favourites.some(
      (fav: { id: string | number; isTvShow: boolean; source?: string }) =>
        fav.id === mediaId &&
        fav.isTvShow === (mediaType === "tv") &&
        fav.source === source // Match source too
    );
  }, [favourites, mediaId, mediaType, source]);

  //Toggle Favourite
  const toggleFavourite = useCallback(async () => {
    try {
      if (isFavourite) {
        await axios.delete("/api/favourite", {
          data: { mediaId, profileId, source }, // Include source in the delete request
        });
      } else {
        await axios.post("/api/favourite", {
          mediaId,
          profileId,
          mediaType,
          source, // Include source in the post request
        });
      }

      // Update local state
      mutate();
      mutateFavourites();
    } catch (error) {
      console.error("Error toggling favourite:", error);
    }
  }, [
    mediaId,
    mediaType,
    profileId,
    isFavourite,
    mutate,
    mutateFavourites,
    source,
  ]);

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
