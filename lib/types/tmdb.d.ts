export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  genre_ids: number[];
  vote_average: number;
  runtime?: number;
  release_date: string;
  adult: boolean;
}

export interface TMDBTvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  genre_ids: number[];
  vote_average: number;
  first_air_date: string;
  adult: boolean;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
  genres?: T[];
}
