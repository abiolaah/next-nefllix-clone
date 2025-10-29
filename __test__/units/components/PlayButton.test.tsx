// PlayButton.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PlayButton from "@/components/PlayButton";
import { useRouter } from "next/router";

// Mock the next/router module
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

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
describe("PlayButton", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      ...mockRouter,
      push: mockPush,
    });
  });

  it("renders play button with icon", () => {
    render(<PlayButton movieId="123" />);

    const button = screen.getByRole("button", { name: /play/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("navigates to watch page when clicked", () => {
    render(<PlayButton movieId="123" />);

    const button = screen.getByRole("button", { name: /play/i });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/watch/123");
  });
});
