import React from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/router";

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
  if (!visible) return null;

  // Get the current profile from localStorage or use the first profile
  const currentProfileId =
    typeof window !== "undefined"
      ? localStorage.getItem("currentProfile")
      : null;
  const currentProfile =
    currentUser?.profiles?.find(
      (profile: ProfileProps) => profile.id === currentProfileId
    ) || currentUser?.profiles?.[0];

  const remainingProfiles =
    currentUser?.profiles?.filter(
      (profile: ProfileProps) => profile.id !== currentProfileId
    ) || [];
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
              onClick={() => {
                localStorage.setItem("currentProfile", profile.id);
                router.push("/profiles");
              }}
              className="px-3 group/item flex flex-row gap-3 items-center w-full"
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
        <div
          onClick={() => router.push("/profiles")}
          className="px-3 text-center text-white text-sm hover:underline"
        >
          Manage Profiles
        </div>
        <hr className="bg-gray-600 border-0 h-px my-4" />
        <div
          onClick={() => signOut()}
          className="px-3 text-center text-white text-sm hover:underline"
        >
          Sign out of Netflix
        </div>
      </div>
    </div>
  );
};

export default AccountMenu;
