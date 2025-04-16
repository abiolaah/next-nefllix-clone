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
  runtime: number;
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
  number_of_seasons: number;
  first_air_date: string;
  adult: boolean;
}

export interface TMDBResponse<T> {
  results: T[];
  genres?: TMDBGenre[];
}
