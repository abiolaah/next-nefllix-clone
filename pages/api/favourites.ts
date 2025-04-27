// pages/api/favourites.ts
import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import { TMDB_BASE_URL } from "@/lib/tmdb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { currentUser } = await serverAuth(req, res);
    const { profileId } = req.query;

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

    // Get all favorites
    const favourites = await prismadb.favourite.findMany({
      where: { profileId },
    });

    // Process favorites in parallel
    const results = await Promise.all(
      favourites.map(async (fav) => {
        try {
          if (fav.source === "local") {
            if (fav.contentType === "movie") {
              const movie = await prismadb.movie.findUnique({
                where: { id: fav.contentId },
              });
              return movie
                ? { ...movie, isTvShow: false, source: "local" }
                : null;
            } else {
              const tvShow = await prismadb.tvShow.findUnique({
                where: { id: fav.contentId },
              });
              return tvShow
                ? { ...tvShow, isTvShow: true, source: "local" }
                : null;
            }
          } else {
            // TMDB item
            const endpoint = fav.contentType === "movie" ? "movie" : "tv";
            const response = await fetch(
              `${TMDB_BASE_URL}/${endpoint}/${fav.contentId}?api_key=${process.env.TMDB_API_KEY}`
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
                fav.contentType === "movie"
                  ? data.runtime
                    ? `${data.runtime} minutes`
                    : ""
                  : "",
              numberOfSeasons:
                fav.contentType === "tv" ? data.number_of_seasons : undefined,
              isTvShow: fav.contentType === "tv",
              isAdult: data.adult || false,
              source: "tmdb",
            };
          }
        } catch (error) {
          console.error(`Error processing favorite ${fav.contentId}:`, error);
          return null;
        }
      })
    );

    return res.status(200).json(results.filter(Boolean));
  } catch (error) {
    console.error("Favorites API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
