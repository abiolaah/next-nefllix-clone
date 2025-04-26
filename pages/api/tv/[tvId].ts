import { NextApiRequest, NextApiResponse } from "next";
import { TMDB_BASE_URL, TMDB_ENDPOINTS } from "../../../lib/tmdb";
import prismadb from "@/lib/prismadb";
import { faker } from "@faker-js/faker";
import { TMDBVideo, TvShowDetailsResponse } from "@/lib/types/api";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

// Helper function to find best trailer URL from vidoes
const findBestTrailerUrl = (videos: { results: TMDBVideo[] }): string => {
  if (!videos || !videos.results || videos.results.length === 0) {
    return "";
  }

  const officialTrailer = videos.results.find(
    (video: TMDBVideo) =>
      video.type === "Trailer" &&
      video.site === "YouTube" &&
      video.official === true
  );

  const anyTrailer = videos.results.find(
    (video: TMDBVideo) => video.type === "Trailer" && video.site === "YouTube"
  );

  const anyVideo = videos.results.find(
    (video: TMDBVideo) => video.site === "YouTube"
  );

  const trailer = officialTrailer || anyTrailer || anyVideo;

  if (trailer) {
    return `https://www.youtube.com/watch?v=${trailer.key}`;
  }

  return "";
};

// Helper function to generate name without titles
const generateNameWithoutTitle = (): string => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return `${firstName} ${lastName}`;
};

// Helper function to format season display
const formattedSeasonText = (season: number): string => {
  const formattedSeasons = season > 1 ? `${season} seasons` : "1 season";

  return formattedSeasons;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tvId } = req.query;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: "TMDB API key is not configured" });
  }

  if (!tvId) {
    return res.status(400).json({ error: "TV Show ID is required" });
  }

  try {
    // First, try to find the movie in MongoDB - but only if it seems like a MongoDB ID
    let localTvShow = null;

    // Check if the ID looks like a MongoDB ObjectID(24 char hex string)
    const isValidObjectId =
      typeof tvId === "string" && /^[0-9a-fA-F]{24}$/.test(tvId as string);

    if (isValidObjectId) {
      localTvShow = await prismadb.tvShow.findUnique({
        where: {
          id: tvId as string,
        },
      });
    }

    if (localTvShow) {
      // If found in MongoDB, return the local data
      // Generate fake data for fields not available in local source
      const isAdult = Math.random() >= 0.5;
      const releaseDate = faker.date.past().toISOString().split("T")[0];
      const tagline = faker.lorem.sentence();

      // Similar TV Shows
      const similarTvShows = Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        title: faker.lorem.words({ min: 1, max: 5 }),
        description: faker.lorem.paragraph(),
        thumbnailUrl: faker.image.url(),
        releaseDate: faker.date.past().toISOString().split("T")[0],
        numberOfSeasons: `${faker.number.int({ min: 1, max: 20 })} seasons`,
        videoUrl: faker.internet.url(),
        trailerUrl: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(
          11
        )}`,
        isAdult: Math.random() >= 0.5,
        isTvShow: true,
      }));

      // Create fake cast and crew
      const cast = Array.from({ length: 8 }, () => ({
        id: faker.number.int({ min: 1000, max: 9999999 }),
        name: generateNameWithoutTitle(),
      }));

      const createdBy = [
        {
          id: faker.number.int({ min: 1000, max: 9999999 }),
          name: generateNameWithoutTitle(),
        },
        {
          id: faker.number.int({ min: 1000, max: 9999999 }),
          name: generateNameWithoutTitle(),
        },
      ];

      // Create fake videos
      const videos = {
        results: [
          {
            key: faker.string.alphanumeric(11),
            name: "Official Trailer",
            site: "YouTube",
            type: "Trailer",
            official: true,
          },
          {
            key: faker.string.alphanumeric(11),
            name: "Official Trailer",
            site: "YouTube",
            type: "Clip",
            official: true,
          },
        ],
      };

      // Create fake keywords
      const keywords = {
        keywords: Array.from({ length: 5 }, () => ({
          id: faker.number.int({ min: 1000, max: 9999 }),
          name: faker.word.sample(),
        })),
      };

      // Format the genre as an array of objects with id and name
      const genreArray = Array.isArray(localTvShow.genre)
        ? localTvShow.genre.map((name: string, index: number) => ({
            id: faker.number.int({ min: 1, max: 1000 }) + index,
            name,
          }))
        : [];

      const seasonsArray = Array.from(
        { length: localTvShow.numberOfSeasons || 1 },
        (_, i) => ({
          id: faker.number.int({ min: 1000, max: 9999 }),
          season_number: i + 1,
          episodes: Array.from(
            { length: faker.number.int({ min: 6, max: 24 }) },
            (_, i) => ({
              id: faker.number.int({ min: 1000, max: 9999 }),
              episodeType: faker.helpers.arrayElement([
                "standard",
                "special",
                "finale",
              ]),
              name: faker.lorem.words({ min: 2, max: 5 }),
              description: faker.lorem.paragraph(),
              duration: `${faker.number.int({ min: 20, max: 60 })} minutes`,
              episodeNumber: i + 1,
              thumbnailUrl: faker.image.url(),
            })
          ),
        })
      );

      const response: TvShowDetailsResponse = {
        details: {
          id: localTvShow.id,
          title: localTvShow.title,
          description: localTvShow.description,
          trailerUrl: localTvShow.trailerUrl,
          thumbnailUrl: localTvShow.thumbnailUrl,
          genre: genreArray,
          rating: localTvShow.rating || 0,
          numberOfSeasons: formattedSeasonText(localTvShow.numberOfSeasons),
          releaseDate,
          tagline,
          isAdult,
          isTvShow: true,
          credits: {
            cast,
          },
          keywords,
          videos,
          seasons: seasonsArray,
          createdBy,
        },
        similar: similarTvShows,
        source: "local",
      };
      return res.status(200).json(response);
    }

    // If not found in MongoDB, fetch from TMDB with additional details
    const detailsResponse = await fetch(
      `${TMDB_BASE_URL}${TMDB_ENDPOINTS.TV.DETAILS(
        tvId as string
      )}?api_key=${TMDB_API_KEY}&append_to_response=credits,keywords,videos,similar`
    );

    if (!detailsResponse.ok) {
      throw new Error("Failed to fetch TV show details from TMDB");
    }

    const tvDetails = await detailsResponse.json();

    // Fetch seasons with episodes details
    const seasonsArray = await Promise.all(
      (tvDetails.seasons || []).map(
        async (season: {
          id: number;
          season_number: number;
          episode: Array<{
            id: number;
            episode_type: string;
            name: string;
            overview: string;
            runtime: string;
            episode_number: number;
            still_path: string;
          }>;
        }) => {
          try {
            const seasonResponse = await fetch(
              `${TMDB_BASE_URL}/tv/${tvId}/season/${season.season_number}?api_key=${TMDB_API_KEY}`
            );

            if (!seasonResponse.ok) {
              return {
                id: season.id,
                season_number: season.season_number,
                episodes: [],
              };
            }

            const seasonData = await seasonResponse.json();

            const episodes = seasonData.episodes.map(
              (episode: {
                id: number;
                episode_type: string;
                name: string;
                overview: string;
                runtime: string;
                episode_number: number;
                still_path: string;
              }) => ({
                id: episode.id,
                episodeType: episode.episode_type || "standard",
                name: episode.name,
                description: episode.overview,
                duration: `${episode.runtime || 30} minutes`,
                episodeNumber: episode.episode_number,
                thumbnailUrl: episode.still_path
                  ? `${TMDB_IMAGE_BASE_URL}${episode.still_path}`
                  : "",
              })
            );

            return {
              id: season.id,
              season_number: season.season_number,
              episodes,
            };
          } catch (error) {
            console.error(
              `Error fetching season ${season.season_number}:`,
              error
            );
            return {
              id: season.id,
              season_number: season.season_number,
              episodes: [],
            };
          }
        }
      )
    );

    // Process TMDB data to match our expected format
    const filteredCast = tvDetails.credits?.cast
      ? tvDetails.credits.cast.map((person: { id: number; name: string }) => ({
          id: person.id,
          name: person.name,
        }))
      : [];

    // Find the best trailer URL
    const trailerUrl = findBestTrailerUrl(tvDetails.videos);

    // Process similar movies with additional API calls for each
    const similarTvShowPromises = (tvDetails.similar?.results || [])
      .slice(0, 8)
      .map(
        async (tvShow: {
          id: string;
          title: string;
          overview?: string;
          poster_path?: string;
          release_date?: string;
          adult?: boolean;
          number_of_seasons?: number;
        }) => {
          try {
            // Fetch detailed info including runtime for each similar tv show
            const detailedInfoResponse = await fetch(
              `${TMDB_BASE_URL}/tv/${tvShow.id}?api_key=${TMDB_API_KEY}&append_to_response=videos`
            );

            if (detailedInfoResponse.ok) {
              const detailedInfo = await detailedInfoResponse.json();
              const similarTrailerUrl = findBestTrailerUrl(detailedInfo.videos);

              return {
                id: tvShow.id,
                title: tvShow.title || "",
                description: tvShow.overview || "",
                thumbnailUrl: tvShow.poster_path
                  ? `${TMDB_IMAGE_BASE_URL}${tvShow.poster_path}`
                  : "",
                releaseDate: tvShow.release_date || "",
                numberOfSeason: detailedInfo.number_of_seasons
                  ? formattedSeasonText(detailedInfo.number_of_seasons)
                  : "1 season",
                videoUrl: "",
                trailerUrl: similarTrailerUrl,
                isAdult: tvShow.adult || false,
                isTvShow: true,
              };
            }

            // Fallback if detailed info fetch fails
            return {
              id: tvShow.id,
              title: tvShow.title || "",
              description: tvShow.overview || "",
              thumbnailUrl: tvShow.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${tvShow.poster_path}`
                : "",
              releaseDate: tvShow.release_date || "",
              numberOfSeasons: "1 Season",
              videoUrl: "",
              trailerUrl: "",
              isAdult: tvShow.adult || false,
              isTvShow: true,
            };
          } catch (error) {
            console.error(
              `Error fetching details for similar movie ${tvShow.id}:`,
              error
            );
            return {
              id: tvShow.id,
              title: tvShow.title || "",
              description: tvShow.overview || "",
              thumbnailUrl: tvShow.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${tvShow.poster_path}`
                : "",
              releaseDate: tvShow.release_date || "",
              numberOfSeasons: "1 Season",
              videoUrl: "",
              trailerUrl: "",
              isAdult: tvShow.adult || false,
              isTvShow: true,
            };
          }
        }
      );

    // Wait for all similar movie detail requests to complete
    const similarTvShows = await Promise.all(similarTvShowPromises);

    const response: TvShowDetailsResponse = {
      details: {
        id: tvDetails.id,
        title: tvDetails.title || "",
        description: tvDetails.overview || "",
        thumbnailUrl: tvDetails.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${tvDetails.poster_path}`
          : "",
        trailerUrl,
        genre: tvDetails.genres || [],
        rating: tvDetails.vote_average || 0,
        numberOfSeasons: formattedSeasonText(tvDetails.number_of_seasons),
        releaseDate: tvDetails.release_date || "",
        tagline: tvDetails.tagline || "",
        isAdult: tvDetails.adult || false,
        isTvShow: true,
        credits: {
          cast: filteredCast,
        },
        videos: tvDetails.videos || { results: [] },
        keywords: tvDetails.keywords || { keywords: [] },
        seasons: seasonsArray,
      },
      similar: similarTvShows,
      source: "tmdb",
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching TV show data:", error);
    return res.status(500).json({ error: "Failed to fetch TV show data" });
  }
};

export default handler;
