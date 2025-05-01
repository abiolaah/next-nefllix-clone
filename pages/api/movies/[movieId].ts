import { NextApiRequest, NextApiResponse } from "next";
import { TMDB_BASE_URL, TMDB_ENDPOINTS } from "../../../lib/tmdb";
import prismadb from "@/lib/prismadb";
import { faker } from "@faker-js/faker";
import { mediaExtraData } from "@/constants/data";
import { TMDBVideo, MovieDetailsResponse } from "@/lib/types/api";

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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { movieId } = req.query;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: "TMDB API key is not configured" });
  }

  if (!movieId) {
    return res.status(400).json({ error: "Movie ID is required" });
  }

  try {
    // First, try to find the movie in MongoDB - but only if it seems like a MongoDB ID
    let localMovie = null;

    // Check if the ID looks like a MongoDB ObjectID(24 char hex string)
    const isValidObjectId =
      typeof movieId === "string" &&
      /^[0-9a-fA-F]{24}$/.test(movieId as string);

    if (isValidObjectId) {
      localMovie = await prismadb.movie.findUnique({
        where: {
          id: movieId as string,
        },
      });
    }

    if (localMovie) {
      // If found in MongoDB, return the local data

      // Find matching meida from mediaExtraData
      const mediaExtra = mediaExtraData.find(
        (media) => media.title === localMovie?.title
      );

      // Create fake similar movies
      const similarMovies = Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        title: faker.lorem.words({ min: 1, max: 5 }),
        description: faker.lorem.paragraph(),
        thumbnailUrl: faker.image.url(),
        releaseDate: faker.date.past().toISOString().split("T")[0],
        duration: `${faker.number.int({ min: 70, max: 180 })} minutes`,
        videoUrl: faker.internet.url(),
        trailerUrl: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(
          11
        )}`,
        isAdult: Math.random() >= 0.5,
        isTvShow: false,
      }));

      // Format the genre as an array of objects with id and name
      const genreArray = Array.isArray(localMovie.genre)
        ? localMovie.genre.map((name: string, index: number) => ({
            id: index + 1,
            name,
          }))
        : [];

      const response: MovieDetailsResponse = {
        details: {
          id: localMovie.id,
          title: localMovie.title,
          description: localMovie.description,
          videoUrl: localMovie.videoUrl,
          thumbnailUrl: localMovie.thumbnailUrl,
          trailerUrl: localMovie.trailerUrl,
          genre: genreArray,
          rating: localMovie.rating || 0,
          duration: localMovie.duration || "10 minutes",
          releaseDate: mediaExtra?.releaseDate || "",
          tagline: mediaExtra?.tagline || "",
          isAdult: mediaExtra?.isAdult || false,
          isTvShow: false,
          credits: {
            cast:
              mediaExtra?.cast?.map((name, index) => ({
                id: index + 1,
                name,
              })) || [],
            crew:
              mediaExtra?.director
                ?.map((name, index) => ({
                  id: index + 1000,
                  name,
                  department: "Directing",
                }))
                .concat(
                  mediaExtra?.writer?.map((name, index) => ({
                    id: index + 2000,
                    name,
                    department: "Writing",
                  })) || []
                ) || [],
          },
          videos: {
            results: [
              {
                key: localMovie.trailerUrl?.split("v=")[1] || "",
                site: "Youtube",
                type: "Trailer",
                official: true,
              },
            ],
          },
          keywords: {
            keywords:
              mediaExtra?.keywords?.map((keyword, index) => ({
                id: index + 1,
                name: keyword,
              })) || [],
          },
        },
        similar: similarMovies,
        source: "local",
      };
      return res.status(200).json(response);
    }

    // If not found in MongoDB, fetch from TMDB
    const detailsResponse = await fetch(
      `${TMDB_BASE_URL}${TMDB_ENDPOINTS.MOVIES.DETAILS(
        movieId as string
      )}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,keywords,similar`
    );

    if (!detailsResponse.ok) {
      throw new Error("Failed to fetch movie details from TMDB");
    }

    const movieDetails = await detailsResponse.json();

    // Process TMDB data to match our expected format
    const filteredCrew = movieDetails.credits?.crew
      ? movieDetails.credits.crew
          .filter(
            (person: { department: string }) =>
              person.department === "Directing" ||
              person.department === "Writing"
          )
          .map((person: { id: number; name: string; department: string }) => ({
            id: person.id,
            name: person.name,
            department: person.department,
          }))
      : [];

    // Process TMDB data to match our expected format
    const filteredCast = movieDetails.credits?.cast
      ? movieDetails.credits.cast.map(
          (person: { id: number; name: string }) => ({
            id: person.id,
            name: person.name,
          })
        )
      : [];

    // Find the best trailer URL
    const trailerUrl = findBestTrailerUrl(movieDetails.videos);

    // Process similar movies with additional API calls for each
    const similarMoviesPromises = (movieDetails.similar?.results || [])
      .slice(0, 8)
      .map(
        async (movie: {
          id: string;
          title?: string;
          overview?: string;
          poster_path?: string;
          release_date?: string;
          adult?: boolean;
          runtime?: number;
        }) => {
          try {
            // Fetch detailed info including runtime for each similar movie
            const detailedInfoResponse = await fetch(
              `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=videos`
            );

            if (detailedInfoResponse.ok) {
              const detailedInfo = await detailedInfoResponse.json();
              const similarTrailerUrl = findBestTrailerUrl(detailedInfo.videos);

              return {
                id: movie.id,
                title: movie.title || "",
                description: movie.overview || "",
                thumbnailUrl: movie.poster_path
                  ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                  : "",
                releaseDate: movie.release_date || "",
                duration: detailedInfo.runtime
                  ? `${detailedInfo.runtime} minutes`
                  : "120 minutes",
                videoUrl: "",
                trailerUrl: similarTrailerUrl,
                isAdult: movie.adult || false,
                isTvShow: false,
              };
            }

            // Fallback if detailed info fetch fails
            return {
              id: movie.id,
              title: movie.title || "",
              description: movie.overview || "",
              thumbnailUrl: movie.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                : "",
              releaseDate: movie.release_date || "",
              duration: "120 minutes",
              videoUrl: "",
              trailerUrl: "",
              isAdult: movie.adult || false,
              isTvShow: false,
            };
          } catch (error) {
            console.error(
              `Error fetching details for similar movie ${movie.id}:`,
              error
            );

            // Return basic info if fetch fails
            return {
              id: movie.id,
              title: movie.title || "",
              description: movie.overview || "",
              thumbnailUrl: movie.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                : "",
              releaseDate: movie.release_date || "",
              duration: movie.runtime || "N/A",
              videoUrl: "",
              trailerUrl: "",
              isAdult: movie.adult || false,
              isTvShow: false,
            };
          }
        }
      );

    // Wait for all similar movie detail requests to complete
    const similarMovies = await Promise.all(similarMoviesPromises);

    const response: MovieDetailsResponse = {
      details: {
        id: movieDetails.id,
        title: movieDetails.title || "",
        description: movieDetails.overview || "",
        videoUrl: "",
        thumbnailUrl: movieDetails.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}`
          : "",
        trailerUrl,
        genre: movieDetails.genres || [],
        rating: movieDetails.vote_average || 0,
        duration: movieDetails.runtime
          ? `${movieDetails.runtime} minutes`
          : "120 minutes",
        releaseDate: movieDetails.release_date || "",
        tagline: movieDetails.tagline || "",
        isAdult: movieDetails.adult || false,
        isTvShow: false,
        credits: {
          cast: filteredCast,
          crew: filteredCrew,
        },
        videos: movieDetails.videos || { results: [] },
        keywords: movieDetails.keywords || { keywords: [] },
      },
      similar: similarMovies,
      source: "tmdb",
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching movie data:", error);
    return res.status(500).json({ error: "Failed to fetch movie data" });
  }
};

export default handler;
