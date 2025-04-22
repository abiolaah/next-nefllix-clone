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
}

export interface TransformedTvShow extends Omit<TvShow, "id"> {
  id: string;
  genre: string[];
  isTvShow: true;
  isAdult: boolean;
}

export type MediaItem = TransformedMovie | TransformedTvShow;

export interface CategoryResponse {
  [key: string]: MediaItem[];
}
