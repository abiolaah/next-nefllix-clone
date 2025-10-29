import React from "react";
import { render, screen } from "@testing-library/react";
import FavouriteButton from "@/components/FavouriteButton";
import useFavourites from "@/hooks/useFavourites";
import useCurrentUser from "@/hooks/useCurrentUser";
import { KeyedMutator } from "swr";
import "@testing-library/jest-dom";
import { MediaItem } from "@/lib/types/api";

type FavouritesItems = MediaItem & {
  source: "local" | "tmdb";
};

jest.mock("axios");
jest.mock("@/hooks/useCurrentUser");
jest.mock("@/hooks/useFavourites");

// Type the mocks for the typescripts
const mockUseFavourites = useFavourites as jest.MockedFunction<
  typeof useFavourites
>;
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<
  typeof useCurrentUser
>;

describe("FavouriteButton", () => {
  const mockMutate: KeyedMutator<unknown> = jest.fn();
  const mockMutateFavourites = jest.fn();

  // Complete mock data that matched FavouritesItems type
  const mockMovieFavorite: FavouritesItems = {
    id: "123",
    title: "Test Movie",
    description: "Test Description",
    videoUrl: "http://test.com/video",
    thumbnailUrl: "http://test.com/thumbnail",
    trailerUrl: "http://test.com/trailer",
    genre: ["Action"],
    rating: 8.5,
    duration: "120m",
    isAdult: false,
    isTvShow: false,
    source: "tmdb",
  };
  beforeEach(() => {
    // Reset the mocks
    jest.clearAllMocks();

    // Set up the mock useFavourites hooks
    mockUseFavourites.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: mockMutateFavourites,
    });
    // Set up the mock useCurrentUser hooks
    mockUseCurrentUser.mockReturnValue({
      data: {},
      mutate: mockMutate,
      isLoading: false,
      error: null,
    });
  });

  it("renders plus icon when not favourited", () => {
    render(<FavouriteButton mediaId="123" mediaType="movie" profileId="1" />);
    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("renders check icon when media is favourited", () => {
    mockUseFavourites.mockReturnValue({
      data: [mockMovieFavorite],
      error: null,
      isLoading: false,
      mutate: mockMutateFavourites,
    });
    render(<FavouriteButton mediaId="123" mediaType="movie" profileId="1" />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("plus-icon")).not.toBeInTheDocument();
  });
});
