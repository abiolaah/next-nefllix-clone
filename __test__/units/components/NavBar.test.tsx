import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "@/components/Navbar";

// Mock the useProfile hook
jest.mock("@/hooks/useProfile", () => ({
  __esModule: true,
  default: () => ({
    currentProfile: {
      name: "Test User",
      avatar: "https://example.com/avatar.jpg",
    },
  }),
}));

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: () => ({
    pathname: "/",
    query: {},
    push: jest.fn(),
  }),
}));

describe("Navbar Component", () => {
  it("renders logo correctly", () => {
    render(<Navbar />);

    // Check for logo (alternative to checking text that might change)
    const logo = screen.getByAltText("Streaming Service Logo");
    expect(logo).toBeInTheDocument();
  });

  it("renders search correctly", () => {
    render(<Navbar />);

    // Check for search icon
    const searchIcon = screen.getByRole("button", { name: /search/i });
    expect(searchIcon).toBeInTheDocument();
  });
});
