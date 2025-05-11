import type React from "react";
import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import InfoModal from "@/components/InfoModal";
import Navbar from "@/components/Navbar";
import useInfoModal from "@/hooks/useInfoModal";
import MovieCard from "@/components/MovieCard";
import type { MediaItem } from "@/lib/types/api";
import useProfile from "@/hooks/useProfile";

const Search = () => {
  const router = useRouter();
  const { currentProfileId } = useProfile();

  const { q } = router.query;
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isRecommendationsLoading, setIsRecommendationsLoading] =
    useState(false);

  const { isOpen, closeModal } = useInfoModal();

  // Fetch search results when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!q) {
        setSearchResults([]);
        setRecommendations([]);
        return;
      }

      setIsSearchLoading(true);

      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(q as string)}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsSearchLoading(false);
      }
    };
    fetchSearchResults();
  }, [q]);

  // Fetch recommendations after search results are loaded
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentProfileId || !q) {
        setRecommendations([]);
        return;
      }

      setIsRecommendationsLoading(true);

      try {
        const response = await fetch(
          `/api/recommend?profileId=${encodeURIComponent(currentProfileId)}`
        );
        const data = await response.json();
        setRecommendations(data.results || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsRecommendationsLoading(false);
      }
    };
    if (searchResults.length > 0) {
      fetchRecommendations();
    }
  }, [currentProfileId, q, searchResults]);

  console.log(recommendations);

  // Render search results or empty state
  const renderSearchResults = () => {
    if (isSearchLoading) {
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
        {searchResults.map((media) => (
          <div key={media.id} className="w-[16vw] netflix-card-container">
            <MovieCard data={media} />
          </div>
        ))}
      </div>
    );
  };

  // Render recommendations section
  const renderRecommendations = () => {
    if (!q || searchResults.length === 0) return null;

    if (isRecommendationsLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      );
    }

    if (recommendations.length === 0) return null;

    return (
      <>
        <h2 className="text-2xl font-bold text-white mb-4 mt-12">
          Recommendations based on your preferences
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
          {recommendations.map((media) => (
            <div key={media.id} className="w-[16vw] netflix-card-container">
              <MovieCard data={media} />
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      <InfoModal visible={isOpen} onClose={closeModal} />
      <Navbar />
      <div className="pt-20 px-4 md:px-16 pb-40">
        <h2 className="text-2xl font-bold text-white mb-4">
          {isSearchLoading ? "Searching..." : `Results for "${q}"`}
        </h2>
        <div className="relative mt-8 netflix-list-container">
          {/* Container - using a similar structure to MovieList but with grid layout */}
          <div className="px-4 md:px-12">
            {renderSearchResults()}
            {renderRecommendations()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
