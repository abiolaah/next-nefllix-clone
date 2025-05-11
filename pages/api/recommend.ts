import serverAuth from "@/lib/serverAuth";
import prismadb from "@/lib/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { TMDB_BASE_URL } from "@/lib/tmdb";
import axios from "axios";
import { TMDBVideo } from "@/lib/types/api";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

interface ProcessedRecommendation {
  id: string | number;
  title: string;
  description: string;
  thumbnailUrl: string;
  trailerUrl?: string;
  genre: string[];
  rating: number;
  duration?: string;
  numberOfSeasons?: string;
  isTvShow: boolean;
  isAdult: boolean;
  source: "local" | "tmdb";
  releaseDate?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const { currentUser } = await serverAuth(req, res);
    const { profileId } = req.query;

    // Validate required fields
    if (!profileId || typeof profileId !== "string") {
      return res
        .status(400)
        .json({ error: "ProfileId is required and must be a string" });
    }

    // Validate profile belongs to user
    const profile = await prismadb.profile.findFirst({
      where: {
        id: profileId,
        userId: currentUser.id,
      },
    });

    if (!profile) {
      return res.status(403).json({ error: "Invalid profile" });
    }

    // Count content types in collections to determine preferred type
    const [favouriteCounts, reactionCounts, watchingCounts] = await Promise.all(
      [
        prismadb.favourite.groupBy({
          by: ["contentType"],
          where: { profileId },
          _count: { _all: true },
        }),
        prismadb.reaction.groupBy({
          by: ["contentType"],
          where: { profileId },
          _count: { _all: true },
        }),
        prismadb.watching.groupBy({
          by: ["contentType"],
          where: { profileId },
          _count: { _all: true },
        }),
      ]
    );

    // Aggregate counts
    let movieCount = 0;
    let tvCount = 0;

    [...favouriteCounts, ...reactionCounts, ...watchingCounts].forEach(
      (item) => {
        if (item.contentType === "movie") movieCount += item._count._all;
        else if (item.contentType === "tv") tvCount += item._count._all;
      }
    );

    const contentType = movieCount > tvCount ? "movie" : "tv";

    // Get all TMDB content IDS of the preferred types from user's collections
    const [favorites, reactions, watchings] = await Promise.all([
      prismadb.favourite.findMany({
        where: {
          profileId,
          source: "tmdb",
          contentType,
        },
        select: { contentId: true },
      }),
      prismadb.reaction.findMany({
        where: {
          profileId,
          source: "tmdb",
          contentType,
        },
        select: { contentId: true },
      }),
      prismadb.watching.findMany({
        where: {
          profileId,
          source: "tmdb",
          contentType,
        },
        select: { contentId: true },
      }),
    ]);

    // Combine all content IDs, removing duplicates
    const allContentIds = [...favorites, ...reactions, ...watchings]
      .map((item) => item.contentId)
      .filter((value, index, self) => self.indexOf(value) === index);

    // Get recommendations for each content ID
    const recommendations: ProcessedRecommendation[] = [];
    const seenIds = new Set<string | number>();

    for (const contentId of allContentIds.slice(0, 5)) {
      try {
        const endpoint =
          contentType === "movie"
            ? `${TMDB_BASE_URL}/movie/${contentId}/recommendations`
            : `${TMDB_BASE_URL}/tv/${contentId}/recommendations`;
        const response = await axios.get(
          `${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );

        for (const item of response.data.results) {
          if (seenIds.has(item.id)) continue; // Skip if already seen

          seenIds.add(item.id);
          console.log(seenIds.size);

          // Get additional details including trailer
          try {
            const detailsResponse = await axios.get(
              `${TMDB_BASE_URL}/${contentType === "movie" ? "movie" : "tv"}/${
                item.id
              }?api_key=${TMDB_API_KEY}&append_to_response=videos`
            );

            const details = detailsResponse.data;
            let trailerUrl = "";

            if (details.videos?.results?.length > 0) {
              const trailer = details.videos.results.find(
                (video: TMDBVideo) => video.type === "Trailer"
              );
              if (trailer)
                trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            }

            recommendations.push({
              id: item.id,
              title: item.title || item.name || "",
              description: item.overview,
              thumbnailUrl: item.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
                : "",
              trailerUrl,
              genre:
                details.genres?.map(
                  (g: { id: string | number; name: string }) => g.name
                ) || [],
              rating: item.vote_average || 0,
              duration:
                contentType === "movie" && details.runtime
                  ? `${details.runtime} minutes`
                  : "10 minutes",
              numberOfSeasons:
                contentType === "tv"
                  ? `${details.number_of_seasons} Seasons`
                  : "1 Season",
              isTvShow: contentType === "tv",
              isAdult: item.adult || false,
              source: "tmdb",
              releaseDate: item.release_date || item.first_air_date,
            });
          } catch (error) {
            console.error(`Error fetching details for ${item.id}:`, error);
            // Push basic info if details fetch fails
            recommendations.push({
              id: item.id,
              title: item.title || item.name || "",
              description: item.overview,
              thumbnailUrl: item.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
                : "",
              genre: [],
              rating: item.vote_average || 0,
              isTvShow: contentType === "tv",
              isAdult: item.adult || false,
              source: "tmdb",
              releaseDate: item.release_date || item.first_air_date,
            });
          }
        }
      } catch (error) {
        console.error(
          `Error fetching recommendations for ${contentId}:`,
          error
        );
        continue;
      }
    }

    // Remove duplicates (in case different sources recommended the same item)
    const uniqueRecommendations = recommendations.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

    return res.status(200).json({
      results: uniqueRecommendations,
      contentType,
      counts: { movies: movieCount, tv: tvCount },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
