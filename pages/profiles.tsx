import useCurrentUser from "@/hooks/useCurrentUser";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import axios from "axios";

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
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const handleProfileClick = (profileId: string) => {
    setSelectedProfile(profileId);
    localStorage.setItem("currentProfile", profileId);
    router.push("/browse");
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

  return (
    <div className="flex items-center h-full justify-center">
      <div className="flex flex-col">
        <h1 className="text-3xl md:text-6xl text-white text-center">
          Who is watching?
        </h1>
        <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
          {user?.profiles?.map(
            (profile: { id: string; name: string; avatar: string }) => (
              <div
                key={profile.id}
                onClick={() => handleProfileClick(profile.id)}
                className={`group ${
                  selectedProfile === profile.id ? "ring-2 ring-white" : ""
                }`}
              >
                <div className="flex-row w-44 mx-auto">
                  <div className="w-44 h-44 rounded-md flex items-center justify-center border-2 border-transparent group-hover:cursor-pointer group-hover:border-white overflow-hidden">
                    <Image
                      src={profile.avatar}
                      width={150}
                      height={150}
                      alt={profile.name}
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-4 text-gray-400 text-2xl text-center group-hover:text-white">
                    {profile.name}
                  </div>
                </div>
              </div>
            )
          )}

          {user?.profiles?.length < 4 && (
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
      </div>
    </div>
  );
};

export default Profiles;
