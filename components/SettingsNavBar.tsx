import React, { useCallback, useState } from "react";
import Image from "next/image";
import { IoMdArrowDropdown } from "react-icons/io";
import useProfile from "@/hooks/useProfile";
import { MdArrowBack, MdOutlineEdit } from "react-icons/md";
import { useRouter } from "next/router";
import { FaChevronRight } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { CgProfile } from "react-icons/cg";

const ProfileMenu = ({ visible }: { visible: boolean }) => {
  const router = useRouter();
  if (!visible) return null;
  return (
    <div className="bg-black w-56 absolute top-14 right-0 py-5 flex-col border-2 border-gray-800 flex">
      <div className="flex flex-col gap-3">
        <div
          onClick={() => router.push("/browse")}
          className="px-3 group/item flex flex-row gap-3 items-center w-full"
        >
          <MdArrowBack className="text-white" size={30} />
          <span className="text-white text-xl">Back to Netflix</span>
        </div>
        <hr className="bg-gray-600 border-0 h-px my-4" />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <div
              onClick={() => router.push("/account")}
              className="px-3 text-center text-white text-sm hover:underline flex flex-row gap-4 items-center"
            >
              <CgProfile className="text-white" size={25} />
              Account
            </div>
            <div
              onClick={() => router.push("/account/profile")}
              className="px-3 text-center text-white text-sm hover:underline flex flex-row gap-4 items-center"
            >
              <MdOutlineEdit className="text-white" size={25} />
              Manage Profiles
            </div>
          </div>
          <hr className="bg-gray-600 border-0 h-px my-4" />

          <div className="flex flex-col gap-3">
            <div
              onClick={() => router.push("/profiles")}
              className="px-3 text-center text-white text-sm hover:underline flex flex-row gap-4 items-center"
            >
              Switch Profile
              <FaChevronRight className="text-white" size={25} />
            </div>
            <div
              onClick={() => signOut()}
              className="px-3 text-center text-white text-sm hover:underline flex flex-row gap-4 items-center"
            >
              Sign out of Netflix
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsNavBar = () => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const { currentProfile } = useProfile();
  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu((current) => !current);
  }, []);
  return (
    <div className="">
      <nav className="flex items-center justify-between py-4 px-3">
        <Image
          className="h-4 lg:h-7 w-auto"
          src="https://res.cloudinary.com/dixwarqdb/image/upload/v1744696101/logo_uwzr3q.png"
          width={200}
          height={200}
          alt="Streaming Service Logo"
        />
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
          <ProfileMenu visible={showAccountMenu} />
        </div>
      </nav>

      <hr className="text-white mb-4 mt-2" />
    </div>
  );
};

export default SettingsNavBar;
