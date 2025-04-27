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
      const { mediaId, profileId, mediaType, source = "tmdb" } = req.body; // Default to "tmdb" if not provided

      // Validate required fields
      if (!mediaId || !profileId || !mediaType) {
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

      // Check if already favorited with the same source
      const existingFavourite = await prismadb.favourite.findFirst({
        where: {
          profileId,
          contentId: mediaId.toString(),
          contentType: mediaType,
          source, // Match the exact source
        },
      });

      if (existingFavourite) {
        return res.status(200).json(existingFavourite);
      }

      // Create new favorite with explicit source
      const favourite = await prismadb.favourite.create({
        data: {
          profileId,
          contentId: mediaId.toString(),
          contentType: mediaType,
          source, // Use the provided source
        },
      });

      return res.status(201).json(favourite);
    }

    if (req.method === "DELETE") {
      const { currentUser } = await serverAuth(req, res);
      const { mediaId, profileId, source = "tmdb" } = req.body; // Default to "tmdb" if not provided

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

      // Delete with explicit source matching
      await prismadb.favourite.deleteMany({
        where: {
          profileId,
          contentId: mediaId.toString(),
          source, // Match the exact source
        },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Favorites API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
