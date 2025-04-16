import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prismadb";
import { TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";
import { TMDBGenre, TMDBTvShow, TMDBResponse } from "@/lib/types/tmdb";
import { CategoryResponse, TransformedTvShow } from "@/lib/types/api";

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

    // Fetch TV shows from MongoDB
    const mongoTvShows = await prisma.tvShow.findMany();

    // Fetch genre list from TMDB
    const genreResponse = await fetch(
      `https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}`
    );
    const genreData = (await genreResponse.json()) as TMDBResponse<TMDBGenre>;
    const genreMap = new Map(
      genreData.genres?.map((genre) => [genre.id, genre.name])
    );

    // Fetch different categories from TMDB
    const categories = {
      popular: "popular",
      onAir: "on_the_air",
      airingToday: "airing_today",
      topRated: "top_rated",
      trending: "trending/tv/week",
    };

    const allTvShows: CategoryResponse = {
      "TV Shows Only on This Platform": [],
      "Popular TV Shows": [],
      "On Air": [],
      "Airing Today": [],
      "Top Rated TV Shows": [],
      "Trending TV Shows": [],
    };

    // Transform MongoDB TV shows
    allTvShows["TV Shows Only on This Platform"] = mongoTvShows.map(
      (show): TransformedTvShow => ({
        ...show,
        id: show.id.toString(),
        genre: show.genre.slice(0, 3),
        releaseDate: new Date(
          2022 + Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        adult: false,
        isTvShow: true,
        numberOfSeasons: show.numberOfSeasons || 1,
      })
    );

    // Fetch and transform TV shows from each category
    for (const [category, endpoint] of Object.entries(categories)) {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${endpoint}?api_key=${TMDB_API_KEY}`
      );
      const data = (await response.json()) as TMDBResponse<TMDBTvShow>;

      // Fetch details for each TV show to get number of seasons
      const showsWithDetails = await Promise.all(
        data.results.map(async (show): Promise<TransformedTvShow> => {
          const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}`
          );
          const details = await detailsResponse.json();

          return {
            id: show.id.toString(),
            title: show.name,
            description: show.overview,
            videoUrl: "",
            thumbnailUrl: `${TMDB_IMAGE_BASE_URL}w500${show.poster_path}`,
            genre: show.genre_ids
              .map((id) => genreMap.get(id) || "Unknown")
              .slice(0, 3),
            rating: show.vote_average,
            duration: `${details.episode_run_time?.[0] || 45}m`,
            releaseDate: show.first_air_date,
            adult: show.adult,
            isTvShow: true,
            numberOfSeasons: details.number_of_seasons,
          };
        })
      );

      allTvShows[
        category === "popular"
          ? "Popular TV Shows"
          : category === "onAir"
          ? "On Air"
          : category === "airingToday"
          ? "Airing Today"
          : category === "topRated"
          ? "Top Rated TV Shows"
          : "Trending TV Shows"
      ] = showsWithDetails;
    }

    res.status(200).json(allTvShows);
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
}
