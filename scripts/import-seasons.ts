// Import script for loading tvshow-seasons.json into MongoDB using Prisma with TypeScript in Next.js
// File: scripts/import-seasons.ts

import { PrismaClient } from "../generated/prisma";
import fs from "fs";
import path from "path";

// Define interfaces to match our JSON structure
interface EpisodeData {
  episodeNumber: number;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
}

interface SeasonData {
  seasonNumber: number;
  episodes: EpisodeData[];
}

interface TvShowSeasonsData {
  tvShowTitle: string;
  seasons: SeasonData[];
}

// Initialize Prisma client
const prisma = new PrismaClient();

async function importSeasons() {
  try {
    // Read the JSON file
    const seasonsJsonPath = path.join(process.cwd(), "tvshow-seasons.json");
    const seasonsData: TvShowSeasonsData[] = JSON.parse(
      fs.readFileSync(seasonsJsonPath, "utf8")
    );

    console.log(`Found ${seasonsData.length} TV shows to process`);

    // Delete all existing data first
    console.log("Deleting all existing episodes...");
    await prisma.episode.deleteMany({});
    console.log("Deleting all existing seasons...");
    await prisma.season.deleteMany({});
    console.log("All existing seasons and episodes cleared successfully!");

    // Process each TV show
    for (const tvShowData of seasonsData) {
      // Find the TV show in the database
      const tvShow = await prisma.tvShow.findFirst({
        where: {
          title: tvShowData.tvShowTitle,
        },
      });

      if (!tvShow) {
        console.log(`TV show not found: ${tvShowData.tvShowTitle}`);
        continue;
      }

      console.log(`Processing seasons for TV show: ${tvShow.title}`);

      // Process each season
      for (const seasonData of tvShowData.seasons) {
        // Create the season
        const season = await prisma.season.create({
          data: {
            seasonNumber: seasonData.seasonNumber,
            tvShowId: tvShow.id,
          },
        });

        console.log(`Created season ${season.seasonNumber}`);

        // Process each episode
        for (const episodeData of seasonData.episodes) {
          await prisma.episode.create({
            data: {
              episodeNumber: episodeData.episodeNumber,
              title: episodeData.title,
              description: episodeData.description,
              duration: episodeData.duration,
              videoUrl: episodeData.videoUrl,
              thumbnailUrl: episodeData.thumbnailUrl,
              seasonId: season.id,
            },
          });

          console.log(
            `Created episode ${episodeData.episodeNumber}: ${episodeData.title}`
          );
        }
      }

      console.log(`Completed processing for TV show: ${tvShow.title}`);
    }

    console.log("Import of seasons and episodes completed successfully!");
  } catch (error) {
    console.error(
      "Error importing seasons:",
      error instanceof Error ? error.message : "Unknown error"
    );
  } finally {
    // Close the Prisma client connection
    await prisma.$disconnect();
  }
}

// Run the import function
importSeasons();
