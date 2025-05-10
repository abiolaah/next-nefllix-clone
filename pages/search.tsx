import type React from "react";
import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import InfoModal from "@/components/InfoModal";
import Navbar from "@/components/Navbar";
import useInfoModal from "@/hooks/useInfoModal";
import MovieCard from "@/components/MovieCard";
import type { MediaItem } from "@/lib/types/api";

const Search = () => {
  const router = useRouter();
  const { q } = router.query;
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen, closeModal } = useInfoModal();

  // Mock Data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchMockResults: MediaItem[] = [
    {
      id: "1",
      title: "CARRY-ON",
      thumbnailUrl: "/images/placeholder.jpg",
      description: "A carry-on bag with a sleek design.",
      videoUrl: "",
      trailerUrl: "",
      genre: ["Action", "Adventure"],
      rating: 0,
      isAdult: false,
      duration: "107 minutes",
      isTvShow: false,
      source: "local",
    },
    {
      id: "2",
      title: "THE ROSHANS",
      thumbnailUrl: "/images/placeholder.jpg",
      description: "A documentary about historic events.",
      videoUrl: "",
      trailerUrl: "",
      genre: ["Documentary", "Historic"],
      rating: 0,
      isAdult: false,
      numberOfSeasons: 1,
      isTvShow: true,
      source: "local",
    },
    // Add more mock items following the same pattern
  ];

  // Fetch search results when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!q) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(q as string)}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSearchResults();
  }, [q]);

  // Render search results or empty state
  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      );
    }

    if (!q) {
      return (
        <div className="text-center py-12">
          <p className="text-lg text-gray-400">
            Enter a search term to find movies and TV shows
          </p>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg text-gray-400">
            No results found for &quot;{q}&quot;
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try different keywords or check your spelling
          </p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
        {searchResults.map((movie) => (
          <div key={movie.id} className="w-[16vw] netflix-card-container">
            <MovieCard data={movie} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <InfoModal visible={isOpen} onClose={closeModal} />
      <Navbar />
      <div className="pt-20 px-4 md:px-16 pb-40">
        <h2 className="text-2xl font-bold text-white mb-4">
          {isLoading ? "Searching..." : `Results for "${q}"`}
        </h2>
        <div className="relative mt-8 netflix-list-container">
          {/* Container - using a similar structure to MovieList but with grid layout */}
          <div className="px-4 md:px-12">{renderSearchResults()}</div>
        </div>
      </div>
    </>
  );
};

export default Search;
