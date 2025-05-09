import React, { useCallback, useEffect, useRef, useState } from "react";
import { BsBell, BsChevronDown, BsSearch } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";

import Image from "next/image";
import { useRouter } from "next/router";

import NavbarItem from "./NavbarItem";
import MobileMenu from "./MobileMenu";
import AccountMenu from "./AccountMenu";
import Input from "./Input";

import { navItem } from "@/constants/navItem";

import useProfile from "@/hooks/useProfile";

const TOP_OFFSET = 66;

const Navbar = () => {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showBackground, setShowBackground] = useState(false);

  // Always show search on search page
  const isSearchPage = router.pathname === "/search";

  const [showSearch, setShowSearch] = useState(isSearchPage);
  const [searchQuery, setSearchQuery] = useState(
    (router.query.q as string) || ""
  );
  const [showClearButton, setShowClearButton] = useState(!!searchQuery);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get the current profile with useProfile hooks
  const { currentProfile } = useProfile();

  // Update search query when URL query changes
  useEffect(() => {
    if (router.query.q) {
      setSearchQuery(router.query.q as string);
      setShowClearButton(true);
    }
  }, [router.query.q]);

  // Always show search on search page
  useEffect(() => {
    setShowSearch(isSearchPage || showSearch);
  }, [isSearchPage, showSearch]);

  // Handle scroll for background check
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

  // Handle clicks outside the search input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isSearchPage &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        showSearch
      ) {
        setShowSearch(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch, isSearchPage]);

  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu((current) => !current);
  }, []);

  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu((current) => !current);
  }, []);

  const toggleSearch = useCallback(() => {
    // Don't allow hiding search on search page
    if (!isSearchPage) {
      setShowSearch((current) => !current);
      if (showSearch) {
        setSearchQuery(""); // Clear search when closing
      }
    }
  }, [showSearch, isSearchPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowClearButton(!!query);

    // Naviaget to search page as user types
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/browse");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowClearButton(false);
    router.push("/browse");
  };

  return (
    <nav className="w-full fixed z-40">
      <div
        className={`px-4 md:px-16 py-6 flex flex-row items-center transition duration-500 ${
          showBackground ? `bg-zinc-900/90` : `bg-transparent`
        }`}
      >
        <Image
          className="h-4 lg:h-7 w-auto"
          src="https://res.cloudinary.com/dixwarqdb/image/upload/v1744696101/logo_uwzr3q.png"
          width={100}
          height={100}
          alt="Streaming Service Logo"
        />
        <div className="flex-row ml-8 gap-7 hidden lg:flex">
          {navItem.map((item) => (
            <NavbarItem key={item.id} label={item.name} link={item.link} />
          ))}
        </div>

        <div
          onClick={toggleMobileMenu}
          className="lg:hidden flex flex-row items-center gap-2 ml-8 cursor-pointer relative"
        >
          <p className="text-white text-sm">Browse</p>
          <BsChevronDown
            className={`text-white transition ${
              showMobileMenu ? `rotate-180` : `rotate-0`
            }`}
          />
          <MobileMenu visible={showMobileMenu} />
        </div>
        <div className="flex flex-row ml-auto gap-7 items-center">
          {showSearch ? (
            <div
              ref={searchRef}
              className="relative w-48 md:w-64 transition-all duration-300"
            >
              <Input
                id="search"
                onChange={handleSearchChange}
                value={searchQuery}
                label="Search movies..."
                type="text"
                className="block rounded-md px-6 pt-4 pb-2 w-full text-md text-white bg-neutral-700 appearance-none focus:outline-none focus:ring-0 peer"
              />
              {showClearButton && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400 focus:outline-none"
                  onClick={handleClearSearch}
                >
                  &#x2715;
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={toggleSearch}
              className="text-gray-200 hover:text-gray-300 cursor-pointer transition"
            >
              <BsSearch />
            </div>
          )}
          <div className="text-gray-200 hover:text-gray-300 cursor-pointer transition">
            <BsBell />
          </div>

          <div
            onClick={toggleAccountMenu}
            className="flex flex-row items-center gap-1 cursor-pointer relative"
          >
            <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-md overflow-hidden">
              <Image
                src={currentProfile?.avatar || ""}
                width={30}
                height={30}
                alt={`Avatar for ${currentProfile?.name}`}
                onError={(e) => {
                  // Fallback to default avatar if the image fails to load
                  (e.target as HTMLImageElement).src =
                    "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696100/default-blue_oqkthi.png";
                }}
              />
            </div>
            <IoMdArrowDropdown
              className={`text-white transition ${
                showAccountMenu ? `rotate-180` : `rotate-0`
              }`}
              size={25}
            />
            <AccountMenu visible={showAccountMenu} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
