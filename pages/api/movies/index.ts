import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prismadb";
import { TMDB_BASE_URL, TMDB_ENDPOINTS } from "@/lib/tmdb";
import { TMDBMovie, TMDBResponse } from "@/lib/types/tmdb";

// Define a type for video objects
interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  official?: boolean;
}

// Extended movie type with additional properties
interface EnhancedTMDBMovie extends TMDBMovie {
  runtime?: number;
  trailerUrl?: string;
  videos?: {
    results: TMDBVideo[];
  };
}

// Define the return type for processed movies
interface ProcessedMovie {
  id: string | number;
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl: string;
  trailerUrl?: string;
  genre: string[];
  rating: number;
  duration: string;
  isTvShow: boolean;
  isAdult: boolean;
  source: string;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { type = "popular", page = "1" } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Not signed in" });
    }

    if (!TMDB_API_KEY) {
      console.error("TMDB API key is not configured");
      return res.status(500).json({ error: "TMDB API key is not configured" });
    }

    // Fetch movies from MongoDB
    let localMovies: ProcessedMovie[] = [];
    try {
      const dbMovies = await prisma.movie.findMany();
      localMovies = dbMovies.map((movie) => {
        // Generate random boolean for isAdult
        const isAdult: boolean = Math.random() >= 0.5;

        return {
          id: movie.id,
          title: movie.title,
          description: movie.description || "",
          videoUrl: movie.videoUrl || "",
          thumbnailUrl: movie.thumbnailUrl || "",
          trailerUrl: movie.trailerUrl || "",
          genre: (movie.genre as string[]) || [],
          rating: movie.rating || 0,
          duration: movie.duration || "10 minutes",
          isTvShow: false,
          isAdult,
          source: "local",
        };
      });
    } catch (error) {
      console.error("Error fetching local movies:", error);
      localMovies = [];
    }

    // Fetch movies from TMDB based on type
    let endpoint = TMDB_ENDPOINTS.MOVIES.POPULAR;

    switch (type) {
      case "popular":
        endpoint = TMDB_ENDPOINTS.MOVIES.POPULAR;
        break;
      case "top_rated":
        endpoint = TMDB_ENDPOINTS.MOVIES.TOP_RATED;
        break;
      case "now_playing":
        endpoint = TMDB_ENDPOINTS.MOVIES.NOW_PLAYING;
        break;
      case "upcoming":
        endpoint = TMDB_ENDPOINTS.MOVIES.UPCOMING;
        break;
      case "trending":
        endpoint = "/trending/movie/week";
        break;
      default:
        endpoint = TMDB_ENDPOINTS.MOVIES.POPULAR;
    }

    // Fetch genre list to map genre IDs to names
    let genresData: { genres: { id: number; name: string }[] } = { genres: [] };
    try {
      const genresResponse = await fetch(
        `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`
      );

      if (genresResponse.ok) {
        genresData = await genresResponse.json();
      }
    } catch (error) {
      console.error("Error fetching movie genres:", error);
    }

    let tmdbData: TMDBResponse<TMDBMovie> = { results: [] };

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("TMDB API Error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          `TMDB API error: ${response.status} - ${response.statusText}`
        );
      }

      tmdbData = await response.json();

      // Fetch additional details for each movie
      const enhancedResults = await Promise.all(
        tmdbData.results.map(async (movie: TMDBMovie) => {
          try {
            const detailsResponse = await fetch(
              `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=videos`
            );
            if (detailsResponse.ok) {
              const details = await detailsResponse.json();

              // Find trailer from videos
              let trailerUrl = "";

              if (
                details.videos &&
                details.videos.results &&
                details.videos.results.length > 0
              ) {
                // Try to find official trailer first
                const officialTrailer = details.videos.results.find(
                  (video: TMDBVideo) =>
                    video.type === "Trailer" &&
                    video.site === "YouTube" &&
                    video.official === true
                );

                // If no official trailer, get any trailer
                const anyTrailer = details.videos.results.find(
                  (video: TMDBVideo) =>
                    video.type === "Trailer" && video.site === "YouTube"
                );

                // If still no trailer, get any video
                const anyVideo = details.videos.results.find(
                  (video: TMDBVideo) => video.site === "YouTube"
                );

                const trailer = officialTrailer || anyTrailer || anyVideo;

                if (trailer) {
                  trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
                }
              }

              const enhancedMovie: EnhancedTMDBMovie = {
                ...movie,
                runtime: details.runtime,
                trailerUrl,
                videos: details.videos,
              };

              return enhancedMovie;
            }
            return movie;
          } catch (error) {
            console.error(
              `Error fetching details for movie ${movie.id}:`,
              error
            );
            return movie;
          }
        })
      );

      // Type assertion to handle the enhanced results
      tmdbData.results = enhancedResults as TMDBMovie[];
    } catch (error) {
      console.error("Error fetching TMDB movies:", error);
      // Continue with empty TMDB data instead of failing completely
    }

    const transformedTmdbMovies: ProcessedMovie[] = tmdbData.results.map(
      (movie: EnhancedTMDBMovie) => {
        // Map genre IDs to genre names
        const genreNames =
          movie.genre_ids
            ?.map((id: number) => {
              const genre = genresData.genres.find((g) => g.id === id);
              return genre ? genre.name : "";
            })
            .filter(Boolean) || [];

        // Find the best video for videoUrl (if not already set in the enhanced data)
        let trailerUrl = movie.trailerUrl || "";

        if (
          movie.videos &&
          movie.videos.results &&
          movie.videos.results.length > 0
        ) {
          const officialTrailer = movie.videos.results.find(
            (video: TMDBVideo) =>
              video.type === "Trailer" &&
              video.site === "YouTube" &&
              video.official === true
          );

          const anyTrailer = movie.videos.results.find(
            (video: TMDBVideo) =>
              video.type === "Trailer" && video.site === "YouTube"
          );

          const anyVideo = movie.videos.results.find(
            (video: TMDBVideo) => video.site === "YouTube"
          );

          const bestVideo = officialTrailer || anyTrailer || anyVideo;

          if (bestVideo) {
            if (!trailerUrl) {
              trailerUrl = `https://www.youtube.com/watch?v=${bestVideo.key}`;
            }
          }
        }

        // Create the thumbnailUrl from poster_path
        const thumbnailUrl = movie.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
          : "";

        // Generate random boolean for isAdult for each movie

        return {
          id: movie.id,
          title: movie.title || "",
          description: movie.overview || "",
          videoUrl: "",
          thumbnailUrl,
          trailerUrl,
          genre: genreNames,
          rating: movie.vote_average || 0,
          duration: movie.runtime ? `${movie.runtime} minutes` : "10 minutes",
          isTvShow: false,
          isAdult: movie.adult,
          source: "tmdb",
        };
      }
    );

    // Combine and return the data
    const responseData = {
      local: localMovies,
      tmdb: transformedTmdbMovies,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in movies API:", error);
    return res.status(500).json({
      error: "Failed to fetch movies",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
