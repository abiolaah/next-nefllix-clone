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

      const { mediaId, profileId, mediaType } = req.body;

      // Validate profile belongs to user
      const profile = await prismadb.profile.findFirst({
        where: {
          id: profileId,
          userId: currentUser.id,
        },
      });

      if (!profile) {
        throw new Error("Invalid profile");
      }

      // Check if media exists in the appropriate table
      if (mediaType === "movie") {
        const existingMovie = await prismadb.movie.findUnique({
          where: { id: mediaId },
        });
        if (!existingMovie) {
          throw new Error("Invalid movie ID");
        }
      } else if (mediaType === "tv") {
        const existingTv = await prismadb.tvShow.findUnique({
          where: { id: mediaId },
        });

        if (!existingTv) {
          throw new Error("Invalid TV ID");
        }
      } else {
        throw new Error("Invalid media type");
      }

      // Check if already favourited
      const existingFavourites = await prismadb.favourite.findFirst({
        where: {
          profileId,
          contentId: mediaId,
          contentType: mediaType,
        },
      });

      if (existingFavourites) {
        return res.status(200).json(existingFavourites);
      }

      const favourite = await prismadb.favourite.create({
        data: {
          profileId,
          contentId: mediaId,
          contentType: mediaType,
        },
      });

      return res.status(200).json(favourite);
    }

    if (req.method === "DELETE") {
      const { currentUser } = await serverAuth(req, res);

      const { mediaId, profileId } = req.body;

      // Validate profile belongs to user
      const profile = await prismadb.profile.findFirst({
        where: {
          id: profileId,
          userId: currentUser.id,
        },
        include: {
          user: true,
        },
      });

      if (!profile) {
        throw new Error("Invalid profile");
      }

      const deleteFavourite = await prismadb.favourite.deleteMany({
        where: {
          profileId,
          contentId: mediaId,
        },
      });
      return res.status(200).json(deleteFavourite);
    }

    return res.status(405).end();
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
