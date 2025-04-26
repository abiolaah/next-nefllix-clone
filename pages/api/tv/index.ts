import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prismadb";
import { TMDB_BASE_URL, TMDB_ENDPOINTS } from "@/lib/tmdb";
import { TMDBTvShow, TMDBResponse } from "@/lib/types/tmdb";

// Define a type for video objects
interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  official?: boolean;
}

// Extended TV show type with additional properties
interface EnhancedTMDBTvShow extends TMDBTvShow {
  numberOfSeasons?: number;
  trailerUrl?: string;
  videos?: {
    results: TMDBVideo[];
  };
}

// Define the return type for processed TV shows
interface ProcessedTvShow {
  id: string | number;
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl: string;
  trailerUrl?: string;
  genre: string[];
  rating: number;
  numberOfSeasons: number;
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
    return res.status(405).end();
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ message: "Not signed in" });
    }

    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: "TMDB API key is not configured" });
    }

    // Fetch TV shows from MongoDB
    let localTvShows: ProcessedTvShow[] = [];
    try {
      const dbShows = await prisma.tvShow.findMany();
      localTvShows = dbShows.map((show) => {
        // Generate random boolean for isAdult
        const isAdult: boolean = Math.random() >= 0.5;

        return {
          id: show.id,
          title: show.title,
          description: show.description || "",
          videoUrl: show.videoUrl || "",
          thumbnailUrl: show.thumbnailUrl || "",
          trailerUrl: show.trailerUrl || "",
          genre: (show.genre as string[]) || [],
          rating: show.rating || 0,
          numberOfSeasons: show.numberOfSeasons || 1,
          isTvShow: true,
          isAdult,
          source: "local",
        };
      });
    } catch (error) {
      console.error("Error fetching local TV shows:", error);
      localTvShows = [];
    }

    // Fetch TV shows from TMDB based on type
    let endpoint = TMDB_ENDPOINTS.TV.POPULAR;

    switch (type) {
      case "popular":
        endpoint = TMDB_ENDPOINTS.TV.POPULAR;
        break;
      case "top_rated":
        endpoint = TMDB_ENDPOINTS.TV.TOP_RATED;
        break;
      case "on_air":
        endpoint = TMDB_ENDPOINTS.TV.ON_THE_AIR;
        break;
      case "trending":
        endpoint = "/trending/tv/week";
        break;
      default:
        endpoint = TMDB_ENDPOINTS.TV.POPULAR;
    }

    // Fetch genre list to map genre IDs to names
    let genresData: { genres: { id: number; name: string }[] } = { genres: [] };
    try {
      const genresResponse = await fetch(
        `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`
      );

      if (genresResponse.ok) {
        genresData = await genresResponse.json();
      }
    } catch (error) {
      console.error("Error fetching TV genres:", error);
    }

    let tmdbData: TMDBResponse<TMDBTvShow> = { results: [] };

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

      // Fetch additional details for each TV Shows
      const enhancedResults = await Promise.all(
        tmdbData.results.map(async (show: TMDBTvShow) => {
          try {
            const detailsResponse = await fetch(
              `${TMDB_BASE_URL}/tv/${show.id}?api_key=${TMDB_API_KEY}&append_to_response=videos`
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
                //Try to find official trailer first
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

              const enchancedShow: EnhancedTMDBTvShow = {
                ...show,
                numberOfSeasons: details.number_of_seasons,
                trailerUrl,
                videos: details.videos,
              };

              return enchancedShow;
            }
            return show;
          } catch (error) {
            console.error(
              `Error fetching details for TV show ${show.id}:`,
              error
            );
            return show;
          }
        })
      );

      // TYpe assertion to handle the enchanced results
      tmdbData.results = enhancedResults as TMDBTvShow[];
    } catch (error) {
      console.error("Error fetching TMDB TV shows:", error);
      // Continue with empty TMDB data instead of failing completely
    }

    const transformedTmdbShows: ProcessedTvShow[] = tmdbData.results.map(
      (show: EnhancedTMDBTvShow) => {
        // Map genre IDs to genre name
        const genreNames =
          show.genre_ids
            ?.map((id: number) => {
              const genre = genresData.genres.find((g) => g.id === id);
              return genre ? genre.name : "";
            })
            .filter(Boolean) || [];

        // Create the thumbnailUrl from poster_path
        const thumbnailUrl = show.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${show.poster_path}`
          : "";

        return {
          id: show.id,
          title: show.name || "",
          description: show.overview || "",
          videoUrl: "",
          thumbnailUrl,
          trailerUrl: show.trailerUrl || "",
          genre: genreNames,
          rating: show.vote_average || 0,
          numberOfSeasons: show.number_of_seasons || show.numberOfSeasons || 1,
          isTvShow: true,
          isAdult: show.adult,
          source: "tmdb",
        };
      }
    );

    // Combine and return the data
    const responseData = {
      local: localTvShows,
      tmdb: transformedTmdbShows,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    return res.status(500).json({
      error: "Failed to fetch TV shows",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
