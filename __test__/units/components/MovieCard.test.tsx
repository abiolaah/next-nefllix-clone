import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MovieCard from "@/components/MovieCard";
import { NextRouter, useRouter } from "next/router";
import useInfoModal from "@/hooks/useInfoModal";
import useProfile from "@/hooks/useProfile";

// Mock the hooks
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/useInfoModal");
jest.mock("@/hooks/useProfile");

// Mock variables
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseInfoModal = useInfoModal as jest.MockedFunction<
  typeof useInfoModal
>;
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;

// Mock the child components that might cause issues
jest.mock("@/components/FavouriteButton", () => {
  return function MockFavouriteButton() {
    return <button data-testid="favourite-button">Favourite</button>;
  };
});

jest.mock("@/components/ReactionsButton", () => {
  return function MockReactionsButton() {
    return <button data-testid="reactions-button">Reactions</button>;
  };
});

jest.mock("@/lib/useExpandedPosition", () => ({
  useExpandedPosition: () => ({
    getPosition: () => ({ top: 0, left: 0 }),
  }),
}));

// Test Suite for MovieCard component
describe("MovieCard Component", () => {
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

  // Complete mock data for movie details
  const mockMovieDetails = {
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
  };

  // Complete mock data for tv details
  const mockTvDetails = {
    id: "456",
    title: "The Last Kingdom",
    description:
      "As Alfred the Great defends his kingdom from Norse invaders, Uhtred--born a Saxon but raised by Vikings--seeks to claim his ancestral birthright.",
    videoUrl:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl:
      "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
    trailerUrl:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    genre: ["Action", "Drama", "History"],
    rating: 8.8,
    numberOfSeasons: 5,
    isAdult: false,
    isTvShow: true as const,
    seasons: [
      {
        id: "s1",
        seasonNumber: 1,
        episodes: [
          {
            id: "s1e1",
            episodeType: "Regular",
            episodeNumber: 1,
            name: "Episode 1",
            description:
              "After his father is killed, young Uhtred is captured by the Danes and raised as one of their own.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
          {
            id: "s1e2",
            episodeType: "Regular",
            episodeNumber: 2,
            name: "Episode 2",
            description:
              "Uhtred begins to question his loyalties as the Danes prepare to attack his ancestral home.",
            duration: "56 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
          {
            id: "s1e3",
            episodeType: "Regular",
            episodeNumber: 3,
            name: "Episode 3",
            description:
              "Uhtred must prove his worth to the Danes while struggling with his Saxon heritage.",
            duration: "55 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
          {
            id: "s1e4",
            episodeType: "Regular",
            episodeNumber: 4,
            name: "Episode 4",
            description:
              "Alfred's kingdom is threatened as Uhtred finds himself torn between two worlds.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
          {
            id: "s1e5",
            episodeType: "Regular",
            episodeNumber: 5,
            name: "Episode 5",
            description:
              "Uhtred's loyalties are tested as the conflict between Saxons and Danes escalates.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
          {
            id: "s1e6",
            episodeType: "Regular",
            episodeNumber: 6,
            name: "Episode 6",
            description:
              "A major battle looms as Uhtred must make a decisive choice about his future.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
          {
            id: "s1e7",
            episodeType: "Regular",
            episodeNumber: 7,
            name: "Episode 7",
            description:
              "Uhtred takes on a dangerous mission that could change the course of the war.",
            duration: "56 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
          {
            id: "s1e8",
            episodeType: "Regular",
            episodeNumber: 8,
            name: "Episode 8",
            description:
              "The conflict reaches a boiling point as Uhtred's past comes back to haunt him.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
          {
            id: "s1e9",
            episodeType: "Regular",
            episodeNumber: 9,
            name: "Episode 9",
            description:
              "Uhtred faces his greatest challenge yet as the fate of the kingdom hangs in balance.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
          {
            id: "s1e10",
            episodeType: "Regular",
            episodeNumber: 10,
            name: "Episode 10",
            description:
              "The season concludes with dramatic revelations and a cliffhanger for Uhtred's future.",
            duration: "60 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s1",
          },
        ],
        tvShowId: "456",
      },
      {
        id: "s2",
        seasonNumber: 2,
        episodes: [
          {
            id: "s2e1",
            episodeType: "Regular",
            episodeNumber: 1,
            name: "Episode 1",
            description:
              "Uhtred returns to Wessex but finds himself caught between Alfred's plans and his own desires.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
          {
            id: "s2e2",
            episodeType: "Regular",
            episodeNumber: 2,
            name: "Episode 2",
            description:
              "New alliances form as Uhtred seeks to reclaim his ancestral lands.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
          {
            id: "s2e3",
            episodeType: "Regular",
            episodeNumber: 3,
            name: "Episode 3",
            description:
              "Uhtred's military prowess is put to the test against a formidable new enemy.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
          {
            id: "s2e4",
            episodeType: "Regular",
            episodeNumber: 4,
            name: "Episode 4",
            description:
              "Political intrigue deepens as Uhtred navigates the dangerous Saxon court.",
            duration: "56 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
          {
            id: "s2e5",
            episodeType: "Regular",
            episodeNumber: 5,
            name: "Episode 5",
            description:
              "A shocking betrayal forces Uhtred to reconsider all his alliances.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
          {
            id: "s2e6",
            episodeType: "Regular",
            episodeNumber: 6,
            name: "Episode 6",
            description:
              "Uhtred leads a daring mission that could turn the tide of the war.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
          {
            id: "s2e7",
            episodeType: "Regular",
            episodeNumber: 7,
            name: "Episode 7",
            description:
              "The conflict escalates as Uhtred's personal and political loyalties collide.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
          {
            id: "s2e8",
            episodeType: "Regular",
            episodeNumber: 8,
            name: "Episode 8",
            description:
              "Uhtred faces a moral dilemma that could cost him everything he's fought for.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
          {
            id: "s2e9",
            episodeType: "Regular",
            episodeNumber: 9,
            name: "Episode 9",
            description:
              "The season builds to a climactic confrontation with far-reaching consequences.",
            duration: "60 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
          {
            id: "s2e10",
            episodeType: "Regular",
            episodeNumber: 10,
            name: "Episode 10",
            description:
              "The season finale leaves Uhtred's future uncertain as new threats emerge.",
            duration: "61 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s2",
          },
        ],
        tvShowId: "456",
      },
      {
        id: "s3",
        seasonNumber: 3,
        episodes: [
          {
            id: "s3e1",
            episodeType: "Regular",
            episodeNumber: 1,
            name: "Episode 1",
            description:
              "Uhtred finds himself in exile, plotting his return to reclaim his birthright.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
          {
            id: "s3e2",
            episodeType: "Regular",
            episodeNumber: 2,
            name: "Episode 2",
            description:
              "Uhtred gathers allies for his cause while Alfred's health deteriorates.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
          {
            id: "s3e3",
            episodeType: "Regular",
            episodeNumber: 3,
            name: "Episode 3",
            description:
              "A new threat emerges from the north as Uhtred's plans take shape.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
          {
            id: "s3e4",
            episodeType: "Regular",
            episodeNumber: 4,
            name: "Episode 4",
            description:
              "Uhtred's military campaign begins, but unexpected obstacles arise.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
          {
            id: "s3e5",
            episodeType: "Regular",
            episodeNumber: 5,
            name: "Episode 5",
            description:
              "Personal losses shake Uhtred as the war takes its toll.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
          {
            id: "s3e6",
            episodeType: "Regular",
            episodeNumber: 6,
            name: "Episode 6",
            description:
              "A major battle changes the balance of power in the region.",
            duration: "60 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
          {
            id: "s3e7",
            episodeType: "Regular",
            episodeNumber: 7,
            name: "Episode 7",
            description:
              "Uhtred must navigate complex political waters to achieve his goals.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
          {
            id: "s3e8",
            episodeType: "Regular",
            episodeNumber: 8,
            name: "Episode 8",
            description:
              "Old enemies return as Uhtred's campaign reaches a critical point.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
          {
            id: "s3e9",
            episodeType: "Regular",
            episodeNumber: 9,
            name: "Episode 9",
            description:
              "The season builds to a dramatic confrontation with high stakes.",
            duration: "61 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
          {
            id: "s3e10",
            episodeType: "Regular",
            episodeNumber: 10,
            name: "Episode 10",
            description:
              "The season concludes with Uhtred facing an uncertain future.",
            duration: "62 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s3",
          },
        ],
        tvShowId: "456",
      },
      {
        id: "s4",
        seasonNumber: 4,
        episodes: [
          {
            id: "s4e1",
            episodeType: "Regular",
            episodeNumber: 1,
            name: "Episode 1",
            description:
              "Uhtred returns to find his homeland changed and new rulers in place.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
          {
            id: "s4e2",
            episodeType: "Regular",
            episodeNumber: 2,
            name: "Episode 2",
            description:
              "Uhtred must prove his worth to the new Saxon leadership.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
          {
            id: "s4e3",
            episodeType: "Regular",
            episodeNumber: 3,
            name: "Episode 3",
            description:
              "A mysterious threat from the past resurfaces, endangering Uhtred's plans.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
          {
            id: "s4e4",
            episodeType: "Regular",
            episodeNumber: 4,
            name: "Episode 4",
            description:
              "Uhtred takes on a dangerous mission to secure his position.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
          {
            id: "s4e5",
            episodeType: "Regular",
            episodeNumber: 5,
            name: "Episode 5",
            description:
              "Personal relationships are tested as the conflict intensifies.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
          {
            id: "s4e6",
            episodeType: "Regular",
            episodeNumber: 6,
            name: "Episode 6",
            description:
              "Uhtred leads a daring assault that could change the course of the war.",
            duration: "60 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
          {
            id: "s4e7",
            episodeType: "Regular",
            episodeNumber: 7,
            name: "Episode 7",
            description:
              "Betrayal from within threatens to undo all of Uhtred's progress.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
          {
            id: "s4e8",
            episodeType: "Regular",
            episodeNumber: 8,
            name: "Episode 8",
            description:
              "Uhtred must make difficult choices as the conflict reaches a climax.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
          {
            id: "s4e9",
            episodeType: "Regular",
            episodeNumber: 9,
            name: "Episode 9",
            description:
              "The penultimate episode sets the stage for a dramatic conclusion.",
            duration: "61 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
          {
            id: "s4e10",
            episodeType: "Regular",
            episodeNumber: 10,
            name: "Episode 10",
            description:
              "The season finale leaves Uhtred's fate hanging in the balance.",
            duration: "62 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s4",
          },
        ],
        tvShowId: "456",
      },
      {
        id: "s5",
        seasonNumber: 5,
        episodes: [
          {
            id: "s5e1",
            episodeType: "Regular",
            episodeNumber: 1,
            name: "Episode 1",
            description:
              "Uhtred begins his final journey to reclaim his ancestral home.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
          {
            id: "s5e2",
            episodeType: "Regular",
            episodeNumber: 2,
            name: "Episode 2",
            description:
              "Old allies and enemies return as Uhtred's campaign begins.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
          {
            id: "s5e3",
            episodeType: "Regular",
            episodeNumber: 3,
            name: "Episode 3",
            description: "Uhtred faces unexpected challenges to his authority.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
          {
            id: "s5e4",
            episodeType: "Regular",
            episodeNumber: 4,
            name: "Episode 4",
            description:
              "A major battle tests Uhtred's leadership and strategy.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
          {
            id: "s5e5",
            episodeType: "Regular",
            episodeNumber: 5,
            name: "Episode 5",
            description:
              "Personal losses shake Uhtred as the war takes its toll.",
            duration: "57 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
          {
            id: "s5e6",
            episodeType: "Regular",
            episodeNumber: 6,
            name: "Episode 6",
            description:
              "Uhtred must make a fateful decision that will determine his legacy.",
            duration: "60 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
          {
            id: "s5e7",
            episodeType: "Regular",
            episodeNumber: 7,
            name: "Episode 7",
            description:
              "The final conflict begins as Uhtred prepares for his ultimate challenge.",
            duration: "58 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
          {
            id: "s5e8",
            episodeType: "Regular",
            episodeNumber: 8,
            name: "Episode 8",
            description:
              "Uhtred's journey reaches its climax in a dramatic confrontation.",
            duration: "59 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
          {
            id: "s5e9",
            episodeType: "Regular",
            episodeNumber: 9,
            name: "Episode 9",
            description:
              "The penultimate episode sets the stage for the series finale.",
            duration: "61 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
          {
            id: "s5e10",
            episodeType: "Regular",
            episodeNumber: 10,
            name: "Episode 10",
            description:
              "The series concludes with Uhtred's final destiny revealed.",
            duration: "62 minutes",
            videoUrl: "https://youtu.be/YoHD9XEInc0?si=IMRdL31bcfKhXVwK",
            thumbnailUrl:
              "https://m.media-amazon.com/images/M/MV5BMjE1MzYzNjk3OF5BMl5BanBnXkFtZTgwMzk0MzYwNzE@._V1_FMjpg_UX1000_.jpg",
            seasonId: "s5",
          },
        ],
        tvShowId: "456",
      },
    ],
    source: "local" as const,
  };

  // Clear mock function before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset setCurrentProfileId mock
    mockSetCurrentProfileId.mockClear();

    // Set up the router mock
    mockUseRouter.mockReturnValue(mockRouter);

    // Set up the mock useInfoModal hook
    mockUseInfoModal.mockReturnValue({
      openModal: mockSetModalOpen,
      closeModal: mockCloseModal,
      isOpen: true,
      movieId: "123",
      contentType: "movie",
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

  // Test case to check movie information are rendered correctly
  it("renders movie information correctly", () => {
    render(<MovieCard data={mockMovieDetails} />);

    // Check if movie title is rendered
    expect(screen.getByAltText("Big Buck Bunny")).toBeInTheDocument();
  });

  // Test case to check tv show information are rendered correctly
  it("renders tv show information correctly", () => {
    render(<MovieCard data={mockTvDetails} />);

    // Check if movie title is rendered
    expect(screen.getByAltText("The Last Kingdom")).toBeInTheDocument();
  });

  // Test case to show expanded card on hover
  it("shows expanded card on hover", async () => {
    render(<MovieCard data={mockMovieDetails} />);

    const card = screen.getByTestId("movie-card");

    // Simulate mouse enter event
    fireEvent.mouseEnter(card);

    // Wait for the expanded content to appear
    await waitFor(
      () => {
        expect(screen.getByTestId("expanded-card")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(screen.getByText("Big Buck Bunny")).toBeInTheDocument();
    expect(screen.getByText("Comedy")).toBeInTheDocument();
  });

  // Test case to open info modal on more info button click
  it("opens info modal when chevron is clicked", () => {
    render(<MovieCard data={mockMovieDetails} />);

    const card = screen.getByTestId("movie-card");

    // Simulate mouse enter event to show the chevron button
    fireEvent.mouseEnter(card);

    const chevronButton = screen.getByTestId("info-button");

    // Simulate click event on the chevron button
    fireEvent.click(chevronButton);

    // Check if the modal open function is called
    expect(mockSetModalOpen).toHaveBeenCalled();
  });
});
