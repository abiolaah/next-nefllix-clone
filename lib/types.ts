export interface MovieData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string;
  rating: number;
  duration: number;
  isLocal?: boolean;
  isTmdb?: boolean;
  tmdbId?: number;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  voteAverage?: number;
  voteCount?: number;
  overview?: string;
  runtime?: number;
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  imdbId?: string;
  originalLanguage?: string;
  originalTitle?: string;
  popularity?: number;
  productionCompanies?: Array<{
    id: number;
    name: string;
    logoPath?: string;
    originCountry: string;
  }>;
  productionCountries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spokenLanguages?: Array<{
    iso_639_1: string;
    name: string;
  }>;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  belongsToCollection?: {
    id: number;
    name: string;
    posterPath?: string;
    backdropPath?: string;
  };
  adult?: boolean;
  video?: boolean;
}

export interface Movie extends MovieData {
  createdAt: Date;
  updatedAt: Date;
}
