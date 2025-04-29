// pages/api/reactions.ts
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import { TMDB_BASE_URL } from "@/lib/tmdb";

interface WhereClause {
  profileId: string;
  reactionType?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { currentUser } = await serverAuth(req, res);
    const { profileId, reactionType } = req.query;

    if (!profileId || typeof profileId !== "string") {
      return res.status(400).json({ error: "Invalid profile ID" });
    }

    // Validate profile belongs to user
    const profile = await prismadb.profile.findFirst({
      where: {
        id: profileId,
        userId: currentUser.id,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get reactions with optional filter by reactionType
    const whereClause: WhereClause = { profileId };
    if (reactionType && typeof reactionType === "string") {
      if (
        !["liked", "loved", "disliked"].includes(reactionType.toLowerCase())
      ) {
        return res.status(400).json({ error: "Invalid reaction type" });
      }
      whereClause.reactionType = reactionType.toLowerCase();
    }

    const reactions = await prismadb.reaction.findMany({
      where: whereClause,
    });

    // Process reactions in parallel
    const results = await Promise.all(
      reactions.map(async (reaction) => {
        try {
          if (reaction.source === "local") {
            if (reaction.contentType === "movie") {
              const movie = await prismadb.movie.findUnique({
                where: { id: reaction.contentId },
              });
              return movie
                ? {
                    ...movie,
                    isTvShow: false,
                    source: "local",
                    reactionType: reaction.reactionType,
                  }
                : null;
            } else {
              const tvShow = await prismadb.tvShow.findUnique({
                where: { id: reaction.contentId },
              });
              return tvShow
                ? {
                    ...tvShow,
                    isTvShow: true,
                    source: "local",
                    reactionType: reaction.reactionType,
                  }
                : null;
            }
          } else {
            // TMDB item
            const endpoint = reaction.contentType === "movie" ? "movie" : "tv";
            const response = await fetch(
              `${TMDB_BASE_URL}/${endpoint}/${reaction.contentId}?api_key=${process.env.TMDB_API_KEY}`
            );

            if (!response.ok) return null;

            const data = await response.json();
            return {
              id: data.id.toString(),
              title: data.title || data.name || "",
              description: data.overview || "",
              videoUrl: "",
              thumbnailUrl: data.poster_path
                ? `https://image.tmdb.org/t/p/original${data.poster_path}`
                : "",
              trailerUrl: "",
              genre: data.genres?.map((g: { name: string }) => g.name) || [],
              rating: data.vote_average || 0,
              duration:
                reaction.contentType === "movie"
                  ? data.runtime
                    ? `${data.runtime} minutes`
                    : ""
                  : "",
              numberOfSeasons:
                reaction.contentType === "tv"
                  ? data.number_of_seasons
                  : undefined,
              isTvShow: reaction.contentType === "tv",
              isAdult: data.adult || false,
              source: "tmdb",
              reactionType: reaction.reactionType,
            };
          }
        } catch (error) {
          console.error(
            `Error processing reaction ${reaction.contentId}:`,
            error
          );
          return null;
        }
      })
    );

    return res.status(200).json(results.filter(Boolean));
  } catch (error) {
    console.error("Reactions API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
