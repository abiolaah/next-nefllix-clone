import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { signOut } from "next-auth/react";
import { NextRouter, useRouter } from "next/router";
import AccountMenu from "@/components/AccountMenu";
import useCurrentUser from "@/hooks/useCurrentUser";
import useProfile from "@/hooks/useProfile";
import { KeyedMutator } from "swr";

jest.mock("next-auth/react");
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/useCurrentUser");
jest.mock("@/hooks/useProfile");

// Type the mocks for the typescript
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<
  typeof useCurrentUser
>;
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock console.error to suppress jsdom navigation warnings
const originalConsoleError = console.error;

describe("AccountMenu", () => {
  // Create a complete mock router object
  const mockRouter: NextRouter = {
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
    basePath: "",
    push: jest.fn(),
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

  // Create a properly typed mock mutate function
  const mockMutate: KeyedMutator<unknown> = jest.fn();

  // Mock setCurrentProfileId function
  const mockSetCurrentProfileId = jest.fn();

  beforeAll(() => {
    // Suppress console.error for jsdom navigation warnings
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Error: Not implemented: navigation")
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
  });

  afterAll(() => {
    // Restore original console.error
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Reset setCurrentProfileId mock
    mockSetCurrentProfileId.mockClear();

    // Setup the router mock
    mockUseRouter.mockReturnValue(mockRouter);

    // Setup the useCurrentUser mock with all required properties
    mockUseCurrentUser.mockReturnValue({
      data: {
        profiles: [
          {
            id: "1",
            name: "Profile 1",
            avatar:
              "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696100/default-blue_oqkthi.png",
          },
          {
            id: "2",
            name: "Profile 2",
            avatar:
              "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696101/default-red_nnlh94.png",
          },
        ],
      },
      error: null,
      isLoading: false,
      mutate: mockMutate,
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
  });

  it("should render nothing when component is not visible", () => {
    const { container } = render(<AccountMenu visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render current profile when visible", () => {
    render(<AccountMenu visible={true} />);

    // Find by text within the profile container
    const profileElement = screen.getByText((content, element) => {
      // Check if the element has the profile name text and is within a profile container
      return (
        content === "Profile 1" &&
        element?.closest('div[class*="group/item"]') !== null
      );
    });
    expect(profileElement).toBeInTheDocument();
  });

  it("should renders other profiles when visible", () => {
    // ARRANGE
    render(<AccountMenu visible={true} />);

    // ACT
    // Find the other profile by text within the profile container
    const profileElement = screen.getByText((content, element) => {
      return (
        content === "Profile 2" &&
        element?.closest('div[class*="group/item"]') !== null
      );
    });

    // ASSERT
    expect(profileElement).toBeInTheDocument();
  });

  it("should properly handle profile switch", async () => {
    render(<AccountMenu visible={true} />);
    const profile2Element = screen.getByText((content, element) => {
      return (
        content === "Profile 2" &&
        element?.closest('div[class*="group/item"]') !== null
      );
    });

    fireEvent.click(profile2Element);

    // ASSERT
    await waitFor(() => {
      expect(mockSetCurrentProfileId).toHaveBeenCalledWith("2");
    });
  });

  it("should properly handle sign out", () => {
    render(<AccountMenu visible={true} />);
    fireEvent.click(screen.getByText("Sign out of Netflix"));
    expect(signOut).toHaveBeenCalled();
  });
});
