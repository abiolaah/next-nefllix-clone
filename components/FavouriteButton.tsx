import axios from "axios";

import React, { useCallback, useMemo } from "react";
import { AiOutlinePlus, AiOutlineCheck } from "react-icons/ai";

import useCurrentUser from "@/hooks/useCurrentUser";
import useFavourites from "@/hooks/useFavourites";

interface FavouriteButtonProps {
  movieId: string;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ movieId }) => {
  const { mutate: mutateFavourites } = useFavourites();
  const { data: currentUser, mutate } = useCurrentUser();

  // Check if movie is already in favourites
  const isFavourite = useMemo(() => {
    const list = currentUser?.favouritesIds || [];

    return list.includes(movieId);
  }, [currentUser, movieId]);

  //Toggle Favourite
  const toggleFavourite = useCallback(async () => {
    let response;
    if (isFavourite) {
      response = await axios.delete(`/api/favourite`, { data: { movieId } });
    } else {
      response = await axios.post(`/api/favourite`, { movieId });
    }

    const updatedFavouriteIds = response?.data?.favouritesIds;

    mutate({
      ...currentUser,
      favouritesIds: updatedFavouriteIds,
    });

    mutateFavourites();
  }, [movieId, isFavourite, mutate, mutateFavourites, currentUser]);

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
