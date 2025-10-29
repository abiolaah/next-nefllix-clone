import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Billboard from "@/components/Billboard";
import useBillboard from "@/hooks/useBillboard";
import useInfoModal from "@/hooks/useInfoModal";
import { KeyedMutator } from "swr";
// import { useRouter } from "next/router";
// import { NextRouter } from "next/router";

// Mock the hooks
jest.mock("@/hooks/useBillboard");
jest.mock("@/hooks/useInfoModal");

// Mock the PlayButton Components
jest.mock("@/components/PlayButton", () => {
  return function MockPlayButton({ movieId }: { movieId: string }) {
    return (
      <button type="button" data-testid="play-button" data-movieid={movieId}>
        Play
      </button>
    );
  };
});

// Mock variables
const mockUseBillboard = useBillboard as jest.MockedFunction<
  typeof useBillboard
>;
const mockUseInfoModal = useInfoModal as jest.MockedFunction<
  typeof useInfoModal
>;

// test suite
describe("Billboard Component", () => {
  const mockOpenModal = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up the mock useInfoModal hook
    mockUseInfoModal.mockReturnValue({
      openModal: mockOpenModal,
      closeModal: jest.fn(),
      isOpen: false,
      movieId: null,
      contentType: "movie",
    });
  });

  // test for loading state
  it("show loading state when data is not available", () => {
    // Set up the mock useBillboard hook to return loading state
    mockUseBillboard.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      mutate: jest.fn() as KeyedMutator<unknown>,
    });

    // render the component
    render(<Billboard />);

    // check for condition
    expect(screen.getByTitle("loading")).toBeInTheDocument();
  });

  // test for video muted by default
  it("video is muted by default", async () => {
    // Set up the mock useBillboard hook to return data
    mockUseBillboard.mockReturnValue({
      data: {
        id: "123",
        title: "Big Buck Bunny",
        description:
          "Three rodents amuse themselves by harassing creatures of the forest. However, when they mess with a bunny, he decides to teach them a lesson.",
        videoUrl:
          "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnailUrl:
          "https://upload.wikimedia.org/wikipedia/commons/7/70/Big.Buck.Bunny.-.Opening.Screen.png",
        trailerUrl:
          "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        genre: ["Comedy", "Animation"],
        rating: 8.5,
        duration: "10m",
        isAdult: false,
        isTvShow: false,
        source: "local",
      },
      isLoading: false,
      error: null,
      mutate: jest.fn() as KeyedMutator<unknown>,
    });

    // render the component
    render(<Billboard />);

    // Initially, the video should be muted
    const videoElement = screen.getByTitle("video") as HTMLVideoElement;
    expect(videoElement.muted).toBe(true);
    expect(screen.getByTitle("Unmute")).toBeInTheDocument();
  });

  // test for video controls
  it("toggles mute state when volume button is clicked", async () => {
    // Set up the mock useBillboard hook to return data
    mockUseBillboard.mockReturnValue({
      data: {
        id: "123",
        title: "Big Buck Bunny",
        description:
          "Three rodents amuse themselves by harassing creatures of the forest. However, when they mess with a bunny, he decides to teach them a lesson.",
        videoUrl:
          "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnailUrl:
          "https://upload.wikimedia.org/wikipedia/commons/7/70/Big.Buck.Bunny.-.Opening.Screen.png",
        trailerUrl:
          "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        genre: ["Comedy", "Animation"],
        rating: 8.5,
        duration: "10m",
        isAdult: false,
        isTvShow: false,
        source: "local",
      },
      isLoading: false,
      error: null,
      mutate: jest.fn() as KeyedMutator<unknown>,
    });

    // render the component
    render(<Billboard />);

    // get mute button and interact with it
    // const muteButton = screen.getByTitle("Unmute").querySelector("button");
    const muteButton = screen.getByTitle("Unmute");
    fireEvent.click(muteButton);

    // Video should become unmuted
    const videoElement = screen.getByTitle("video") as HTMLVideoElement;
    await waitFor(() => expect(videoElement.muted).toBe(false));
    expect(screen.getByTitle("Mute")).toBeInTheDocument();
  });

  // test for modal opening functionality
  it('opens info modal when "More Info" button is clicked', () => {
    // Set up the mock useBillboard hook to return data
    mockUseBillboard.mockReturnValue({
      data: {
        id: "123",
        title: "Big Buck Bunny",
        description:
          "Three rodents amuse themselves by harassing creatures of the forest. However, when they mess with a bunny, he decides to teach them a lesson.",
        videoUrl:
          "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnailUrl:
          "https://upload.wikimedia.org/wikipedia/commons/7/70/Big.Buck.Bunny.-.Opening.Screen.png",
        trailerUrl:
          "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        genre: ["Comedy", "Animation"],
        rating: 8.5,
        duration: "10m",
        isAdult: false,
        isTvShow: false,
        source: "local",
      },
      isLoading: false,
      error: null,
      mutate: jest.fn() as KeyedMutator<unknown>,
    });
    // render the component
    render(<Billboard />);

    // Find and click the "More Info" button
    const moreInfoButton = screen.getByRole("button", { name: /more info/i });
    fireEvent.click(moreInfoButton);

    // Check if the openModal function was called with correct arguments
    expect(mockOpenModal).toHaveBeenCalledWith("123", "movie");
  });

  // test for content rating display
  it("displays correct content rating based on data", () => {
    // Set up the mock useBillboard hook to return data for a TV-MA show
    mockUseBillboard.mockReturnValue({
      data: {
        id: "456",
        title: "Mature TV Show",
        description: "A mature TV show description.",
        videoUrl: "http://example.com/video.mp4",
        thumbnailUrl: "http://example.com/thumbnail.jpg",
        trailerUrl: "http://example.com/trailer.mp4",
        genre: ["Drama"],
        rating: 9.0,
        duration: "45m",
        isAdult: true,
        isTvShow: true,
        source: "local",
      },
      isLoading: false,
      error: null,
      mutate: jest.fn() as KeyedMutator<unknown>,
    });

    // render the component
    render(<Billboard />);

    // Check if the content rating is displayed correctly
    const contentRating = screen.getByTitle("content-rating");
    expect(contentRating).toHaveTextContent("TV-MA");
  });

  // test for correct rendering of title and description
  it("renders title and description correctly", () => {
    // Set up the mock useBillboard hook to return data
    mockUseBillboard.mockReturnValue({
      data: {
        id: "789",
        title: "Sample Movie",
        description: "This is a sample movie description.",
        videoUrl: "http://example.com/video.mp4",
        thumbnailUrl: "http://example.com/thumbnail.jpg",
        trailerUrl: "http://example.com/trailer.mp4",
        genre: ["Action"],
        rating: 7.5,
        duration: "120m",
        isAdult: false,
        isTvShow: false,
        source: "local",
      },
      isLoading: false,
      error: null,
      mutate: jest.fn() as KeyedMutator<unknown>,
    });

    // render the component
    render(<Billboard />);

    // Check if the title and description are rendered correctly
    const titleElement = screen.getByTitle("video-title");
    const descriptionElement = screen.getByTitle("description");

    expect(titleElement).toHaveTextContent("Sample Movie");
    expect(descriptionElement).toHaveTextContent(
      "This is a sample movie description."
    );
  });
});
