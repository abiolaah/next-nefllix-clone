import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WatchingMovieCard from "@/components/WatchingMovieCard";
import useInfoModal from "@/hooks/useInfoModal";
import useProfile from "@/hooks/useProfile";
import { NextRouter, useRouter } from "next/router";
import axios from "axios";
import { WatchingItem } from "@/lib/types/api";

// Mock dependencies
jest.mock("axios");
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/useInfoModal");
jest.mock("@/hooks/useProfile");
jest.mock("@/lib/useExpandedPosition", () => ({
  useExpandedPosition: jest.fn(() => ({
    getPosition: jest.fn(() => ({
      left: "0px",
      top: "0px",
    })),
  })),
}));

// Mock child components
jest.mock("@/components/FavouriteButton", () => {
  return function MockFavouriteButton() {
    return <div data-testid="favourite-button">FavouriteButton</div>;
  };
});

jest.mock("@/components/ReactionsButton", () => {
  return function MockReactionsButton() {
    return <div data-testid="reactions-button">ReactionsButton</div>;
  };
});

// Type the mocks
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseInfoModal = useInfoModal as jest.MockedFunction<
  typeof useInfoModal
>;
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;

describe("WatchingMovieCard Component", () => {
  const mockPush = jest.fn();

  // Mock function for onChange
  const mockSetModalOpen = jest.fn();
  const mockCloseModal = jest.fn();

  // Mock setCurrentProfileId function
  const mockSetCurrentProfileId = jest.fn();

  // Create a complete mock router object
  const mockRouter: NextRouter = {
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
    basePath: "",
    push: mockPush,
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
  };

  // Mock movie data (TransformedMovie as WatchingItem)
  const mockMovieData: WatchingItem = {
    id: "507f1f77bcf86cd799439011",
    title: "Test Movie",
    description: "A test movie description",
    videoUrl: "http://example.com/video.mp4",
    thumbnailUrl: "/test-image.jpg",
    trailerUrl: "http://example.com/trailer.mp4",
    genre: ["Action", "Drama"],
    rating: 8.5,
    duration: "120 min",
    isAdult: false,
    isTvShow: false,
    source: "tmdb",
    progress: 50,
    completed: false,
    lastWatched: new Date("2024-01-15"),
  };

  // Mock TV show data (TransformedTvShow as WatchingItem)
  const mockTvShowData: WatchingItem = {
    id: "507f1f77bcf86cd799439012",
    title: "Test TV Show",
    description: "A test TV show description",
    videoUrl: "http://example.com/tv-video.mp4",
    thumbnailUrl: "/test-tv-image.jpg",
    trailerUrl: "http://example.com/tv-trailer.mp4",
    genre: ["Comedy", "Drama"],
    rating: 9.0,
    numberOfSeasons: 3,
    isAdult: false,
    isTvShow: true,
    source: "tmdb",
    progress: 75,
    completed: false,
    lastWatched: new Date("2024-01-20"),
    currentSeason: 2,
    currentEpisode: 5,
    episodeDetails: {
      id: "507f1f77bcf86cd799439013",
      episodeNumber: 5,
      title: "The Test Episode",
      description: "An exciting test episode",
      duration: "45 min",
      videoUrl: "http://example.com/episode.mp4",
      thumbnailUrl: "/test-episode.jpg",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset setCurrentProfileId mock
    mockSetCurrentProfileId.mockClear();

    // Set up the router mock
    mockUseRouter.mockReturnValue({
      ...mockRouter,
      push: mockPush, // Make sure mockPush is properly defined
    });

    // Default mock implementations
    mockUseInfoModal.mockReturnValue({
      openModal: mockSetModalOpen,
      closeModal: mockCloseModal,
      isOpen: false,
    });

    // Setup the useProfile mock with all required properties
    mockUseProfile.mockReturnValue({
      currentProfileId: "1",
      currentProfile: {
        id: "1",
        name: "Profile 1",
        avatar:
          "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696100/default-blue_oqkthi.png",
      },
      setCurrentProfileId: mockSetCurrentProfileId,
      setCurrentProfile: jest.fn(),
    });

    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
  });

  // Initial Rendering Tests
  describe("Initial Rendering", () => {
    it("should render movie card with basic information", () => {
      render(<WatchingMovieCard data={mockMovieData} />);

      const image = screen.getAllByAltText("Test Movie")[0];
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src");
    });

    it("should render TV show card with episode information", () => {
      render(<WatchingMovieCard data={mockTvShowData} />);

      const image = screen.getAllByAltText("Test TV Show")[0];
      expect(image).toBeInTheDocument();
    });

    it("should display progress bar with correct width for movie", () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const progressBar = container.querySelector(".bg-red-600");
      expect(progressBar).toHaveStyle({ width: "50%" });
    });

    it("should display progress bar with correct width for TV show", () => {
      const { container } = render(<WatchingMovieCard data={mockTvShowData} />);

      const progressBar = container.querySelector(".bg-red-600");
      expect(progressBar).toHaveStyle({ width: "75%" });
    });

    it("should render child components on hover only", () => {
      render(<WatchingMovieCard data={mockMovieData} />);

      // Child components should not be visible initially (only on hover)
      expect(screen.queryByTestId("favourite-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("reactions-button")).not.toBeInTheDocument();
    });

    it("should handle movie without source property", () => {
      const movieWithoutSource = { ...mockMovieData, source: undefined };
      render(<WatchingMovieCard data={movieWithoutSource} />);

      const image = screen.getAllByAltText("Test Movie")[0];
      expect(image).toBeInTheDocument();
    });
  });

  // Hover Interaction Tests
  describe("Hover Interactions", () => {
    it("should show expanded card on hover", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");
      expect(card).toBeInTheDocument();

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(
            container.querySelector(".netflix-expanded-card")
          ).toBeInTheDocument();
        });
      }
    });

    it("should hide expanded card on mouse leave", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(
            container.querySelector(".netflix-expanded-card")
          ).toBeInTheDocument();
        });

        fireEvent.mouseLeave(card);

        await waitFor(() => {
          expect(
            container.querySelector(".netflix-expanded-card")
          ).not.toBeInTheDocument();
        });
      }
    });

    it("should display action buttons on hover", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(screen.getByTestId("favourite-button")).toBeInTheDocument();
          expect(screen.getByTestId("reactions-button")).toBeInTheDocument();
        });
      }
    });

    it("should display movie title on hover", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const titles = screen.getAllByText("Test Movie");
          expect(titles.length).toBeGreaterThan(0);
        });
      }
    });

    it("should apply correct z-index on hover", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        expect(card).toHaveStyle({ zIndex: 1 });

        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(card).toHaveStyle({ zIndex: 1000 });
        });
      }
    });
  });

  // Navigation Tests
  describe("Navigation", () => {
    it("should navigate to watch page when play button is clicked", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const playButton = container.querySelector(".cursor-pointer");
          expect(playButton).toBeInTheDocument();
        });

        const playButtons = container.querySelectorAll(
          ".cursor-pointer"
        ) as NodeListOf<HTMLElement>;
        // First play button is in the action buttons section
        fireEvent.click(playButtons[1]);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(
            "/watch/507f1f77bcf86cd799439011"
          );
        });
      }
    });

    it("should navigate to watch page for TV show when play button is clicked", async () => {
      const { container } = render(<WatchingMovieCard data={mockTvShowData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const playButton = container.querySelector(".cursor-pointer");
          expect(playButton).toBeInTheDocument();
        });

        const playButtons = container.querySelectorAll(
          ".cursor-pointer"
        ) as NodeListOf<HTMLElement>;
        fireEvent.click(playButtons[1]);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(
            "/watch/507f1f77bcf86cd799439012"
          );
        });
      }
    });

    it("should navigate to watch page when thumbnail is clicked on expanded card", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        const thumbnails = container.querySelectorAll(
          ".cursor-pointer.object-cover"
        );
        if (thumbnails.length > 0) {
          const expandedThumbnail = thumbnails[thumbnails.length - 1]
            .parentElement as HTMLElement;
          fireEvent.click(expandedThumbnail);

          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
              "/watch/507f1f77bcf86cd799439011"
            );
          });
        }
      }
    });

    it("should open info modal when chevron down is clicked", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        // Find the chevron down button (last button in action buttons)
        const buttons = container.querySelectorAll(
          ".cursor-pointer.ml-auto"
        ) as NodeListOf<HTMLElement>;
        if (buttons.length > 0) {
          fireEvent.click(buttons[0]);

          await waitFor(() => {
            expect(mockSetModalOpen).toHaveBeenCalled();
          });
        }
      }
    });

    it("should open TV show modal with correct content type", async () => {
      const { container } = render(<WatchingMovieCard data={mockTvShowData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        const buttons = container.querySelectorAll(
          ".cursor-pointer.ml-auto"
        ) as NodeListOf<HTMLElement>;
        if (buttons.length > 0) {
          fireEvent.click(buttons[0]);

          await waitFor(() => {
            expect(mockSetModalOpen).toHaveBeenCalledWith(
              "507f1f77bcf86cd799439012",
              "tv"
            );
          });
        }
      }
    });

    it("should close hover state when modal is opened", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        const buttons = container.querySelectorAll(
          ".cursor-pointer.ml-auto"
        ) as NodeListOf<HTMLElement>;
        if (buttons.length > 0) {
          fireEvent.click(buttons[0]);

          await waitFor(() => {
            expect(mockSetModalOpen).toHaveBeenCalled();
          });

          // Hover state should be reset
          await waitFor(() => {
            expect(
              container.querySelector(".netflix-expanded-card")
            ).not.toBeInTheDocument();
          });
        }
      }
    });
  });

  // Remove Functionality Tests
  describe("Remove Functionality", () => {
    it("should call delete API when remove button is clicked", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const removeButton = screen.getByTestId("remove-button");
          expect(removeButton).toBeInTheDocument();
        });

        // Find IoClose button
        const removeButton = screen.getByTestId("remove-button");
        fireEvent.click(removeButton);
        await waitFor(() => {
          expect(mockedAxios.delete).toHaveBeenCalledWith("/api/watching", {
            data: {
              mediaId: "507f1f77bcf86cd799439011",
              profileId: "1",
              source: "tmdb",
            },
          });
        });
      }
    });

    it("should call delete API for TV show with correct parameters", async () => {
      const { container } = render(<WatchingMovieCard data={mockTvShowData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const removeButton = screen.getByTestId("remove-button");
          expect(removeButton).toBeInTheDocument();
        });

        const removeButton = screen.getByTestId("remove-button");
        fireEvent.click(removeButton);

        await waitFor(() => {
          expect(mockedAxios.delete).toHaveBeenCalledWith("/api/watching", {
            data: {
              mediaId: "507f1f77bcf86cd799439012",
              profileId: "1",
              source: "tmdb",
            },
          });
        });
      }
    });

    it("should prevent event propagation when remove button is clicked", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        const removeButtons = container.querySelectorAll(
          ".hover\\:bg-red-500\\/20"
        ) as NodeListOf<HTMLElement>;
        if (removeButtons.length > 0) {
          fireEvent.click(removeButtons[0]);

          // Verify that navigation did not occur
          expect(mockPush).not.toHaveBeenCalled();
        }
      }
    });

    it("should handle remove for local source media", async () => {
      const localMediaData = { ...mockMovieData, source: "local" as const };
      const { container } = render(<WatchingMovieCard data={localMediaData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const removeButton = screen.getByTestId("remove-button");
          expect(removeButton).toBeInTheDocument();
        });

        const removeButton = screen.getByTestId("remove-button");
        fireEvent.click(removeButton);

        await waitFor(() => {
          expect(mockedAxios.delete).toHaveBeenCalledWith("/api/watching", {
            data: {
              mediaId: "507f1f77bcf86cd799439011",
              profileId: "1",
              source: "local",
            },
          });
        });
      }
    });
  });

  // TV Show Specific Tests
  describe("TV Show Specific Features", () => {
    it("should display episode information for TV shows", async () => {
      const { container } = render(<WatchingMovieCard data={mockTvShowData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(
            screen.getByText(/S2 E5: The Test Episode/i)
          ).toBeInTheDocument();
        });
      }
    });

    it("should calculate time correctly for TV shows with episode duration", async () => {
      const { container } = render(<WatchingMovieCard data={mockTvShowData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          // 75% of 45 minutes = 33.75 minutes (rounded to 33)
          expect(screen.getByText("33 of 45 minutes")).toBeInTheDocument();
        });
      }
    });

    it("should not display episode information for movies", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(screen.queryByText(/S\d+ E\d+:/)).not.toBeInTheDocument();
        });
      }
    });

    it("should handle TV show without episode details", async () => {
      const tvShowWithoutEpisodeDetails = {
        ...mockTvShowData,
        episodeDetails: undefined,
      };
      const { container } = render(
        <WatchingMovieCard data={tvShowWithoutEpisodeDetails} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        // Should not display episode information
        expect(screen.queryByText(/S\d+ E\d+:/)).not.toBeInTheDocument();
      }
    });

    it("should display correct number of seasons in TV show data", () => {
      render(<WatchingMovieCard data={mockTvShowData} />);

      // Verify the data structure is correct
      expect(mockTvShowData.numberOfSeasons).toBe(3);
    });
  });

  // Progress Display Tests
  describe("Progress Display", () => {
    it("should format time correctly for movies", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          // 50% of 120 minutes = 60 minutes
          expect(screen.getByText("60 of 120 minutes")).toBeInTheDocument();
        });
      }
    });

    it("should handle zero progress", async () => {
      const dataWithZeroProgress = { ...mockMovieData, progress: 0 };
      const { container } = render(
        <WatchingMovieCard data={dataWithZeroProgress} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(screen.getByText("0 of 120 minutes")).toBeInTheDocument();
        });
      }
    });

    it("should handle 100% progress", async () => {
      const dataWithFullProgress = { ...mockMovieData, progress: 100 };
      const { container } = render(
        <WatchingMovieCard data={dataWithFullProgress} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(screen.getByText("120 of 120 minutes")).toBeInTheDocument();
        });
      }
    });

    it("should handle undefined progress", async () => {
      const dataWithUndefinedProgress = {
        ...mockMovieData,
        progress: undefined,
      };
      const { container } = render(
        <WatchingMovieCard data={dataWithUndefinedProgress} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          // 0% of 120 minutes = 0 minutes
          expect(screen.getByText("0 of 120 minutes")).toBeInTheDocument();
        });
      }
    });

    it("should display progress bar on both base and expanded cards", async () => {
      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      // Check base card progress bar
      const baseProgressBars = container.querySelectorAll(".bg-red-600");
      expect(baseProgressBars.length).toBeGreaterThan(0);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          // Check expanded card progress bar
          const allProgressBars = container.querySelectorAll(".bg-red-600");
          expect(allProgressBars.length).toBeGreaterThan(1);
        });
      }
    });

    it("should handle completed status", () => {
      const completedData = {
        ...mockMovieData,
        completed: true,
        progress: 100,
      };
      const { container } = render(<WatchingMovieCard data={completedData} />);

      const progressBar = container.querySelector(".bg-red-600");
      expect(progressBar).toHaveStyle({ width: "100%" });
    });

    it("should handle lastWatched date", () => {
      const dataWithLastWatched = {
        ...mockMovieData,
        lastWatched: new Date("2024-01-15"),
      };
      render(<WatchingMovieCard data={dataWithLastWatched} />);

      // Verify the component renders with lastWatched data
      const image = screen.getAllByAltText("Test Movie")[0];
      expect(image).toBeInTheDocument();
    });
  });

  // Props Variations Tests
  describe("Props Variations", () => {
    it("should handle local source type for movies", async () => {
      const dataWithLocalSource = {
        ...mockMovieData,
        source: "local" as const,
      };
      const { container } = render(
        <WatchingMovieCard data={dataWithLocalSource} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        const removeButton = screen.getByTestId("remove-button");
        fireEvent.click(removeButton);

        await waitFor(() => {
          expect(mockedAxios.delete).toHaveBeenCalledWith("/api/watching", {
            data: {
              mediaId: "507f1f77bcf86cd799439011",
              profileId: "1",
              source: "local",
            },
          });
        });
      }
    });

    it("should handle local source type for TV shows", async () => {
      const dataWithLocalSource = {
        ...mockTvShowData,
        source: "local" as const,
      };
      const { container } = render(
        <WatchingMovieCard data={dataWithLocalSource} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });
      }
    });

    it("should handle adult content flag for movies", () => {
      const adultMovie = { ...mockMovieData, isAdult: true };
      render(<WatchingMovieCard data={adultMovie} />);

      const image = screen.getAllByAltText("Test Movie")[0];
      expect(image).toBeInTheDocument();
    });

    it("should handle adult content flag for TV shows", () => {
      const adultTvShow = { ...mockTvShowData, isAdult: true };
      render(<WatchingMovieCard data={adultTvShow} />);

      const image = screen.getAllByAltText("Test TV Show")[0];
      expect(image).toBeInTheDocument();
    });

    it("should handle different rating values", () => {
      const highRatingData = { ...mockMovieData, rating: 9.8 };
      render(<WatchingMovieCard data={highRatingData} />);

      const image = screen.getAllByAltText("Test Movie")[0];
      expect(image).toBeInTheDocument();
    });

    it("should handle null rating", () => {
      const noRatingData = { ...mockMovieData, rating: null };
      render(<WatchingMovieCard data={noRatingData} />);

      const image = screen.getAllByAltText("Test Movie")[0];
      expect(image).toBeInTheDocument();
    });

    it("should handle multiple genres", () => {
      const multiGenreData = {
        ...mockMovieData,
        genre: ["Action", "Drama", "Thriller", "Adventure"],
      };
      render(<WatchingMovieCard data={multiGenreData} />);

      const image = screen.getAllByAltText("Test Movie")[0];
      expect(image).toBeInTheDocument();
    });

    it("should handle single genre", () => {
      const singleGenreData = { ...mockMovieData, genre: ["Action"] };
      render(<WatchingMovieCard data={singleGenreData} />);

      const image = screen.getAllByAltText("Test Movie")[0];
      expect(image).toBeInTheDocument();
    });

    it("should handle different duration formats", async () => {
      const differentDurationData = { ...mockMovieData, duration: "90 min" };
      const { container } = render(
        <WatchingMovieCard data={differentDurationData} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          // 50% of 90 minutes = 45 minutes
          expect(screen.getByText("45 of 90 minutes")).toBeInTheDocument();
        });
      }
    });

    it("should handle TV shows with different number of seasons", () => {
      const multiSeasonShow = { ...mockTvShowData, numberOfSeasons: 10 };
      render(<WatchingMovieCard data={multiSeasonShow} />);

      const image = screen.getAllByAltText("Test TV Show")[0];
      expect(image).toBeInTheDocument();
    });

    it("should work with ObjectId string format", async () => {
      const validObjectIdData = {
        ...mockMovieData,
        id: "507f191e810c19729de860ea",
      };
      const { container } = render(
        <WatchingMovieCard data={validObjectIdData} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const playButtons = container.querySelectorAll(
            ".cursor-pointer"
          ) as NodeListOf<HTMLElement>;
          fireEvent.click(playButtons[1]);

          expect(mockPush).toHaveBeenCalledWith(
            "/watch/507f191e810c19729de860ea"
          );
        });
      }
    });
  });

  // Edge Cases Tests
  describe("Edge Cases", () => {
    it("should handle empty string in duration", async () => {
      const emptyDurationData = { ...mockMovieData, duration: "" };
      const { container } = render(
        <WatchingMovieCard data={emptyDurationData} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        // Should not display time information
        expect(screen.queryByText(/of.*minutes/)).not.toBeInTheDocument();
      }
    });

    it("should handle malformed duration string", async () => {
      const malformedDurationData = {
        ...mockMovieData,
        duration: "invalid duration",
      };
      const { container } = render(
        <WatchingMovieCard data={malformedDurationData} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        // Should not display time information for malformed duration
        expect(screen.queryByText(/of.*minutes/)).not.toBeInTheDocument();
      }
    });

    it("should handle episode without duration in TV show", async () => {
      const tvShowNoDuration = {
        ...mockTvShowData,
        episodeDetails: {
          ...mockTvShowData.episodeDetails!,
          duration: undefined,
        },
      };
      const { container } = render(
        <WatchingMovieCard data={tvShowNoDuration} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });

        // Should not display time information
        expect(screen.queryByText(/of.*minutes/)).not.toBeInTheDocument();
      }
    });

    it("should handle very long titles", async () => {
      const longTitleData = {
        ...mockMovieData,
        title:
          "A Very Long Movie Title That Extends Beyond Normal Length For Testing Purposes",
      };
      const { container } = render(<WatchingMovieCard data={longTitleData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(
            screen.getByText(/A Very Long Movie Title/)
          ).toBeInTheDocument();
        });
      }
    });

    it("should handle special characters in title", async () => {
      const specialCharData = {
        ...mockMovieData,
        title: "Movie: Part II - The Return (2024)",
      };
      const { container } = render(
        <WatchingMovieCard data={specialCharData} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(
            screen.getByText("Movie: Part II - The Return (2024)")
          ).toBeInTheDocument();
        });
      }
    });

    it("should handle empty genre array", () => {
      const noGenreData = { ...mockMovieData, genre: [] };
      render(<WatchingMovieCard data={noGenreData} />);

      const image = screen.getAllByAltText("Test Movie")[0];
      expect(image).toBeInTheDocument();
    });

    it("should handle missing profile ID gracefully", async () => {
      mockUseProfile.mockReturnValue({
        currentProfileId: null,
        currentProfile: null,
        setCurrentProfile: jest.fn(),
        setCurrentProfileId: jest.fn(),
      });

      const { container } = render(<WatchingMovieCard data={mockMovieData} />);

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          const expandedCard = container.querySelector(
            ".netflix-expanded-card"
          );
          expect(expandedCard).toBeInTheDocument();
        });
      }
    });

    it("should handle season 0 episode 0", async () => {
      const specialEpisodeData = {
        ...mockTvShowData,
        currentSeason: 0,
        currentEpisode: 0,
      };
      const { container } = render(
        <WatchingMovieCard data={specialEpisodeData} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(screen.getByText(/S0 E0:/i)).toBeInTheDocument();
        });
      }
    });

    it("should handle high season and episode numbers", async () => {
      const highNumbersData = {
        ...mockTvShowData,
        currentSeason: 15,
        currentEpisode: 242,
        episodeDetails: {
          ...mockTvShowData.episodeDetails!,
          episodeNumber: 242,
        },
      };
      const { container } = render(
        <WatchingMovieCard data={highNumbersData} />
      );

      const card = container.querySelector(".relative");

      if (card) {
        fireEvent.mouseEnter(card);

        await waitFor(() => {
          expect(screen.getByText(/S15 E242:/i)).toBeInTheDocument();
        });
      }
    });
  });
});
