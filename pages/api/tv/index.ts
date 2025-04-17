import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prismadb";
import { TMDB_BASE_URL, TMDB_ENDPOINTS } from "@/lib/tmdb";
import { TMDBTvShow, TMDBResponse } from "@/lib/types/tmdb";
import { transformTvShow } from "@/lib/transform";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

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
    const localTvShows = await prisma.tvShow.findMany();
    const transformedLocalTvShows = localTvShows.map((show) => ({
      ...show,
      isTvShow: true,
      source: "local",
    }));

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

    const response = await fetch(
      `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch TV shows");
    }

    const tmdbData: TMDBResponse<TMDBTvShow> = await response.json();
    const transformedTmdbShows = tmdbData.results.map((show: TMDBTvShow) =>
      transformTvShow(show)
    );

    // Combine and return the data
    const responseData = {
      local: transformedLocalTvShows,
      tmdb: transformedTmdbShows,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    return res.status(500).json({ error: "Failed to fetch TV shows" });
  }
}
