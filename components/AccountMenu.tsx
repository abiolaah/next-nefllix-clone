import React, { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/router";
import useProfile from "@/hooks/useProfile";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { DEFAULT_PROFILE_AVATAR } from "@/constants/data";

interface AccountMenuProp {
  visible?: boolean;
}

interface ProfileProps {
  id: string;
  name: string;
  avatar: string;
}

const AccountMenu: React.FC<AccountMenuProp> = ({ visible }) => {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const { currentProfileId, setCurrentProfileId, currentProfile } =
    useProfile();

  const remainingProfiles =
    currentUser?.profiles?.filter(
      (profile: ProfileProps) => profile.id !== currentProfileId
    ) || [];

  const handleProfileClick = async (profileId: string) => {
    try {
      setIsLoading(true);

      // First update the profile ID
      setCurrentProfileId(profileId);

      // Then navigate with the profile switch parameter
      // Use window.location for a full page reload to ensure clean state
      window.location.href = "/browse?profileSwitch=true";
    } catch (error) {
      console.error("Error handling profile click:", error);
      setIsLoading(false);
    }
  };

  if (!visible && !isLoading) return null;

  return (
    <div className="bg-black w-56 absolute top-14 right-0 py-5 flex-col border-2 border-gray-800 flex">
      <div className="flex flex-col gap-3">
        <div
          onClick={() => router.push("/browse")}
          className="px-3 group/item flex flex-row gap-3 items-center w-full cursor-pointer"
        >
          {currentProfile && (
            <>
              <Image
                className="w-8 rounded-md"
                src={currentProfile.avatar}
                width={30}
                height={30}
                alt={currentProfile.name}
              />
              <p className="text-white text-sm group-hover/item:underline">
                {currentProfile?.name}
              </p>
            </>
          )}
        </div>
        {/* Remaining Profile list */}
        <div className="">
          {remainingProfiles.map((profile: ProfileProps) => (
            <div
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
              className="px-3 group/item flex flex-row gap-4 items-center w-full cursor-pointer py-2 hover:bg-zinc-800"
            >
              <Image
                className="w-8 rounded-md"
                src={profile.avatar || DEFAULT_PROFILE_AVATAR}
                width={30}
                height={30}
                alt={profile.name}
              />
              <p className="text-white text-sm group-hover/item:underline">
                {profile?.name}
              </p>
            </div>
          ))}
        </div>
        <hr className="bg-gray-600 border-0 h-px my-4" />

        {/* Account and Manage Profiles */}
        <div className="flex flex-col gap-2">
          <div
            onClick={() => router.push("/account")}
            className="px-3 text-center text-white text-sm hover:underline flex flex-row gap-4 items-center cursor-pointer py-2 hover:bg-zinc-800"
          >
            <CgProfile className="text-white" size={30} />
            Accounts
          </div>
          <div
            onClick={() => router.push("/profiles")}
            className="px-3 text-center text-white text-sm hover:underline flex flex-row gap-4 items-center cursor-pointer py-2 hover:bg-zinc-800"
          >
            <FaEdit className="text-white" size={30} />
            Manage Profiles
          </div>
        </div>
        <hr className="bg-gray-600 border-0 h-px my-4" />
        <div
          onClick={() => signOut()}
          className="px-3 text-center text-white text-sm hover:underline flex flex-row gap-4 items-center"
        >
          <FaSignOutAlt className="text-white" size={30} />
          Sign out of Netflix
        </div>
      </div>
    </div>
  );
};

export default AccountMenu;
