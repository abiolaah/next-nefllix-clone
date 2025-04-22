import { NextApiRequest, NextApiResponse } from "next";
import { TMDB_BASE_URL, TMDB_ENDPOINTS } from "../../../lib/tmdb";
import prismadb from "@/lib/prismadb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { movieId } = req.query;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: "TMDB API key is not configured" });
  }

  if (!movieId) {
    return res.status(400).json({ error: "Movie ID is required" });
  }

  try {
    // First, try to find the movie in MongoDB
    const localMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId as string,
      },
    });

    if (localMovie) {
      // If found in MongoDB, return the local data
      return res.status(200).json({
        details: {
          id: localMovie.id,
          title: localMovie.title,
          overview: localMovie.description,
          videoUrl: localMovie.videoUrl,
          thumbnailUrl: localMovie.thumbnailUrl,
          genre: localMovie.genre,
          rating: localMovie.rating,
          duration: localMovie.duration,
        },
        source: "local",
      });
    }

    // If not found in MongoDB, fetch from TMDB
    const detailsResponse = await fetch(
      `${TMDB_BASE_URL}${TMDB_ENDPOINTS.MOVIES.DETAILS(
        movieId as string
      )}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    );

    if (!detailsResponse.ok) {
      throw new Error("Failed to fetch movie details from TMDB");
    }

    const movieDetails = await detailsResponse.json();

    // Fetch similar movies from TMDB
    const similarResponse = await fetch(
      `${TMDB_BASE_URL}${TMDB_ENDPOINTS.MOVIES.SIMILAR(
        movieId as string
      )}?api_key=${TMDB_API_KEY}`
    );

    if (!similarResponse.ok) {
      throw new Error("Failed to fetch similar movies from TMDB");
    }

    const similarMovies = await similarResponse.json();

    return res.status(200).json({
      details: movieDetails,
      similar: similarMovies.results,
      source: "tmdb",
    });
  } catch (error) {
    console.error("Error fetching movie data:", error);
    return res.status(500).json({ error: "Failed to fetch movie data" });
  }
};

export default handler;
