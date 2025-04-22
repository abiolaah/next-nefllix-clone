import { NextApiRequest, NextApiResponse } from "next";
import { TMDB_BASE_URL, TMDB_ENDPOINTS } from "../../../lib/tmdb";
import prismadb from "@/lib/prismadb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tvId } = req.query;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: "TMDB API key is not configured" });
  }

  if (!tvId) {
    return res.status(400).json({ error: "TV Show ID is required" });
  }

  try {
    // First, try to find the TV show in MongoDB
    const localTvShow = await prismadb.tvShow.findUnique({
      where: {
        id: tvId as string,
      },
    });

    if (localTvShow) {
      // If found in MongoDB, return the local data
      return res.status(200).json({
        details: {
          id: localTvShow.id,
          title: localTvShow.title,
          overview: localTvShow.description,
          videoUrl: localTvShow.videoUrl,
          thumbnailUrl: localTvShow.thumbnailUrl,
          genre: localTvShow.genre,
          rating: localTvShow.rating,
          seasons: localTvShow.numberOfSeasons || 1,
        },
        source: "local",
      });
    }

    // If not found in MongoDB, fetch from TMDB with additional details
    const detailsResponse = await fetch(
      `${TMDB_BASE_URL}${TMDB_ENDPOINTS.TV.DETAILS(
        tvId as string
      )}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    );

    if (!detailsResponse.ok) {
      throw new Error("Failed to fetch TV show details from TMDB");
    }

    const tvDetails = await detailsResponse.json();

    // Fetch similar TV shows from TMDB
    const similarResponse = await fetch(
      `${TMDB_BASE_URL}${TMDB_ENDPOINTS.TV.SIMILAR(
        tvId as string
      )}?api_key=${TMDB_API_KEY}`
    );

    if (!similarResponse.ok) {
      throw new Error("Failed to fetch similar TV shows from TMDB");
    }

    const similarTvShows = await similarResponse.json();

    return res.status(200).json({
      details: tvDetails,
      similar: similarTvShows.results,
      source: "tmdb",
    });
  } catch (error) {
    console.error("Error fetching TV show data:", error);
    return res.status(500).json({ error: "Failed to fetch TV show data" });
  }
};

export default handler;
