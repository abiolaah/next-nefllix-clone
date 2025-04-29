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
        reactionType,
        source = "tmdb",
      } = req.body;

      // Validate required fields
      if (!mediaId || !profileId || !mediaType || !reactionType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate reaction type
      if (
        !["liked", "loved", "disliked"].includes(reactionType.toLowerCase())
      ) {
        return res
          .status(400)
          .json({
            error: "Invalid reaction type. Must be liked, loved, or disliked",
          });
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

      // Check if already reacted
      const existingReaction = await prismadb.reaction.findFirst({
        where: {
          profileId,
          contentId: mediaId.toString(),
        },
      });

      if (existingReaction) {
        // Update existing reaction
        const updatedReaction = await prismadb.reaction.update({
          where: { id: existingReaction.id },
          data: {
            reactionType: reactionType.toLowerCase(),
            source,
            contentType: mediaType,
          },
        });
        return res.status(200).json(updatedReaction);
      }

      // Create new reaction
      const reaction = await prismadb.reaction.create({
        data: {
          profileId,
          contentId: mediaId.toString(),
          contentType: mediaType,
          reactionType: reactionType.toLowerCase(),
          source,
        },
      });

      return res.status(201).json(reaction);
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

      // Delete reaction
      await prismadb.reaction.deleteMany({
        where: {
          profileId,
          contentId: mediaId.toString(),
        },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Reaction API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
