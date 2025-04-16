import React from "react";
import Navbar from "@/components/Navbar";

const TvShow = () => {
  return (
    <div>
      <Navbar />
      <div className="pt-20 px-4 md:px-16 pb-40">
        <h1 className="text-white text-3xl font-bold mt-8 mb-6">
          Browse By language
        </h1>
      </div>
    </div>
  );
};

export default TvShow;
