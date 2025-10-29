// MobileMenu.test.tsx
import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import MobileMenu from "@/components/MobileMenu";

// Mock the next/router module
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("MobileMenu", () => {
  // Create mock functions and objects
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    pathname: "/",
    query: {},
    asPath: "/",
  };

  // Mock the useRouter hook implementation
  const mockUseRouter = useRouter as jest.Mock;
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      ...mockRouter,
      push: mockPush,
    });
  });

  it("renders nothing when not visible", () => {
    render(<MobileMenu visible={false} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders navigation items when visible", () => {
    render(<MobileMenu visible={true} />);

    // Assuming navItem contains items like 'Home', 'Movies', etc.
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Movies")).toBeInTheDocument();
  });
});
