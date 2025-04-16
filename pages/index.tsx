import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { BsChevronDown, BsChevronRight, BsPlus } from "react-icons/bs";
import Input from "@/components/Input";
import { faq, trendingShows, features } from "@/constants/data";
import { useRouter } from "next/router";

const TOP_OFFSET = 66;

const languages = ["English", "Spanish", "French"];

const Browse = () => {
  const [showBackground, setShowBackground] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [email, setEmail] = useState("");
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > TOP_OFFSET) {
        setShowBackground(true);
      } else {
        setShowBackground(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleLanguageMenu = useCallback(() => {
    setShowLanguageMenu((current) => !current);
  }, []);

  const selectLanguage = useCallback((language: string) => {
    setSelectedLanguage(language);
    setShowLanguageMenu(false);
  }, []);

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="flex flex-col bg-black">
      {/* Header - Improved for larger screens */}
      <nav className="w-full fixed z-40">
        <div
          className={`px-4 md:px-16 py-4 md:py-6 flex flex-row items-center transition duration-500 ${
            showBackground ? `bg-zinc-900/90` : ``
          }`}
        >
          <Image
            src="https://res.cloudinary.com/dixwarqdb/image/upload/v1744711014/symbol_z9ukjf.png"
            width={120}
            height={48}
            alt="Symbol Logo"
            className="h-10 md:h-12 lg:h-16 w-auto object-contain"
            priority
          />

          <div className="flex flex-row ml-auto gap-3 md:gap-7 items-center">
            <div className="text-gray-200 hover:text-gray-300 cursor-pointer transition relative">
              <div
                onClick={toggleLanguageMenu}
                className="flex flex-row items-center justify-between rounded-full px-2 md:px-3 py-1 border border-white"
              >
                <span className="text-white text-xs md:text-sm mr-1 md:mr-2">
                  {selectedLanguage}
                </span>
                <BsChevronDown
                  className={`text-white transition ${
                    showLanguageMenu ? "rotate-180" : "rotate-0"
                  }`}
                  size={14}
                />
              </div>
              {showLanguageMenu && (
                <div className="absolute top-full mt-1 w-full bg-black border border-gray-800 rounded">
                  {languages.map((language) => (
                    <div
                      key={language}
                      className={`px-3 py-2 text-sm text-white hover:bg-gray-800 cursor-pointer ${
                        language === selectedLanguage ? "bg-gray-700" : ""
                      }`}
                      onClick={() => selectLanguage(language)}
                    >
                      {language}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-gray-200 hover:text-gray-300 cursor-pointer transition">
              <button
                type="button"
                onClick={() => router.push("/auth")}
                className="rounded-full bg-red-600 text-xs md:text-sm text-white px-3 md:px-4 py-1 md:py-2 hover:bg-red-700 transition"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner - Using Tailwind CSS for background image with darkened background */}
      <div className="relative min-h-screen w-full flex items-center justify-center pt-24 pb-16 bg-[url('https://res.cloudinary.com/dixwarqdb/image/upload/v1744709989/CA-en-20250407-TRIFECTA-perspective_85d2b25e-6ff4-450f-8e06-a6ff025bbd87_large_yw3pog.jpg')] bg-no-repeat bg-center bg-cover bg-fixed">
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-white font-bold text-3xl md:text-5xl lg:text-6xl mb-4">
            Unlimited movies, TV shows, and more.
          </h1>
          <p className="text-white text-base md:text-lg lg:text-2xl mb-6">
            Ready to watch? Enter your email to create or restart your
            membership.
          </p>
          <div className="flex flex-col md:flex-row gap-2 justify-center">
            <div className="w-full md:w-2/3">
              <Input
                label="Email Address"
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                value={email}
                className="block rounded-full px-4 pt-6 pb-2 w-full text-md text-white bg-neutral-500 appearance-none focus:outline-none focus:ring-0 peer"
              />
            </div>
            <button
              onClick={() => router.push("/auth")}
              type="button"
              className="text-white bg-red-600 rounded-full flex flex-row items-center justify-center px-4 py-3 mt-2 md:mt-0 hover:bg-red-700 transition"
            >
              Get Started
              <BsChevronRight className="text-white ml-2" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Trending Now - Made more responsive */}
      <div className="w-full px-4 md:px-16 py-8 md:py-12 bg-black">
        <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
          Trending Now
        </h2>
        <div className="relative">
          <ul className="flex overflow-x-auto gap-3 md:gap-6 pb-12 md:pb-16 scrollbar-hide pl-6 md:pl-8">
            {trendingShows.map((show) => (
              <li key={show.ranking} className="flex-shrink-0 relative pt-10">
                {/* Ranking number positioned above the card */}
                <div className="absolute -left-4 md:-left-6 top-0 z-10">
                  <span className="relative flex items-center justify-center">
                    {/* Visible number */}
                    <span className="text-gray-600 font-bold text-4xl md:text-6xl drop-shadow-lg">
                      {show.ranking}
                    </span>

                    {/* Outlined number effect (visible on hover) */}
                    <span
                      aria-hidden="true"
                      data-content={show.ranking}
                      className="absolute inset-0 flex items-center justify-center text-4xl md:text-6xl font-bold text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        WebkitTextStroke: "2px #fff",
                        textShadow: "0 0 10px rgba(255,255,255,0.5)",
                      }}
                    >
                      {show.ranking}
                    </span>
                  </span>
                </div>

                <button className="relative group">
                  {/* Responsive card size */}
                  <div className="relative w-36 md:w-52 h-56 md:h-72 overflow-hidden rounded-md">
                    {/* Show image */}
                    <Image
                      src={show.image}
                      alt={show.name}
                      fill
                      sizes="(max-width: 768px) 144px, 208px"
                      className="block absolute cursor-pointer object-cover transition duration shadow-xl rounded-lg border-2 border-amber-50 group-hover:scale-110"
                    />

                    {/* Title overlay with better visibility */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                      <p className="text-white text-sm md:text-base font-bold uppercase">
                        {show.name}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* More reasons - Made responsive */}
      <div className="w-full px-4 md:px-16 py-8 md:py-12 bg-zinc-900">
        <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-center">
          More Reasons to Join
        </h2>
        <div className="flex flex-col gap-4 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-row items-center justify-between bg-zinc-800 rounded-lg p-4 md:p-6 hover:bg-zinc-700 transition"
            >
              <h3 className="text-white text-center text-base md:text-lg font-medium">
                {feature.title}
              </h3>
              <Image
                src={feature.icon}
                width={48}
                height={48}
                alt={feature.title}
                className="mb-4"
              />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ - Made responsive */}
      <div className="w-full px-4 md:px-16 py-12 md:py-16 bg-black">
        <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="w-full mx-auto">
          {faq.map((item) => (
            <div key={item.id} className="mb-2">
              <button
                className="flex justify-between items-center w-full bg-zinc-800 p-4 md:p-5 text-white text-left hover:bg-zinc-700 transition rounded-lg mb-2"
                onClick={() => toggleFaq(item.id)}
              >
                <span className="text-base md:text-lg font-medium">
                  {item.question}
                </span>
                <BsPlus
                  className={`text-white text-xl md:text-2xl transition duration-300 ${
                    openFaqId === item.id ? "rotate-45" : "rotate-0"
                  }`}
                />
              </button>
              {openFaqId === item.id && (
                <div className="bg-zinc-700 p-4 md:p-5 text-white rounded-lg">
                  <p className="text-sm md:text-base">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <p className="text-white text-base md:text-lg mb-4 md:mb-6">
            Ready to watch? Enter your email to create or restart your
            membership.
          </p>
          <div className="flex flex-col md:flex-row gap-2 justify-center max-w-xl mx-auto">
            <div className="w-full md:w-2/3">
              <Input
                label="Email"
                onChange={(e) => setEmail(e.target.value)}
                id="email-bottom"
                type="email"
                value={email}
                className="block rounded-full px-4 pt-6 pb-2 w-full text-md text-white bg-neutral-500 appearance-none focus:outline-none focus:ring-0 peer"
              />
            </div>
            <button
              onClick={() => router.push("/auth")}
              type="button"
              className="text-white bg-red-600 rounded-full flex flex-row items-center justify-center px-4 py-3 mt-2 md:mt-0 hover:bg-red-700 transition"
            >
              Get Started
              <BsChevronRight className="text-white ml-2" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
