import { NextApiRequest, NextApiResponse } from "next";

import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const { currentUser } = await serverAuth(req, res);
    const { profileId } = req.query;

    if (!profileId || typeof profileId !== "string") {
      throw new Error("Invalid profile ID");
    }

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

    // Get all favourites for the profile
    const favourites = await prismadb.favourite.findMany({
      where: {
        profileId,
      },
    });

    // Separate movie and Tv shows IDs
    const movieIds = favourites
      .filter((fav) => fav.contentType === "movie")
      .map((fav) => fav.contentId);

    const tvShowIds = favourites
      .filter((fav) => fav.contentType === "tv")
      .map((fav) => fav.contentId);

    // Fetch all favourites movies and TV shows in parallel
    const [favouriteMovies, favouriteTvShows] = await Promise.all([
      prismadb.movie.findMany({
        where: {
          id: {
            in: movieIds,
          },
        },
      }),
      prismadb.tvShow.findMany({
        where: {
          id: {
            in: tvShowIds,
          },
        },
      }),
    ]);

    return res.status(200).json({
      movies: favouriteMovies,
      tvShows: favouriteTvShows,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
