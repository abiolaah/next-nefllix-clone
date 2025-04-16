import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prismadb";
import { TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";
import { TMDBGenre, TMDBMovie, TMDBResponse } from "@/lib/types/tmdb";
import { CategoryResponse, TransformedMovie } from "@/lib/types/api";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    // Fetch movies from MongoDB
    const mongoMovies = await prisma.movie.findMany();

    // Fetch genre list from TMDB
    const genreResponse = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`
    );
    const genreData = (await genreResponse.json()) as TMDBResponse<TMDBGenre>;
    const genreMap = new Map(
      genreData.genres?.map((genre) => [genre.id, genre.name])
    );

    // Fetch different categories from TMDB
    const categories = {
      popular: "popular",
      nowPlaying: "now_playing",
      upcoming: "upcoming",
      topRated: "top_rated",
      trending: "trending/movie/week",
    };

    const allMovies: CategoryResponse = {
      "Movies Only on This Platform": [],
      "Popular Movies": [],
      "Now Playing": [],
      "Upcoming Movies": [],
      "Top Rated Movies": [],
      "Trending Movies": [],
    };

    // Transform MongoDB movies
    allMovies["Movies Only on This Platform"] = mongoMovies.map(
      (movie): TransformedMovie => ({
        ...movie,
        id: movie.id.toString(),
        genre: movie.genre.slice(0, 3),
        releaseDate: new Date(
          2022 + Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        adult: false,
        isTvShow: false,
      })
    );

    // Fetch and transform movies from each category
    for (const [category, endpoint] of Object.entries(categories)) {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${endpoint}?api_key=${TMDB_API_KEY}`
      );
      const data = (await response.json()) as TMDBResponse<TMDBMovie>;

      // Fetch details for each movie to get runtime
      const moviesWithDetails = await Promise.all(
        data.results.map(async (movie): Promise<TransformedMovie> => {
          const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`
          );
          const details = await detailsResponse.json();

          return {
            id: movie.id.toString(),
            title: movie.title,
            description: movie.overview,
            videoUrl: "",
            thumbnailUrl: `${TMDB_IMAGE_BASE_URL}w500${movie.poster_path}`,
            genre: movie.genre_ids
              .map((id) => genreMap.get(id) || "Unknown")
              .slice(0, 3),
            rating: movie.vote_average,
            duration: `${Math.floor(details.runtime / 60)}h ${
              details.runtime % 60
            }m`,
            releaseDate: movie.release_date,
            adult: movie.adult,
            isTvShow: false,
          };
        })
      );

      allMovies[
        category === "popular"
          ? "Popular Movies"
          : category === "nowPlaying"
          ? "Now Playing"
          : category === "upcoming"
          ? "Upcoming Movies"
          : category === "topRated"
          ? "Top Rated Movies"
          : "Trending Movies"
      ] = moviesWithDetails;
    }

    res.status(200).json(allMovies);
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
}
