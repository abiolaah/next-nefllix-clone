"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
import SettingsNavBar from "@/components/SettingsNavBar";
import {
  FaChevronRight,
  FaLock,
  FaLanguage,
  FaShieldAlt,
} from "react-icons/fa";
import {
  MdArrowBack,
  MdSubtitles,
  MdPlayCircleOutline,
  MdNotifications,
} from "react-icons/md";
import {
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoTvOutline,
  IoPersonAddOutline,
  IoTrashOutline,
} from "react-icons/io5";
import useProfile from "@/hooks/useProfile";
import axios from "axios";
import { getSession } from "next-auth/react";
import { NextPageContext } from "next";
import useCurrentUser from "@/hooks/useCurrentUser";

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

const ProfileSettings = () => {
  const router = useRouter();
  const { profileId } = router.query;
  const { data: user, mutate } = useCurrentUser();
  const { currentProfile } = useProfile();
  const [animationEffects, setAnimationEffects] = useState(false);

  // Navigate back
  const handleBack = () => {
    router.push("/account/profiles");
  };

  // Toggle animation effects
  const toggleAnimationEffects = () => {
    setAnimationEffects(!animationEffects);
  };

  const handleDeleteProfile = async (profileId: string) => {
    // Find the profile to determine if it has a pin
    const profileToDelete = user?.profiles?.find(
      (profile: { id: string }) => profile.id === profileId
    );

    if (!profileToDelete) return;

    // Check if profile has a pin
    if (profileToDelete.hasPin) {
      // Prompt user for pin
      const enteredPin = prompt("Enter the PIN to delete this profile:");

      if (!enteredPin) return;

      try {
        // Verify the pin
        const response = await axios.post("/api/pin-verify", {
          profileId,
          pin: enteredPin,
        });

        if (!response.data.success) {
          alert("Incorrect PIN. Profile deletion cancelled.");
          return;
        }

        // Pin verified, proceed with deletion
        await axios.delete(`/api/profile?profileId=${profileId}`);
        mutate();
      } catch (error) {
        console.error("Error deleting profile:", error);
      }
    } else {
      if (!confirm("Are you sure you want to delete this profile?")) return;

      try {
        await axios.delete(`/api/profile?profileId=${profileId}`);
        mutate();
      } catch (error) {
        console.error("Error deleting profile:", error);
      }
    }
  };

  if (currentProfile?.id !== profileId) {
    return null; // Prevent rendering if the profileId doesn't match the current profile
  }

  return (
    <div className="min-h-screen bg-black">
      <SettingsNavBar />

      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-white my-6"
        >
          <MdArrowBack size={24} />
        </button>

        {/* Main heading */}
        <h1 className="text-white text-3xl font-medium mb-6">
          Manage profile and preferences
        </h1>

        {/* Profile section */}
        <div className="bg-zinc-800 rounded-md mb-6 overflow-hidden">
          {/* Profile info */}
          <div className="p-4 flex items-center border-b border-zinc-700">
            <div className="flex items-center gap-4 flex-1">
              <Image
                src={currentProfile?.avatar || "/placeholder.svg"}
                width={48}
                height={48}
                alt="Profile"
                className="rounded-md"
              />
              <div>
                <h2 className="text-white text-lg font-medium">
                  {currentProfile?.name}
                </h2>
                <p className="text-gray-400 text-sm">
                  Edit personal and contact info
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>

          {/* Profile lock */}
          <div className="p-4 flex items-center">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <FaLock className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">Profile Lock</h3>
                <p className="text-gray-400 text-sm">
                  Require a PIN to access this profile
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>
        </div>

        {/* Preferences section */}
        <h2 className="text-white text-xl mb-4">Preferences</h2>

        <div className="bg-zinc-800 rounded-md mb-6 overflow-hidden">
          {/* Languages */}
          <div className="p-4 flex items-center border-b border-zinc-700">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <FaLanguage className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">Languages</h3>
                <p className="text-gray-400 text-sm">
                  Set languages for display and audio
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>

          {/* Parental Controls */}
          <div className="p-4 flex items-center border-b border-zinc-700">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <FaShieldAlt className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">
                  Adjust Parental Controls
                </h3>
                <p className="text-gray-400 text-sm">
                  Edit maturity rating and title restrictions
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>

          {/* Subtitle appearance */}
          <div className="p-4 flex items-center border-b border-zinc-700">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <MdSubtitles className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">Subtitle appearance</h3>
                <p className="text-gray-400 text-sm">
                  Customize the way subtitles appear
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>

          {/* Playback settings */}
          <div className="p-4 flex items-center border-b border-zinc-700">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <MdPlayCircleOutline className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">Playback settings</h3>
                <p className="text-gray-400 text-sm">
                  Set autoplay and audio, video quality
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>

          {/* Notification settings */}
          <div className="p-4 flex items-center border-b border-zinc-700">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <MdNotifications className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">
                  Notification settings
                </h3>
                <p className="text-gray-400 text-sm">
                  Manage notifications for email, text, push
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>

          {/* Viewing activity */}
          <div className="p-4 flex items-center border-b border-zinc-700">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <IoTimeOutline className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">Viewing activity</h3>
                <p className="text-gray-400 text-sm">
                  Manage viewing history and ratings
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>

          {/* Privacy and data settings */}
          <div className="p-4 flex items-center border-b border-zinc-700">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <IoShieldCheckmarkOutline className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">
                  Privacy and data settings
                </h3>
                <p className="text-gray-400 text-sm">
                  Manage usage of personal info
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>
        </div>

        {/* TV animation effects */}
        <div className="bg-zinc-800 rounded-md mb-6 overflow-hidden">
          <div className="p-4 flex items-center">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <IoTvOutline className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">TV animation effects</h3>
                <p className="text-gray-400 text-sm">
                  Reduce motion transitions
                </p>
              </div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={toggleAnimationEffects}
              className={`w-12 h-6 rounded-full relative ${
                animationEffects ? "bg-gray-400" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  animationEffects ? "left-1" : "left-7"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Profile transfer */}
        <div className="bg-zinc-800 rounded-md mb-6 overflow-hidden">
          <div className="p-4 flex items-center">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-zinc-700 p-2 rounded-full">
                <IoPersonAddOutline className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium">Profile transfer</h3>
                <p className="text-gray-400 text-sm">
                  Copy this profile to another account
                </p>
              </div>
            </div>
            <FaChevronRight className="text-white" size={16} />
          </div>
        </div>

        {/* Delete Profile */}
        <button
          className="w-full py-3 border border-gray-600 rounded-md text-red-500 font-medium flex items-center justify-center gap-2"
          onClick={() => handleDeleteProfile(profileId as string)}
        >
          <IoTrashOutline size={20} />
          Delete Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
