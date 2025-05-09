import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import axios from "axios";
import { TMDB_BASE_URL } from "@/lib/tmdb";
import { TMDBVideo } from "@/lib/types/api";

interface TMDBResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average?: number;
  adult?: boolean;
  known_for?: Array<{
    id: number;
    media_type: "movie" | "tv";
    title?: string;
    name?: string;
    poster_path: string | null;
    overview: string;
    vote_average?: number;
    adult?: boolean;
    release_date?: string;
    first_air_date?: string;
  }>;
  first_air_date?: string;
  release_date?: string;
}

interface ProcessedSearchResult {
  id: string | number;
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl: string;
  trailerUrl?: string;
  genre: string[];
  rating: number;
  duration?: string;
  numberOfSeasons?: number;
  isTvShow: boolean;
  isAdult: boolean;
  source: "local" | "tmdb";
  releaseDate?: string;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    await serverAuth(req, res);
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing search query" });
    }

    // Search in local database
    const [movies, tvShows] = await Promise.all([
      prismadb.movie.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { genre: { hasSome: [query] } },
          ],
        },
        take: 5,
      }),
      prismadb.tvShow.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { genre: { hasSome: [query] } },
          ],
        },
        take: 5,
      }),
    ]);

    // Format local results
    const localResults: ProcessedSearchResult[] = [
      ...movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        description: movie.description || "",
        videoUrl: movie.videoUrl || "",
        thumbnailUrl: movie.thumbnailUrl || "",
        trailerUrl: movie.trailerUrl || "",
        genre: movie.genre as string[],
        rating: movie.rating || 0,
        duration: movie.duration || "",
        isTvShow: false,
        isAdult: false, // Default for local movies
        source: "local" as const,
      })),
      ...tvShows.map((show) => ({
        id: show.id,
        title: show.title,
        description: show.description || "",
        videoUrl: show.videoUrl || "",
        thumbnailUrl: show.thumbnailUrl || "",
        trailerUrl: show.trailerUrl || "",
        genre: show.genre as string[],
        rating: show.rating || 0,
        numberOfSeasons: show.numberOfSeasons || 1,
        isTvShow: true,
        isAdult: false, // Default for local TV shows
        source: "local" as const,
      })),
    ];

    // Search TMDB API
    const tmdbResponse = await axios.get<{ results: TMDBResult[] }>(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&page=1`
    );

    // Process TMDB results including person known_for items
    const tmdbResults: ProcessedSearchResult[] = [];

    for (const item of tmdbResponse.data.results) {
      if (item.media_type === "person" && item.known_for) {
        // Handle person results by including their known_for items
        for (const knownItem of item.known_for) {
          if (
            knownItem.media_type === "movie" ||
            knownItem.media_type === "tv"
          ) {
            tmdbResults.push({
              id: knownItem.id,
              title: knownItem.title || knownItem.name || "",
              description: knownItem.overview,
              thumbnailUrl: knownItem.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${knownItem.poster_path}`
                : "",
              genre: [],
              rating: knownItem.vote_average || 0,
              isTvShow: knownItem.media_type === "tv",
              isAdult: knownItem.adult || false,
              source: "tmdb",
              releaseDate: knownItem.release_date || knownItem.first_air_date,
            });
          }
        }
      } else if (item.media_type === "movie" || item.media_type === "tv") {
        // Handle direct movie/tv results
        tmdbResults.push({
          id: item.id,
          title: item.title || item.name || "",
          description: item.overview,
          thumbnailUrl: item.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
            : "",
          genre: [],
          rating: item.vote_average || 0,
          isTvShow: item.media_type === "tv",
          isAdult: item.adult || false,
          source: "tmdb",
          releaseDate: item.release_date || item.first_air_date,
        });
      }
    }

    // Fetch additional details for TMDB results to get trailers and more info
    const enhancedResults = await Promise.all(
      tmdbResults.map(async (result) => {
        try {
          const detailsResponse = await axios.get(
            `${TMDB_BASE_URL}/${result.isTvShow ? "tv" : "movie"}/${
              result.id
            }?api_key=${process.env.TMDB_API_KEY}&append_to_response=videos`
          );

          const details = detailsResponse.data;

          // Find trailer
          let trailerUrl = "";
          if (details.videos?.results?.length > 0) {
            const trailer = details.videos.results.find(
              (video: TMDBVideo) =>
                video.type === "Trailer" &&
                video.site === "YouTube" &&
                (video.official || !trailerUrl)
            );
            if (trailer) {
              trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            }
          }

          // Get additional info based on type
          if (result.isTvShow) {
            return {
              ...result,
              trailerUrl,
              numberOfSeasons: details.number_of_seasons || 1,
              genre:
                details.genres?.map(
                  (g: { id: string | number; name: string }) => g.name
                ) || [],
            };
          } else {
            return {
              ...result,
              trailerUrl,
              duration: details.runtime
                ? `${details.runtime} minutes`
                : undefined,
              genre:
                details.genres?.map(
                  (g: { id: string | number; name: string }) => g.name
                ) || [],
            };
          }
        } catch (error) {
          console.error(`Error enhancing result ${result.id}:`, error);
          return result; // Return original if enhancement fails
        }
      })
    );

    // Combine and limit results
    const allResults = [...localResults, ...enhancedResults].slice(0, 10);

    return res.status(200).json({
      results: allResults,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
