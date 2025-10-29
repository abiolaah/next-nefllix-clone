// __test__/hooks/useProfile.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import useProfile from "@/hooks/useProfile";
import useCurrentUser from "@/hooks/useCurrentUser";
import { KeyedMutator } from "swr";

// Mock dependencies
jest.mock("@/hooks/useCurrentUser");
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<
  () => {
    data: unknown;
    error: unknown;
    isLoading: boolean;
    mutate: KeyedMutator<unknown>;
  }
>;

// Mock zustand persist
jest.mock("zustand/middleware", () => ({
  persist: (config: unknown) => config,
}));

describe("useProfile Hook", () => {
  const mockMutate = jest.fn();

  // Mock user data with profiles
  const mockUserWithProfiles = {
    id: "user-1",
    email: "test@example.com",
    profiles: [
      {
        id: "profile-1",
        name: "John Doe",
        avatar: "https://example.com/avatar1.png",
      },
      {
        id: "profile-2",
        name: "Jane Doe",
        avatar: "https://example.com/avatar2.png",
      },
      {
        id: "profile-3",
        name: "Kid Profile",
        avatar: "https://example.com/avatar3.png",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear();

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe("Initial State", () => {
    it("should initialize with null values when no data exists", () => {
      mockUseCurrentUser.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      expect(result.current.currentProfileId).toBeNull();
      expect(result.current.currentProfile).toBeNull();
    });

    it("should provide setter functions", () => {
      mockUseCurrentUser.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      expect(typeof result.current.setCurrentProfileId).toBe("function");
      expect(typeof result.current.setCurrentProfile).toBe("function");
    });

    it("should not set profile when currentUser is undefined", () => {
      mockUseCurrentUser.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      expect(result.current.currentProfile).toBeNull();
    });

    it("should not set profile when currentUser has no profiles", () => {
      mockUseCurrentUser.mockReturnValue({
        data: { id: "user-1", email: "test@example.com", profiles: [] },
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      expect(result.current.currentProfile).toBeNull();
    });
  });

  describe("Setting Profile ID", () => {
    it("should set profile ID correctly", () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      expect(result.current.currentProfileId).toBe("profile-1");
    });

    it("should update currentProfile when profileId is set", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-2");
      });

      await waitFor(() => {
        expect(result.current.currentProfile).toEqual({
          id: "profile-2",
          name: "Jane Doe",
          avatar: "https://example.com/avatar2.png",
        });
      });
    });

    it("should handle setting profile ID to null", () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      expect(result.current.currentProfileId).toBe("profile-1");

      act(() => {
        result.current.setCurrentProfileId(null);
      });

      expect(result.current.currentProfileId).toBeNull();
    });

    it("should switch between different profile IDs", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      // Set first profile
      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      await waitFor(() => {
        expect(result.current.currentProfileId).toBe("profile-1");
        expect(result.current.currentProfile?.name).toBe("John Doe");
      });

      // Switch to second profile
      act(() => {
        result.current.setCurrentProfileId("profile-2");
      });

      await waitFor(() => {
        expect(result.current.currentProfileId).toBe("profile-2");
        expect(result.current.currentProfile?.name).toBe("Jane Doe");
      });
    });
  });

  describe("Setting Profile Object", () => {
    it("should set profile object directly", () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      const newProfile = {
        id: "profile-1",
        name: "John Doe",
        avatar: "https://example.com/avatar1.png",
      };

      act(() => {
        result.current.setCurrentProfile(newProfile);
      });

      expect(result.current.currentProfile).toEqual(newProfile);
    });

    it("should handle setting profile to null", () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfile({
          id: "profile-1",
          name: "John Doe",
          avatar: "https://example.com/avatar1.png",
        });
      });

      expect(result.current.currentProfile).not.toBeNull();

      act(() => {
        result.current.setCurrentProfile(null);
      });

      expect(result.current.currentProfile).toBeNull();
    });
  });

  describe("Profile Auto-Selection", () => {
    it("should auto-select profile from user data when profileId is set", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-3");
      });

      await waitFor(() => {
        expect(result.current.currentProfile).toEqual({
          id: "profile-3",
          name: "Kid Profile",
          avatar: "https://example.com/avatar3.png",
        });
      });
    });

    it("should fallback to first profile if profileId not found", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("non-existent-profile");
      });

      await waitFor(() => {
        expect(result.current.currentProfile).toEqual(
          mockUserWithProfiles.profiles[0]
        );
      });
    });

    it("should update profile when user data changes", async () => {
      // Start with initial user data
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result, rerender } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      await waitFor(() => {
        expect(result.current.currentProfile?.name).toBe("John Doe");
      });

      // Update user data with modified profile
      const updatedUser = {
        ...mockUserWithProfiles,
        profiles: [
          {
            id: "profile-1",
            name: "John Smith", // Changed name
            avatar: "https://example.com/new-avatar.png",
          },
          ...mockUserWithProfiles.profiles.slice(1),
        ],
      };

      mockUseCurrentUser.mockReturnValue({
        data: updatedUser,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      rerender();

      await waitFor(() => {
        expect(result.current.currentProfile?.name).toBe("John Smith");
        expect(result.current.currentProfile?.avatar).toBe(
          "https://example.com/new-avatar.png"
        );
      });
    });
  });

  describe("useEffect Behavior", () => {
    it("should not trigger effect when currentUser is null", () => {
      mockUseCurrentUser.mockReturnValue({
        data: null,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      expect(result.current.currentProfile).toBeNull();
    });

    it("should not trigger effect when profileId is null", () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      // Don't set profileId, keep it null
      expect(result.current.currentProfile).toBeNull();
    });

    it("should trigger effect when both currentUser and profileId exist", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      await waitFor(() => {
        expect(result.current.currentProfile).not.toBeNull();
        expect(result.current.currentProfile?.id).toBe("profile-1");
      });
    });
  });

  describe("Data Consistency", () => {
    it("should maintain profile data across re-renders", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result, rerender } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      await waitFor(() => {
        expect(result.current.currentProfile?.id).toBe("profile-1");
      });

      const initialProfile = result.current.currentProfile;
      rerender();

      expect(result.current.currentProfile).toEqual(initialProfile);
    });

    it("should keep profileId and currentProfile in sync", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-2");
      });

      await waitFor(() => {
        expect(result.current.currentProfileId).toBe("profile-2");
        expect(result.current.currentProfile?.id).toBe("profile-2");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with single profile", async () => {
      const singleProfileUser = {
        id: "user-1",
        email: "test@example.com",
        profiles: [
          {
            id: "profile-1",
            name: "Solo User",
            avatar: "https://example.com/avatar.png",
          },
        ],
      };

      mockUseCurrentUser.mockReturnValue({
        data: singleProfileUser,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      await waitFor(() => {
        expect(result.current.currentProfile).toEqual(
          singleProfileUser.profiles[0]
        );
      });
    });

    it("should handle empty profiles array gracefully", () => {
      mockUseCurrentUser.mockReturnValue({
        data: {
          id: "user-1",
          email: "test@example.com",
          profiles: [],
        },
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      expect(result.current.currentProfile).toBeNull();
    });

    it("should handle profiles without required properties", async () => {
      const incompleteUser = {
        id: "user-1",
        email: "test@example.com",
        profiles: [
          {
            id: "profile-1",
            name: "User",
            // Missing avatar
          },
        ],
      };

      mockUseCurrentUser.mockReturnValue({
        data: incompleteUser,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      await waitFor(() => {
        expect(result.current.currentProfile?.id).toBe("profile-1");
      });
    });

    it("should handle rapid profile switches", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      // Rapidly switch between profiles
      act(() => {
        result.current.setCurrentProfileId("profile-1");
        result.current.setCurrentProfileId("profile-2");
        result.current.setCurrentProfileId("profile-3");
      });

      await waitFor(() => {
        expect(result.current.currentProfileId).toBe("profile-3");
        expect(result.current.currentProfile?.id).toBe("profile-3");
      });
    });
  });

  describe("State Management", () => {
    it("should maintain independent state for multiple hook instances", () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result: result1 } = renderHook(() => useProfile());
      const { result: result2 } = renderHook(() => useProfile());

      // Both should have the same initial state
      expect(result1.current.currentProfileId).toBe(
        result2.current.currentProfileId
      );
    });

    it("should share state changes across multiple hook instances", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result: result1 } = renderHook(() => useProfile());
      const { result: result2 } = renderHook(() => useProfile());

      act(() => {
        result1.current.setCurrentProfileId("profile-1");
      });

      await waitFor(() => {
        // Both instances should reflect the same state
        expect(result1.current.currentProfileId).toBe("profile-1");
        expect(result2.current.currentProfileId).toBe("profile-1");
      });
    });
  });

  describe("Loading States", () => {
    it("should handle loading state from useCurrentUser", () => {
      mockUseCurrentUser.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      expect(result.current.currentProfile).toBeNull();
      expect(result.current.currentProfileId).toBeNull();
    });

    it("should update when user data finishes loading", async () => {
      // Start with loading state
      mockUseCurrentUser.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: mockMutate,
      });

      const { result, rerender } = renderHook(() => useProfile());

      // Set profileId during loading
      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      expect(result.current.currentProfile).toBeNull();

      // Update to loaded state
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      rerender();

      await waitFor(() => {
        expect(result.current.currentProfile).not.toBeNull();
        expect(result.current.currentProfile?.id).toBe("profile-1");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle error state from useCurrentUser", () => {
      mockUseCurrentUser.mockReturnValue({
        data: undefined,
        error: new Error("Failed to fetch user"),
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      expect(result.current.currentProfile).toBeNull();
      expect(result.current.currentProfileId).toBeNull();
    });

    it("should not crash when user data structure is unexpected", () => {
      mockUseCurrentUser.mockReturnValue({
        data: { id: "user-1" }, // Missing profiles property
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      expect(() => {
        act(() => {
          result.current.setCurrentProfileId("profile-1");
        });
      }).not.toThrow();
    });
  });

  describe("Profile Validation", () => {
    it("should validate profile exists in user profiles", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-2");
      });

      await waitFor(() => {
        const profile = result.current.currentProfile;
        const userProfiles = mockUserWithProfiles.profiles;

        expect(userProfiles.some((p) => p.id === profile?.id)).toBe(true);
      });
    });

    it("should ensure selected profile matches profileId", async () => {
      mockUseCurrentUser.mockReturnValue({
        data: mockUserWithProfiles,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() => useProfile());

      act(() => {
        result.current.setCurrentProfileId("profile-1");
      });

      await waitFor(() => {
        expect(result.current.currentProfileId).toBe(
          result.current.currentProfile?.id
        );
      });
    });
  });
});
