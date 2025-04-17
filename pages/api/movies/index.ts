import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prismadb";
import { TMDB_BASE_URL, TMDB_ENDPOINTS } from "@/lib/tmdb";
import { TMDBMovie, TMDBResponse } from "@/lib/types/tmdb";
import { transformMovie } from "@/lib/transform";
import { MediaItem } from "@/lib/types/api";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

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
    let localMovies: MediaItem[] = [];
    try {
      const dbMovies = await prisma.movie.findMany();
      localMovies = dbMovies.map((movie) => ({
        ...movie,
        isTvShow: false,
        source: "local",
        genre: movie.genre as string[],
      }));
    } catch (error) {
      console.error("Error fetching local movies:", error);
      localMovies = [];
    }

    const transformedLocalMovies = localMovies.map((movie) => ({
      ...movie,
      isTvShow: false,
      source: "local",
    }));

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
    } catch (error) {
      console.error("Error fetching TMDB movies:", error);
      // Continue with empty TMDB data instead of failing completely
    }

    const transformedTmdbMovies = tmdbData.results.map((movie: TMDBMovie) =>
      transformMovie(movie)
    );

    // Combine and return the data
    const responseData = {
      local: transformedLocalMovies,
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
