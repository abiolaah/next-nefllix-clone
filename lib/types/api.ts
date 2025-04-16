import { Movie, TvShow } from "@prisma/client";

export interface TransformedMovie extends Omit<Movie, "id"> {
  id: string;
  genre: string[];
  releaseDate: string;
  adult: boolean;
  isTvShow: false;
}

export interface TransformedTvShow extends Omit<TvShow, "id"> {
  id: string;
  genre: string[];
  releaseDate: string;
  adult: boolean;
  isTvShow: true;
}

export type MediaItem = TransformedMovie | TransformedTvShow;

export interface CategoryResponse {
  [key: string]: MediaItem[];
}
