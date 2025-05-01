import SettingsNavBar from "@/components/SettingsNavBar";
import SideMenu from "@/components/SideMenu";
import useCurrentUser from "@/hooks/useCurrentUser";
import useProfile from "@/hooks/useProfile";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { MdOutlineWarning, MdPersonAdd } from "react-icons/md";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

interface ProfileProps {
  id: string;
  name: string;
  avatar: string;
}

const AccountProfiles = () => {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { currentProfileId } = useProfile();

  const profiles = currentUser?.profiles || [];
  return (
    <>
      <SettingsNavBar />
      <div className="flex flex-row max-w-6xl mx-auto pb-20">
        {/* Side Menu */}
        <div className="w-1/4 h-screen pr-8">
          <SideMenu />
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          <h1 className="text-white font-bold text-4xl mb-2">Profiles</h1>

          {/* Parental Controls Section */}
          <div className="mb-8">
            <h2 className="text-white text-xl mb-4">
              Parental Controls and Permissions
            </h2>

            <div className="bg-zinc-800 rounded-md p-4 mb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => router.push("/account/parental-controls")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdOutlineWarning className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      Adjust parental controls
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Set maturity ratings, block titles
                    </p>
                  </div>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>
            </div>

            <div className="bg-zinc-800 rounded-md p-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => router.push("/account/transfer-profile")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdPersonAdd className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      Transfer a profile
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Copy a profile to another account
                    </p>
                  </div>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>
            </div>
          </div>

          {/* Profile Settings Section */}
          <div>
            <h2 className="text-white text-xl mb-4">Profile Settings</h2>
            <div className="bg-zinc-800 rounded-md overflow-hidden">
              {profiles.map((profile: ProfileProps) => (
                <div
                  key={profile.id}
                  onClick={() => router.push(`/settings/${profile.id}`)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      className="rounded-md"
                      src={profile.avatar || "/placeholder.svg"}
                      width={40}
                      height={40}
                      alt={profile.name}
                    />
                    <span className="text-white">{profile.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.id === currentProfileId && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Your Profile
                      </span>
                    )}
                    <FaChevronRight className="text-white" size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountProfiles;
