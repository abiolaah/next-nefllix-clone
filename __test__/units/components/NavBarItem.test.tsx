import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import NavbarItem from "@/components/NavbarItem";
import { useRouter } from "next/router";
import { navItem } from "@/constants/navItem";

// Mock the Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("NavBarItem Components", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up the router mock
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    // Clear push
    mockPush.mockClear();
  });

  describe("Render labels correctly", () => {
    it.each(navItem)('renders "$name" nav item', ({ name, link }) => {
      render(<NavbarItem label={name} link={link} />);
      const navItemElement = screen.getByText(name);
      expect(navItemElement).toBeInTheDocument();
      expect(navItemElement).toHaveClass("text-white");
      expect(navItemElement).toHaveClass("cursor-pointer");
      expect(navItemElement).toHaveClass("hover:text-gray-300");
    });
  });

  describe("Handles click correctly", () => {
    it.each(navItem)(
      'simulates click on "$name" nav item',
      ({ name, link }) => {
        render(<NavbarItem label={name} link={link} />);
        const navItemElement = screen.getByText(name);
        fireEvent.click(navItemElement);
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith(link);
      }
    );
  });
});
