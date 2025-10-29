import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReactionsButton from "@/components/ReactionsButton";
import useReactions from "@/hooks/useReactions";
import axios from "axios";
// import { KeyedMutator } from "swr";

// Mock axios
jest.mock("axios");

// Mock useReactions hook
jest.mock("@/hooks/useReactions");

// Type the mock for the typescript
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockUseReactions = useReactions as jest.MockedFunction<
  typeof useReactions
>;

describe("ReactionsButton Component", () => {
  //   const mockMutate: KeyedMutator<unknown> = jest.fn();
  const mockMutateReactions = jest.fn();

  // Mock default props
  const defaultProps = {
    mediaId: "123",
    mediaType: "movie" as const,
    profileId: "1",
    source: "tmdb" as const,
  };

  // mock data for reactions
  const mockReactionsData = {
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
    isTvShow: false as const,
    source: "local" as const,
    mediaType: "movie",
    reaction: "liked",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    mockUseReactions.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: mockMutateReactions,
    });
  });

  // Initial rendering tests
  describe("Initial Rendering", () => {
    // Test case for default thumbs up icon rendering
    it("should render with default thumbs up icon when no reactions", () => {
      render(<ReactionsButton {...defaultProps} />);

      // Show default thumbs up icon
      const thumbsUpIcon = screen.getByTestId("thumbs-up-icon");
      //   const thumbsUpIcon = screen.getByTitle("Like Default");
      expect(thumbsUpIcon).toBeInTheDocument();
    });

    // Test case for thumbs up fill icon rendering when liked\
    it("should render with liked state when user has liked the media", () => {
      // Mock the useReactions hook to return a liked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "liked" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Render the component: Arrange
      render(<ReactionsButton {...defaultProps} />);

      // Assert: Verify that the thumbs up fill icon is displayed
      const thumbsUpFillIcon = screen.getByTestId("thumbs-up-fill-icon");
      expect(thumbsUpFillIcon).toBeInTheDocument();
      expect(thumbsUpFillIcon).toHaveClass("text-blue-400");
    });

    // Test case for thumbs down fill icon rendering when disliked
    it("should render with disliked state when user has disliked the media", () => {
      // Mock the useReactions hook to return a liked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "disliked" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Render the component: Arrange
      render(<ReactionsButton {...defaultProps} />);

      // Assert: Verify that the thumbs up fill icon is displayed
      const thumbsDownFillIcon = screen.getByTestId("thumbs-down-fill-icon");
      expect(thumbsDownFillIcon).toBeInTheDocument();
      expect(thumbsDownFillIcon).toHaveClass("text-red-400");
    });

    // Test case for heart fill icon rendering when loved
    it("should render with loved state when user has loved the media", () => {
      // Mock the useReactions hook to return a liked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "loved" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Render the component: Arrange
      render(<ReactionsButton {...defaultProps} />);

      // Assert: Verify that the thumbs up fill icon is displayed
      const heartFillIcon = screen.getByTestId("heart-fill-icon");
      expect(heartFillIcon).toBeInTheDocument();
      expect(heartFillIcon).toHaveClass("text-pink-400");
    });
  });

  // Hover Interaction tests
  describe("Hover Interactions", () => {
    // Test case for displaying reaction options on hover
    it("should show reaction options on hover", async () => {
      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");
      expect(reactionButton).toBeInTheDocument();

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Assert: Verify that the reaction options are displayed
      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
        expect(screen.getByTitle("DislikeDiv")).toBeInTheDocument();
        expect(screen.getByTitle("LoveDiv")).toBeInTheDocument();
      });
    });

    // Test case for hiding reaction options on mouse leave
    it("should hide reaction options on mouse leave", async () => {
      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");
      expect(reactionButton).toBeInTheDocument();

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      fireEvent.mouseLeave(reactionButton);

      // Options should disappear
      await waitFor(() => {
        expect(screen.queryByTitle("LikeDiv")).not.toBeInTheDocument();
        expect(screen.queryByTitle("DislikeDiv")).not.toBeInTheDocument();
        expect(screen.queryByTitle("LoveDiv")).not.toBeInTheDocument();
      });
    });

    // Test case for maintaining reaction options visibility when hovering over them
    it("should keep reaction options visible when hovering over them", async () => {
      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");
      expect(reactionButton).toBeInTheDocument();

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      //  Get the reaction options container
      const reactionOptions = screen.getByTestId("reaction-options");
      fireEvent.mouseEnter(reactionOptions);

      // Options should still be visible
      expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      expect(screen.getByTitle("DislikeDiv")).toBeInTheDocument();
      expect(screen.getByTitle("LoveDiv")).toBeInTheDocument();
    });
  });

  // Reaction Selection tests
  describe("Reaction Submission - New Reactions", () => {
    beforeEach(() => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
    });

    // Test case for submitting a new like reaction
    it("should submit like reaction when like button is clicked", async () => {
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get defaulf reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Act: Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      // Act: Click like button
      fireEvent.click(screen.getByTitle("LikeDiv"));

      // Assert: Verify axios post was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/reaction", {
          mediaId: "123",
          profileId: "1",
          mediaType: "movie",
          reactionType: "liked",
          source: "tmdb",
        });
      });
      // Assert: Verify the useReactions mutate function was called
      expect(mockMutateReactions).toHaveBeenCalled();
    });

    // Test case for submitting a new dislike reaction
    it("should submit dislike reaction when dislike button is clicked", async () => {
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get defaulf reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Act: Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("DislikeDiv")).toBeInTheDocument();
      });

      // Act: Click like button
      fireEvent.click(screen.getByTitle("DislikeDiv"));

      // Assert: Verify axios post was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/reaction", {
          mediaId: "123",
          profileId: "1",
          mediaType: "movie",
          reactionType: "disliked",
          source: "tmdb",
        });
      });
      // Assert: Verify the useReactions mutate function was called
      expect(mockMutateReactions).toHaveBeenCalled();
    });

    // Test case for submitting a new love reaction
    it("should submit love reaction when love button is clicked", async () => {
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get defaulf reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Act: Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LoveDiv")).toBeInTheDocument();
      });

      // Act: Click like button
      fireEvent.click(screen.getByTitle("LoveDiv"));

      // Assert: Verify axios post was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/reaction", {
          mediaId: "123",
          profileId: "1",
          mediaType: "movie",
          reactionType: "loved",
          source: "tmdb",
        });
      });
      // Assert: Verify the useReactions mutate function was called
      expect(mockMutateReactions).toHaveBeenCalled();
    });
  });

  // Reaction Removal tests
  describe("Reaction Removal - Existing Reactions", () => {
    beforeEach(() => {
      mockedAxios.delete.mockResolvedValue({ data: { success: true } });
    });

    // Test case for removing an existing like reaction
    it("should remove like reaction when like button is clicked on already liked media", async () => {
      // Mock the useReactions hook to return a liked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "liked" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");
      expect(reactionButton).toBeInTheDocument();

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      // Act: Get like button
      const likeButton = screen.getByTitle("LikeDiv");
      expect(likeButton).toBeInTheDocument();

      // Act: Click like button to remove reaction
      fireEvent.click(likeButton);

      // Assert: Verify axios delete was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/reaction`, {
          data: {
            mediaId: mockReactionsData.id,
            profileId: defaultProps.profileId,
          },
        });
      });

      // Assert: Verify the useReactions mutate function was called
      expect(mockMutateReactions).toHaveBeenCalled();
    });

    // Test case for removing an existing dislike reaction
    it("should remove dislike reaction when dislike button is clicked on already disliked media", async () => {
      // Mock the useReactions hook to return a liked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "disliked" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");
      expect(reactionButton).toBeInTheDocument();

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("DislikeDiv")).toBeInTheDocument();
      });

      // Act: Get like button
      const disLikeButton = screen.getByTitle("DislikeDiv");
      expect(disLikeButton).toBeInTheDocument();

      // Act: Click like button to remove reaction
      fireEvent.click(disLikeButton);

      // Assert: Verify axios delete was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/reaction`, {
          data: {
            mediaId: mockReactionsData.id,
            profileId: defaultProps.profileId,
          },
        });
      });

      // Assert: Verify the useReactions mutate function was called
      expect(mockMutateReactions).toHaveBeenCalled();
    });
    // Test case for removing an existing loved reaction
    it("should remove love reaction when love button is clicked on already loved media", async () => {
      // Mock the useReactions hook to return a liked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "loved" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");
      expect(reactionButton).toBeInTheDocument();

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LoveDiv")).toBeInTheDocument();
      });

      // Act: Get like button
      const loveButton = screen.getByTitle("LoveDiv");
      expect(loveButton).toBeInTheDocument();

      // Act: Click like button to remove reaction
      fireEvent.click(loveButton);

      // Assert: Verify axios delete was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/reaction`, {
          data: {
            mediaId: mockReactionsData.id,
            profileId: defaultProps.profileId,
          },
        });
      });

      // Assert: Verify the useReactions mutate function was called
      expect(mockMutateReactions).toHaveBeenCalled();
    });
  });

  // Reaction Switching tests
  describe("Reaction Changes - Switching Between Reactions", () => {
    beforeEach(() => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
    });

    // Test Case for switching from like to dislike
    it("should change from like to dislike", async () => {
      // Mock the useReactions hook to return a liked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "liked" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("DislikeDiv")).toBeInTheDocument();
      });
      // Act: Get dislike button
      const dislikeButton = screen.getByTitle("DislikeDiv");

      // Act: Click dislike button to change reaction
      fireEvent.click(dislikeButton);

      // Assert: Verify axios post was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(`/api/reaction`, {
          mediaId: mockReactionsData.id,
          profileId: defaultProps.profileId,
          reactionType: "disliked",
          mediaType: mockReactionsData.mediaType,
          source: defaultProps.source,
        });
      });
    });

    // Test Case for switching from like to love
    it("should change from like to love", async () => {
      // Mock the useReactions hook to return a liked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "liked" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LoveDiv")).toBeInTheDocument();
      });
      // Act: Get love button
      const loveButton = screen.getByTitle("LoveDiv");

      // Act: Click love button to change reaction
      fireEvent.click(loveButton);

      // Assert: Verify axios post was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(`/api/reaction`, {
          mediaId: mockReactionsData.id,
          profileId: defaultProps.profileId,
          reactionType: "loved",
          mediaType: mockReactionsData.mediaType,
          source: defaultProps.source,
        });
      });
    });

    // Test Case for switching from dislike to like
    it("should change from dislike to like", async () => {
      // Mock the useReactions hook to return a disliked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "disliked" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      // Act: Get like button
      const likeButton = screen.getByTitle("LikeDiv");
      expect(likeButton).toBeInTheDocument();

      // Act: Click like button to change reaction
      fireEvent.click(likeButton);

      //Assert: Verify axios post was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(`/api/reaction`, {
          mediaId: mockReactionsData.id,
          profileId: defaultProps.profileId,
          reactionType: "liked",
          mediaType: mockReactionsData.mediaType,
          source: defaultProps.source,
        });
      });
    });

    // Test Case for switching from dislike to love
    it("should change from dislike to love", async () => {
      // Mock the useReactions hook to return a disliked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "disliked" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LoveDiv")).toBeInTheDocument();
      });

      // Act: Get love button
      const loveButton = screen.getByTitle("LoveDiv");

      // Act: Click love button to change reaction
      fireEvent.click(loveButton);

      //Assert: Verify axios post was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(`/api/reaction`, {
          mediaId: mockReactionsData.id,
          profileId: defaultProps.profileId,
          reactionType: "loved",
          mediaType: mockReactionsData.mediaType,
          source: defaultProps.source,
        });
      });
    });
    // Test Case for switching from dislike to like
    it("should change from love to like", async () => {
      // Mock the useReactions hook to return a disliked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "loved" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      // Act: Get like button
      const likeButton = screen.getByTitle("LikeDiv");

      // Act: Click like button to change reaction
      fireEvent.click(likeButton);

      //Assert: Verify axios post was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(`/api/reaction`, {
          mediaId: mockReactionsData.id,
          profileId: defaultProps.profileId,
          reactionType: "liked",
          mediaType: mockReactionsData.mediaType,
          source: defaultProps.source,
        });
      });
    });

    // Test Case for switching from dislike to love
    it("should change from love to dislike", async () => {
      // Mock the useReactions hook to return a disliked reaction
      mockUseReactions.mockReturnValue({
        data: [{ ...mockReactionsData, reactionType: "loved" }],
        error: null,
        isLoading: false,
        mutate: mockMutateReactions,
      });

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByTitle("DislikeDiv")).toBeInTheDocument();
      });

      // Act: Get dislike button
      const dislikeButton = screen.getByTitle("DislikeDiv");

      // Act: Click dislike button to change reaction
      fireEvent.click(dislikeButton);

      //Assert: Verify axios post was called with correct parameters
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(`/api/reaction`, {
          mediaId: mockReactionsData.id,
          profileId: defaultProps.profileId,
          reactionType: "disliked",
          mediaType: mockReactionsData.mediaType,
          source: defaultProps.source,
        });
      });
    });
  });

  // Loading State tests
  describe("Loading States", () => {
    // Test case to confim multipl clicks are prevented when loading
    it("should prevent multiple clicks during loading", async () => {
      // Mock a delayed API response
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      // Arrange: Render Component
      render(<ReactionsButton {...defaultProps} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");

      // Act: Simulate hover to show reaction options
      fireEvent.mouseEnter(reactionButton);

      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      // Act: Get like button
      const likeButton = screen.getByTitle("LikeDiv");

      // Act: Click like button multiple times rapidly
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);

      // Assert: Verify axios post was called only once
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Props Variations tests
  describe("Props Variations", () => {
    // Test case for different media type
    it("should work with TV show media type", async () => {
      // Mock axios post response
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      // Arrange: Render Component with mediaType as 'tv'
      render(<ReactionsButton {...defaultProps} mediaType="tv" />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");
      fireEvent.mouseEnter(reactionButton);

      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("LikeDiv"));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/reaction", {
          mediaId: "123",
          profileId: "1",
          mediaType: "tv",
          reactionType: "liked",
          source: "tmdb",
        });
      });
    });

    // Test case for different source
    it("should work with local source", async () => {
      // Mock axios post response
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      // Arrange: Render Component with mediaType as 'tv'
      render(<ReactionsButton {...defaultProps} source="local" />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");
      fireEvent.mouseEnter(reactionButton);

      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("LikeDiv"));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/reaction", {
          mediaId: "123",
          profileId: "1",
          mediaType: "movie",
          reactionType: "liked",
          source: "local",
        });
      });
    });

    // Test case for different mediaID data type
    it("should work with numeric mediaId", async () => {
      // Mock axios post response
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      // Arrange: Render Component with mediaType as 'tv'
      render(<ReactionsButton {...defaultProps} mediaId={456} />);

      // Act: Get default reaction button
      const reactionButton = screen.getByTestId("reactions-button");
      fireEvent.mouseEnter(reactionButton);

      await waitFor(() => {
        expect(screen.getByTitle("LikeDiv")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("LikeDiv"));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/reaction", {
          mediaId: 456,
          profileId: "1",
          mediaType: "movie",
          reactionType: "liked",
          source: "tmdb",
        });
      });
    });
  });
});
