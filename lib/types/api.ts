import { Movie, TvShow } from "@/generated/prisma";

export interface MovieData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  trailerUrl: string;
  genre: string[];
  rating: number | null;
  duration: string;
}

export interface TvShowData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  trailerUrl: string;
  genre: string[];
  rating: number | null;
  numberOfSeasons: number;
}

export interface TransformedMovie extends Omit<Movie, "id"> {
  id: string;
  genre: string[];
  isTvShow: false;
  isAdult: boolean;
  source?: "local" | "tmdb"; // Add source here
}

export interface TransformedTvShow extends Omit<TvShow, "id"> {
  id: string;
  genre: string[];
  isTvShow: true;
  isAdult: boolean;
  source?: "local" | "tmdb"; // Add source here
}

export type MediaItem = TransformedMovie | TransformedTvShow;

interface EpisodeDetails {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export type WatchingItem = MediaItem & {
  source?: "local" | "tmdb";
  progress?: number;
  completed?: boolean;
  lastWatched?: Date;
  currentSeason?: number;
  currentEpisode?: number;
  episodeDetails?: EpisodeDetails;
};

export interface CategoryResponse {
  [key: string]: MediaItem[];
}

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface MovieDetailsResponse {
  details: {
    id: string | number;
    title: string;
    description: string;
    videoUrl?: string;
    trailerUrl?: string;
    thumbnailUrl: string;
    genre: Array<{ id: number; name: string }>;
    rating?: number;
    duration: string;
    releaseDate: string;
    tagline: string;
    isAdult: boolean;
    isTvShow: boolean;
    credits?: {
      cast: Array<{
        id: number;
        name: string;
      }>;
      crew: Array<{
        id: number;
        name: string;
        department: string;
      }>;
    };
    videos?: {
      results: TMDBVideo[];
    };
    keywords?: {
      keywords: Array<{ id: number; name: string }>;
    };
  };
  similar: Array<{
    id: string | number;
    title: string;
    description: string;
    thumbnailUrl: string;
    releaseDate: string;
    duration: string;
    videoUrl?: string;
    trailerUrl?: string;
    isAdult: boolean;
    isTvShow: boolean;
  }>;
  source: string;
}

export interface TvShowDetailsResponse {
  details: {
    id: string | number;
    title: string;
    description: string;
    trailerUrl?: string;
    thumbnailUrl: string;
    genre: Array<{ id: number; name: string }>;
    rating?: number;
    numberOfSeasons: string;
    releaseDate: string;
    tagline: string;
    isAdult: boolean;
    isTvShow: boolean;
    credits?: {
      cast: Array<{
        id: number;
        name: string;
      }>;
    };
    videos?: {
      results: TMDBVideo[];
    };
    keywords?: {
      keywords: Array<{ id: number; name: string }>;
    };
    seasons: Array<{
      id: string | number;
      season_number: number;
      episodes: Array<{
        id: string | number;
        episodeType: string;
        name: string;
        episodeNumber: number;
        description: string;
        duration: string;
        thumbnailUrl: string;
        videoUrl?: string;
      }>;
    }>;
    createdBy?: Array<{
      id: number;
      name: string;
    }>;
  };
  similar: Array<{
    id: string | number;
    title: string;
    description: string;
    thumbnailUrl: string;
    releaseDate: string;
    numberOfSeasons: string;
    videoUrl?: string;
    trailerUrl?: string;
    isAdult: boolean;
    isTvShow: boolean;
  }>;
  source: string;
}

export type MediaResponse = MovieDetailsResponse | TvShowDetailsResponse;
