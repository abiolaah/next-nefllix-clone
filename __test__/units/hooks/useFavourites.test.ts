// __test__/hooks/useFavourites.test.ts
import { renderHook } from "@testing-library/react";
import useFavourites from "@/hooks/useFavourites";
import useSWR from "swr";
import { MediaItem } from "@/lib/types/api";

// Mock SWR
jest.mock("swr");
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

describe("useFavourites Hook", () => {
  const mockMutate = jest.fn();

  // Mock favourites data
  const mockFavouritesData: (MediaItem & { source: "local" | "tmdb" })[] = [
    {
      id: "1",
      title: "The Matrix",
      description: "A computer hacker learns about the true nature of reality.",
      thumbnailUrl: "https://example.com/matrix.jpg",
      videoUrl: "https://example.com/matrix.mp4",
      trailerUrl: "https://example.com/matrix-trailer.mp4",
      genre: ["Action", "Sci-Fi"],
      rating: 8.7,
      duration: "136m",
      isAdult: false,
      isTvShow: false,
      source: "tmdb",
    },
    {
      id: "2",
      title: "Breaking Bad",
      description: "A chemistry teacher turned meth producer.",
      thumbnailUrl: "https://example.com/bb.jpg",
      videoUrl: "https://example.com/bb.mp4",
      trailerUrl: "https://example.com/bb-trailer.mp4",
      genre: ["Crime", "Drama"],
      rating: 9.5,
      numberOfSeasons: 5,
      isAdult: true,
      isTvShow: true,
      source: "local",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear();
  });

  describe("Initial State and Basic Functionality", () => {
    it("should return empty array when no profileId is provided", () => {
      // Mock SWR to not be called (null key)
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites());

      expect(result.current.data).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it("should return empty array when profileId is undefined", () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites(undefined));

      expect(result.current.data).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it("should return empty array when profileId is empty string", () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites(""));

      expect(result.current.data).toEqual([]);
    });
  });

  describe("Data Fetching", () => {
    it("should fetch favourites when profileId is provided", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.data).toEqual(mockFavouritesData);
      expect(result.current.data).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it("should call useSWR with correct URL when profileId is provided", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      renderHook(() => useFavourites("profile-123"));

      expect(mockUseSWR).toHaveBeenCalledWith(
        "/api/favourites?profileId=profile-123",
        expect.any(Function),
        expect.objectContaining({
          revalidateIfStale: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          shouldRetryOnError: false,
        })
      );
    });

    it("should call useSWR with null key when profileId is not provided", () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      renderHook(() => useFavourites());

      expect(mockUseSWR).toHaveBeenCalledWith(
        null,
        expect.any(Function),
        expect.any(Object)
      );
    });

    it("should return favourites with correct data structure", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      // Check that returned data has required MediaItem properties
      expect(result.current.data[0]).toHaveProperty("id");
      expect(result.current.data[0]).toHaveProperty("title");
      expect(result.current.data[0]).toHaveProperty("source");
      expect(result.current.data[0]).toHaveProperty("genre");
      expect(result.current.data[0]).toHaveProperty("rating");
    });
  });

  describe("Loading State", () => {
    it("should return loading state correctly", () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: true,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);
    });

    it("should transition from loading to loaded state", () => {
      // Start with loading state
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: true,
        mutate: mockMutate,
      });

      const { result, rerender } = renderHook(() =>
        useFavourites("profile-123")
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);

      // Simulate data loaded
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      rerender();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockFavouritesData);
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", () => {
      const mockError = new Error("Failed to fetch favourites");

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle network errors", () => {
      const networkError = new Error("Network error");

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: networkError,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.error).toEqual(networkError);
      expect(result.current.data).toEqual([]);
    });

    it("should handle 500 server errors without retrying", () => {
      const serverError = new Error("Internal Server Error");

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: serverError,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      renderHook(() => useFavourites("profile-123"));

      // Verify shouldRetryOnError is set to false
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.objectContaining({
          shouldRetryOnError: false,
        })
      );
    });

    it("should return empty array when error occurs", () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error("Some error"),
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.data).toEqual([]);
      expect(result.current.data).toHaveLength(0);
    });
  });

  describe("Data Mutations", () => {
    it("should expose mutate function", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.mutate).toBe(mockMutate);
      expect(typeof result.current.mutate).toBe("function");
    });

    it("should allow data mutation through mutate function", async () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      result.current.mutate();

      expect(mockMutate).toHaveBeenCalled();
    });
  });

  describe("SWR Configuration", () => {
    it("should configure SWR with correct options", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      renderHook(() => useFavourites("profile-123"));

      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        {
          revalidateIfStale: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          shouldRetryOnError: false,
        }
      );
    });

    it("should not revalidate on stale data", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      renderHook(() => useFavourites("profile-123"));

      const config = mockUseSWR.mock.calls[0][2];
      expect(config).toHaveProperty("revalidateIfStale", false);
    });

    it("should not revalidate on focus", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      renderHook(() => useFavourites("profile-123"));

      const config = mockUseSWR.mock.calls[0][2];
      expect(config).toHaveProperty("revalidateOnFocus", false);
    });

    it("should not revalidate on reconnect", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      renderHook(() => useFavourites("profile-123"));

      const config = mockUseSWR.mock.calls[0][2];
      expect(config).toHaveProperty("revalidateOnReconnect", false);
    });
  });

  describe("Edge Cases and Special Scenarios", () => {
    it("should handle empty favourites array", () => {
      mockUseSWR.mockReturnValue({
        data: [],
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.data).toEqual([]);
      expect(result.current.data).toHaveLength(0);
    });

    it("should handle null data gracefully", () => {
      mockUseSWR.mockReturnValue({
        data: null,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.data).toEqual([]);
    });

    it("should handle undefined data gracefully", () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.data).toEqual([]);
    });

    it("should work with different profileId formats", () => {
      const profileIds = ["profile-123", "abc123", "user_456", "12345"];

      profileIds.forEach((profileId) => {
        mockUseSWR.mockReturnValue({
          data: mockFavouritesData,
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: mockMutate,
        });

        const { result } = renderHook(() => useFavourites(profileId));

        expect(result.current.data).toEqual(mockFavouritesData);
        expect(mockUseSWR).toHaveBeenCalledWith(
          `/api/favourites?profileId=${profileId}`,
          expect.any(Function),
          expect.any(Object)
        );
      });
    });

    it("should handle favourites with both local and tmdb sources", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.data[0].source).toBe("tmdb");
      expect(result.current.data[1].source).toBe("local");
    });

    it("should handle favourites with movies and TV shows", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useFavourites("profile-123"));

      expect(result.current.data[0].isTvShow).toBe(false);
      expect(result.current.data[1].isTvShow).toBe(true);
    });
  });

  describe("Re-render Behavior", () => {
    it("should maintain data consistency across re-renders", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result, rerender } = renderHook(() =>
        useFavourites("profile-123")
      );

      const initialData = result.current.data;
      rerender();

      expect(result.current.data).toEqual(initialData);
    });

    it("should update when profileId changes", () => {
      mockUseSWR.mockReturnValue({
        data: mockFavouritesData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { rerender } = renderHook(
        ({ profileId }) => useFavourites(profileId),
        { initialProps: { profileId: "profile-123" } }
      );

      expect(mockUseSWR).toHaveBeenCalledWith(
        "/api/favourites?profileId=profile-123",
        expect.any(Function),
        expect.any(Object)
      );

      rerender({ profileId: "profile-456" });

      expect(mockUseSWR).toHaveBeenCalledWith(
        "/api/favourites?profileId=profile-456",
        expect.any(Function),
        expect.any(Object)
      );
    });
  });
});
