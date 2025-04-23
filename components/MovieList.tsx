"use client";

import React, { useEffect, useRef, useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import MovieCard from "./MovieCard";
import type { MediaItem } from "@/lib/types/api";

interface MovieListProps {
  data: MediaItem[];
  title: string;
}

const MovieList: React.FC<MovieListProps> = ({ data, title }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check if there's content to scroll horizontally
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

        setIsScrolled(scrollLeft > 0);
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
      }
    };

    // Initial check
    checkScroll();

    // Add resize listener
    window.addEventListener("resize", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
    };
  }, [data]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8; // Scroll 80% of visible width
      const scrollTo =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setIsScrolled(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  return (
    <div className="relative px-4 md:px-12 mt-8 netflix-list-container">
      {/* Title and section area */}
      <h2 className="text-white text-xl md:text-2xl font-semibold mb-4 px-4 md:px-12">
        {title}
      </h2>
      {/* Container with navigation */}
      <div className="relative flex items-center">
        {/* Left Arrow - Outside the scroll container */}

        <div className="absolute left-0 z-40 px-1" style={{ left: "-5px" }}>
          {isScrolled && (
            <button
              onClick={() => scroll("left")}
              className="bg-black/70 hover:bg-black/90 rounded-full p-2 transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
              title="Scroll left"
            >
              <BsChevronLeft className="h-8 w-8 text-white" />
            </button>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex space-x-4 overflow-x-scroll scrollbar-hide scroll-smooth group px-12"
          style={{ padding: "0.5rem 48px" }}
        >
          {data.map((movie) => (
            <div
              key={movie.id}
              className="flex-none w-[16vw] netflix-card-container"
            >
              <MovieCard data={movie} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <div className="absolute right-0 z-40 px-1" style={{ right: "-5px" }}>
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className=" bg-black/70 hover:bg-black/90 rounded-full p-2 transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
              title="Scroll right"
            >
              <BsChevronRight className="h-8 w-8 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieList;
