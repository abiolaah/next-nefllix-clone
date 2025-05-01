// pages/api/watchings.ts
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import { TMDB_BASE_URL } from "@/lib/tmdb";

interface WhereClause {
  profileId: string;
  completed?: boolean;
  contentId?: string;
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
    const { profileId, completed, mediaId } = req.query;

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

    // Build query based on filters
    const whereClause: WhereClause = { profileId };

    // Filter by completion status if specified
    if (completed !== undefined) {
      whereClause.completed = completed === "true";
    }

    // Filter by specific content if specified
    if (mediaId && typeof mediaId === "string") {
      whereClause.contentId = mediaId;
    }

    // Get watching records
    const watchingRecords = await prismadb.watching.findMany({
      where: whereClause,
      orderBy: { lastWatched: "desc" },
    });

    // Process watchings in parallel
    const results = await Promise.all(
      watchingRecords.map(async (watching) => {
        try {
          // Get media details based on content type
          let mediaDetails;

          if (watching.source === "local") {
            if (watching.contentType === "movie") {
              mediaDetails = await prismadb.movie.findUnique({
                where: { id: watching.contentId },
              });

              if (mediaDetails) {
                return {
                  ...mediaDetails,
                  isTvShow: false,
                  progress: watching.progress,
                  completed: watching.completed,
                  lastWatched: watching.lastWatched,
                };
              }
            } else if (watching.contentType === "tv") {
              mediaDetails = await prismadb.tvShow.findUnique({
                where: { id: watching.contentId },
              });

              if (mediaDetails) {
                // Get episode details if available
                let episodeDetails = null;

                if (watching.season && watching.episode) {
                  const season = await prismadb.season.findFirst({
                    where: {
                      tvShowId: watching.contentId,
                      seasonNumber: watching.season,
                    },
                  });

                  if (season) {
                    const episode = await prismadb.episode.findFirst({
                      where: {
                        seasonId: season.id,
                        episodeNumber: watching.episode,
                      },
                    });

                    if (episode) {
                      episodeDetails = episode;
                    }
                  }
                }

                return {
                  ...mediaDetails,
                  isTvShow: true,
                  progress: watching.progress,
                  completed: watching.completed,
                  lastWatched: watching.lastWatched,
                  currentSeason: watching.season,
                  currentEpisode: watching.episode,
                  episodeDetails,
                };
              }
            }
          } else {
            // TMDB item
            const endpoint = watching.contentType === "movie" ? "movie" : "tv";
            const response = await fetch(
              `${TMDB_BASE_URL}/${endpoint}/${watching.contentId}?api_key=${process.env.TMDB_API_KEY}`
            );

            if (!response.ok) return null;

            const data = await response.json();

            if (watching.contentType === "movie") {
              return {
                id: data.id.toString(),
                title: data.title || "",
                description: data.overview || "",
                videoUrl: "",
                thumbnailUrl: data.poster_path
                  ? `https://image.tmdb.org/t/p/original${data.poster_path}`
                  : "",
                trailerUrl: "",
                genre: data.genres?.map((g: { name: string }) => g.name) || [],
                rating: data.vote_average || 0,
                duration: data.runtime ? `${data.runtime} minutes` : "",
                isTvShow: false,
                isAdult: data.adult || false,
                source: "tmdb",
                progress: watching.progress,
                completed: watching.completed,
                lastWatched: watching.lastWatched,
              };
            } else {
              // TV Show from TMDB
              let episodeDetails = null;

              if (watching.season && watching.episode) {
                try {
                  const seasonResponse = await fetch(
                    `${TMDB_BASE_URL}/tv/${watching.contentId}/season/${watching.season}?api_key=${process.env.TMDB_API_KEY}`
                  );

                  if (seasonResponse.ok) {
                    const seasonData = await seasonResponse.json();
                    const episodeData = seasonData.episodes.find(
                      (ep: { episode_number: number }) =>
                        ep.episode_number === watching.episode
                    );

                    if (episodeData) {
                      episodeDetails = {
                        episodeNumber: episodeData.episode_number,
                        title: episodeData.name,
                        description: episodeData.overview,
                        duration: episodeData.runtime
                          ? `${episodeData.runtime} minutes`
                          : "",
                        thumbnailUrl: episodeData.still_path
                          ? `https://image.tmdb.org/t/p/original${episodeData.still_path}`
                          : "",
                      };
                    }
                  }
                } catch (error) {
                  console.error("Error fetching episode details:", error);
                  // Continue without episode details
                }
              }
              return {
                id: data.id.toString(),
                title: data.name || "",
                description: data.overview || "",
                videoUrl: "",
                thumbnailUrl: data.poster_path
                  ? `https://image.tmdb.org/t/p/original${data.poster_path}`
                  : "",
                trailerUrl: "",
                genre: data.genres?.map((g: { name: string }) => g.name) || [],
                rating: data.vote_average || 0,
                numberOfSeasons: data.number_of_seasons,
                isTvShow: true,
                isAdult: data.adult || false,
                source: "tmdb",
                progress: watching.progress,
                completed: watching.completed,
                lastWatched: watching.lastWatched,
                currentSeason: watching.season,
                currentEpisode: watching.episode,
                episodeDetails,
              };
            }
          }
          return null;
        } catch (error) {
          console.error(
            `Error processing watching record ${watching.id}:`,
            error
          );
          return null;
        }
      })
    );

    return res.status(200).json(results.filter(Boolean));
  } catch (error) {
    console.error("Watchings API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
