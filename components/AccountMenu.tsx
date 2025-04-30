import React, { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/router";
import useProfile from "@/hooks/useProfile";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

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

  console.log(remainingProfiles);

  const handleProfileClick = (profileId: string) => {
    setIsLoading(true);
    setCurrentProfileId(profileId);
    router.push("/browse");
    setIsLoading(false);
  };

  if (!visible) return null;

  if (isLoading) {
    return (
      <div className="bg-black w-56 absolute top-14 right-0 py-5 flex-col border-2 border-gray-800 flex">
        <div className="flex flex-col gap-3">
          <Image
            src={currentProfile?.avatar || ""}
            className="w-8 rounded-md"
            width={30}
            height={30}
            alt={currentProfile?.name || ""}
          />
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-black w-56 absolute top-14 right-0 py-5 flex-col border-2 border-gray-800 flex">
      <div className="flex flex-col gap-3">
        <div
          onClick={() => router.push("/profiles")}
          className="px-3 group/item flex flex-row gap-3 items-center w-full"
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
        <div className="">
          {remainingProfiles.map((profile: ProfileProps) => (
            <div
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
              className="px-3 group/item flex flex-row gap-4 items-center w-full"
            >
              <Image
                className="w-8 rounded-md"
                src={profile.avatar}
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
        <div className="flex flex-col gap-2">
          <div
            onClick={() => router.push("/account")}
            className="px-3 text-center text-white text-sm hover:underline flex flex-row gap-4 items-center"
          >
            <CgProfile className="text-white" size={30} />
            Accounts
          </div>
          <div
            onClick={() => router.push("/profiles")}
            className="px-3 text-center text-white text-sm hover:underline flex flex-row gap-4 items-center"
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
