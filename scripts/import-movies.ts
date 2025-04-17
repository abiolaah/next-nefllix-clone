// Import script for loading movies.json into MongoDB using Prisma with TypeScript in Next.js
// File: scripts/import-movies.ts

import { PrismaClient } from "../generated/prisma";
import fs from "fs";
import path from "path";

// Define interfaces to match our JSON structure
interface BaseMedia {
  type: "movie" | "tvShow";
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  trailerUrl: string;
  genre: string[];
  rating?: number;
}

interface MovieData extends BaseMedia {
  type: "movie";
  duration: string;
}

interface TvShowData extends BaseMedia {
  type: "tvShow";
  numberOfSeasons: number;
}

type MediaData = MovieData | TvShowData;

// Initialize Prisma client
const prisma = new PrismaClient();

async function importMedia() {
  try {
    // Read the JSON file
    const mediaJsonPath = path.join(process.cwd(), "movies.json");
    const mediaData: MediaData[] = JSON.parse(
      fs.readFileSync(mediaJsonPath, "utf8")
    );

    console.log(`Found ${mediaData.length} items to import`);

    // Delete all existing data first
    console.log("Deleting all existing movies...");
    await prisma.movie.deleteMany({});
    console.log("Deleting all existing TV shows...");
    await prisma.tvShow.deleteMany({});
    console.log("All existing data cleared successfully!");

    // Process each entry
    for (const item of mediaData) {
      if (item.type === "movie") {
        // Create the movie in the database
        await prisma.movie.create({
          data: {
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl,
            thumbnailUrl: item.thumbnailUrl,
            trailerUrl: item.trailerUrl,
            genre: item.genre,
            rating: item.rating !== undefined ? item.rating : null,
            duration: item.duration,
          },
        });
        console.log(`Imported movie: ${item.title}`);
      } else if (item.type === "tvShow") {
        // Create the TV show in the database
        await prisma.tvShow.create({
          data: {
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl,
            thumbnailUrl: item.thumbnailUrl,
            trailerUrl: item.trailerUrl,
            genre: item.genre,
            rating: item.rating !== undefined ? item.rating : null,
            numberOfSeasons: item.numberOfSeasons,
          },
        });
        console.log(`Imported TV show: ${item.title}`);
      }
    }

    console.log("Import completed successfully!");
  } catch (error) {
    console.error(
      "Error importing media:",
      error instanceof Error ? error.message : "Unknown error"
    );
  } finally {
    // Close the Prisma client connection
    await prisma.$disconnect();
  }
}

// Run the import function
importMedia();
