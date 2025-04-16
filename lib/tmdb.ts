export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

export const TMDB_ENDPOINTS = {
  MOVIES: {
    POPULAR: "/movie/popular",
    TOP_RATED: "/movie/top_rated",
    NOW_PLAYING: "/movie/now_playing",
    UPCOMING: "/movie/upcoming",
    DETAILS: (id: string) => `/movie/${id}`,
    SIMILAR: (id: string) => `/movie/${id}/similar`,
  },
  TV: {
    POPULAR: "/tv/popular",
    TOP_RATED: "/tv/top_rated",
    ON_THE_AIR: "/tv/on_the_air",
    DETAILS: (id: string) => `/tv/${id}`,
    SIMILAR: (id: string) => `/tv/${id}/similar`,
  },
};

export const TMDB_IMAGE_SIZES = {
  BACKDROP: {
    SMALL: "w300",
    MEDIUM: "w780",
    LARGE: "w1280",
    ORIGINAL: "original",
  },
  POSTER: {
    SMALL: "w154",
    MEDIUM: "w342",
    LARGE: "w500",
    ORIGINAL: "original",
  },
};
