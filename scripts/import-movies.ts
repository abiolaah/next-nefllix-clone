// Import script for loading movies.json into MongoDB using Prisma with TypeScript in Next.js
// File: scripts/import-movies.ts

import { PrismaClient } from "../generated/prisma";
import fs from "fs";
import path from "path";

// Define the Movie interface to match our JSON structure
interface MovieData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string;
  rating: number;
  duration: string;
}

// Initialize Prisma client
const prisma = new PrismaClient();

async function importMovies() {
  try {
    // Read the JSON file
    const moviesJsonPath = path.join(process.cwd(), "movies.json");
    const moviesData: MovieData[] = JSON.parse(
      fs.readFileSync(moviesJsonPath, "utf8")
    );

    console.log(`Found ${moviesData.length} movies to import`);

    // Process each movie entry
    for (const movie of moviesData) {
      // Create the movie in the database
      await prisma.movie.create({
        data: {
          title: movie.title,
          description: movie.description,
          videoUrl: movie.videoUrl,
          thumbnailUrl: movie.thumbnailUrl,
          genre: movie.genre,
          rating: movie.rating !== undefined ? movie.rating : null,
          duration: movie.duration,
        },
      });

      console.log(`Imported movie: ${movie.title}`);
    }

    console.log("Import completed successfully!");
  } catch (error) {
    console.error(
      "Error importing movies:",
      error instanceof Error ? error.message : "Unknown error"
    );
  } finally {
    // Close the Prisma client connection
    await prisma.$disconnect();
  }
}

// Run the import function
importMovies();
