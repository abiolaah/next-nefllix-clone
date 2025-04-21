"use client";

import React, { useRef, useState } from "react";
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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setIsScrolled(scrollRef.current.scrollLeft > 0);
    }
  };

  return (
    <div className="relative px-4 md:px-12 mt-8 netflix-list-container">
      <h2 className="text-white text-xl md:text-2xl font-semibold mb-4">
        {title}
      </h2>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex space-x-4 overflow-x-scroll scrollbar-hide scroll-smooth"
          style={{ position: "relative" }}
        >
          {data.map((movie, index) => (
            <div
              key={movie.id}
              className="flex-none w-[16vw] netflix-card-container"
              style={{ position: "relative" }}
            >
              <MovieCard data={movie} index={index} totalItems={data.length} />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-1/3 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all duration-300 ${
            isScrolled ? "opacity-100" : "opacity-0"
          } hover:opacity-100 z-20`}
          aria-label="Scroll left"
          title="Scroll left"
        >
          <BsChevronLeft className="h-8 w-8 text-white" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/3 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all duration-300 opacity-0 hover:opacity-100 z-20"
          aria-label="Scroll right"
          title="Scroll right"
        >
          <BsChevronRight className="h-8 w-8 text-white" />
        </button>
      </div>
    </div>
  );
};

export default MovieList;
