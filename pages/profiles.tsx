import useCurrentUser from "@/hooks/useCurrentUser";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import axios from "axios";
import useProfile from "@/hooks/useProfile";
import { MdOutlineEdit } from "react-icons/md";

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

const profileImages = [
  "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696101/default-slate_maedg3.png",
  "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696101/default-red_nnlh94.png",
  "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696100/default-green_elro2z.png",
];

const Profiles = () => {
  const router = useRouter();
  const { data: user, mutate } = useCurrentUser();
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const { setCurrentProfileId, currentProfileId } = useProfile();
  const [isManagingProfiles, setIsManagingProfiles] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileClick = async (profileId: string) => {
    if (isManagingProfiles) return; // Don't navigate when in manage mode
    setIsLoading(true);
    setCurrentProfileId(profileId);

    // Use router.replace instead of push to ensure a full page reload
    // This will trigger the loading state in index.tsx

    await router.replace({
      pathname: "/browse",
      query: { profileSwitch: true },
    });
  };

  const handleAddProfile = async () => {
    try {
      if (!user) return;

      // Determine if this is the first profile
      const isFirstProfile = !user.profiles || user.profiles.length === 0;

      // Set name and avatar based on whether it's the first profile
      const name = isFirstProfile ? user.name : newProfileName.trim();
      const avatar = isFirstProfile
        ? "https://res.cloudinary.com/dixwarqdb/image/upload/v1744696100/default-blue_oqkthi.png"
        : profileImages[
            (user.profiles?.length || 1) - (1 % profileImages.length)
          ];

      if (!name) return;

      await axios.post("/api/profile", {
        userId: user.id,
        name,
        avatar,
      });

      mutate();
      setIsAddingProfile(false);
      setNewProfileName("");
    } catch (error) {
      console.error("Error adding profile:", error);
    }
  };

  const handleAddProfileClick = () => {
    // If no profiles exist, auto-fill with user's name
    if (!user?.profiles?.length) {
      setNewProfileName(user?.name || "");
    }
    setIsAddingProfile(true);
  };

  const handleEditProfile = (profileId: string) => {
    // Navigate to the edit profile page
    router.push(`/settings/${profileId}`);
  };

  return (
    <div className="flex items-center h-full justify-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl md:text-6xl text-white text-center">
          {isManagingProfiles ? "Manage Profiles:" : "Who is watching?"}
        </h1>
        <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
          {user?.profiles?.map(
            (profile: { id: string; name: string; avatar: string }) => (
              <div
                key={profile.id}
                onClick={() =>
                  !isManagingProfiles && handleProfileClick(profile.id)
                }
                className="group relative"
              >
                <div className="w-[140px] mx-auto">
                  <div
                    className={`w-[140px] h-[140px] rounded-md flex items-center justify-center 
                    border-2 overflow-hidden relative
                    ${
                      isManagingProfiles
                        ? "border-transparent"
                        : currentProfileId === profile.id
                        ? "border-white"
                        : "border-transparent group-hover:border-white"
                    }`}
                  >
                    <Image
                      src={profile.avatar}
                      width={140}
                      height={140}
                      alt={profile.name}
                      className={`object-cover w-full h-full ${
                        isManagingProfiles ? "opacity-50" : ""
                      }`}
                    />
                    {/* Edit icon overlay when managing profiles */}
                    {isManagingProfiles && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProfile(profile.id);
                          }}
                          className="bg-transparent rounded-full p-2"
                        >
                          <MdOutlineEdit size={40} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-gray-400 text-2xl text-center group-hover:text-white">
                    {profile.name}
                  </div>
                </div>
              </div>
            )
          )}

          {isManagingProfiles && user?.profiles?.length < 4 && (
            <div className="">
              {isAddingProfile ? (
                <div className="group flex-row w-44 mx-auto">
                  <div className="w-44 h-44 rounded-md flex items-center justify-center border-2 border-transparent overflow-hidden bg-gray-800">
                    <div className="flex flex-col items-center p-4">
                      <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="Profile name"
                        className="bg-gray-700 text-white p-2 rounded w-full mb-2"
                        maxLength={20}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddProfile()
                        }
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddProfile}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                          disabled={
                            !newProfileName.trim() && !!user?.profiles?.length
                          }
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsAddingProfile(false)}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleAddProfileClick}
                  className="group flex-row w-44 mx-auto"
                >
                  <div className="w-44 h-44 rounded-md flex items-center justify-center border-2 border-dashed border-gray-500 group-hover:cursor-pointer group-hover:border-white overflow-hidden">
                    <div className="text-gray-400 text-6xl group-hover:text-white">
                      +
                    </div>
                  </div>
                  <div className="mt-4 text-gray-400 text-2xl text-center group-hover:text-white">
                    Add Profile
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsManagingProfiles(!isManagingProfiles)}
          className={`bg-transparent text-white px-3 py-1 text-sm border-gray-400 border-2 flex items-center justify-center transition w-44 mt-4 mx-auto tracking-wider font-light ${
            isManagingProfiles ? "hover:bg-red-500" : ""
          }`}
        >
          {isManagingProfiles ? "Done" : "Manage Profiles"}
        </button>
      </div>
    </div>
  );
};

export default Profiles;
