import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { currentUser } = await serverAuth(req, res);
      const {
        mediaId,
        profileId,
        mediaType,
        progress = 0,
        season = null,
        episode = null,
        completed = false,
        source = "tmdb",
      } = req.body;

      // Validate required fields
      if (!mediaId || !profileId || !mediaType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate progress is between 0 and 100
      if (progress < 0 || progress > 100) {
        return res
          .status(400)
          .json({ error: "Progress must be between 0 and 100" });
      }

      // Validate tv shows have season and episode numbers
      if (mediaType === "tv" && (season === null || episode === null)) {
        return res
          .status(400)
          .json({ error: "TV shows require season and episode numbers" });
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

      // For local content, validate existence in our DB
      if (source === "local") {
        if (mediaType === "movie") {
          const existingMovie = await prismadb.movie.findUnique({
            where: { id: mediaId },
          });
          if (!existingMovie) {
            return res.status(404).json({ error: "Local movie not found" });
          }
        } else if (mediaType === "tv") {
          const existingTv = await prismadb.tvShow.findUnique({
            where: { id: mediaId },
          });
          if (!existingTv) {
            return res.status(404).json({ error: "Local TV show not found" });
          }
        } else {
          return res.status(400).json({ error: "Invalid media type" });
        }
      }

      // Check if already watching
      const existingWatching = await prismadb.watching.findFirst({
        where: {
          profileId,
          contentId: mediaId.toString(),
        },
      });

      if (existingWatching) {
        // Update existing watching record
        const updatedWatching = await prismadb.watching.update({
          where: { id: existingWatching.id },
          data: {
            contentType: mediaType,
            progress,
            season,
            episode,
            completed,
            lastWatched: new Date(),
          },
        });
        return res.status(200).json(updatedWatching);
      }

      // Create new watching record
      const watching = await prismadb.watching.create({
        data: {
          profileId,
          contentId: mediaId.toString(),
          contentType: mediaType,
          progress,
          season,
          episode,
          completed,
          lastWatched: new Date(),
        },
      });

      return res.status(201).json(watching);
    }

    if (req.method === "DELETE") {
      const { currentUser } = await serverAuth(req, res);
      const { mediaId, profileId } = req.body;

      // Validate required fields
      if (!mediaId || !profileId) {
        return res.status(400).json({ error: "Missing required fields" });
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

      // Delete watching record
      await prismadb.watching.deleteMany({
        where: {
          profileId,
          contentId: mediaId.toString(),
        },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Watching API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
