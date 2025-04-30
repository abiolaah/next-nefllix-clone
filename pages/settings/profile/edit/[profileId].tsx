import React, { useEffect, useState } from "react";

import type { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

import useProfile from "@/hooks/useProfile";
import axios from "axios";
import useCurrentUser from "@/hooks/useCurrentUser";
import SettingsNavBar from "@/components/SettingsNavBar";
import { FaChevronDown, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoGameController } from "react-icons/io5";
import Image from "next/image";
import { DEFAULT_PROFILE_AVATAR } from "@/constants/data";

interface ProfileProps {
  id: string;
  name: string;
  avatar: string;
  hasPin: boolean;
  pin?: string;
}

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

const ProfileSettingsEdit = () => {
  const router = useRouter();
  const { profileId } = router.query;
  const { data: user, mutate } = useCurrentUser();
  const { currentProfile, setCurrentProfile } = useProfile();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailSet, setIsEmailSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    // Find the profile from the profiles list
    if (profileId) {
      if (currentProfile) {
        setCurrentProfile(currentProfile);
        setName(currentProfile.name || "");
        setGender("");
        setEmail("");
      }
    }
  }, [profileId, currentProfile, setCurrentProfile]);

  const handleDeleteProfile = async () => {
    try {
      setIsLoading(true);
      // Get all profiles
      const response = await axios.get("/api/profile");

      const profiles = response.data;

      // Find the profile to determine if it has a pin
      const profileToDelete: ProfileProps = profiles.find(
        (profile: { id: string }) => profile.id === profileId
      );

      // Check if profile exist
      if (!profileToDelete) {
        console.error("Profile not found");
        return;
      }

      // Check if profile has a pin
      if (profileToDelete.hasPin && profileToDelete.pin) {
        // Prompt user for pin
        const enteredPin = prompt("Please enter the profile PIN to delete:");

        if (!enteredPin) return; // User cancelled

        // Verify pin locally
        if (enteredPin != profileToDelete.pin) {
          alert("Incorrect PIN. Profile deletion cancelled.");
          return;
        }
      } else {
        // No pin required, use existing confirmation flow
        if (!confirm("Are you sure you want to delete this profile?")) return;
      }

      // Pin verified or not required, proceed with deletion
      await axios.delete(`/api/profile/${profileId}`);
      mutate(); // Refresh user data
    } catch (error) {
      console.error("Error deleting profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      // Find the profile to edit
      const profileToEdit: ProfileProps = user?.profiles.find(
        (profile: { id: string }) => profile.id === profileId
      );

      // Check if profile exist
      if (!profileToEdit) {
        console.error("Profile not found");
        return;
      }

      // Check if profile has a pin
      if (profileToEdit.hasPin && profileToEdit.pin) {
        // Prompt user for pin
        const enteredPin = prompt("Please enter the profile PIN to edit:");
        if (!enteredPin) return; // User cancelled
        // Verify pin locally
        if (enteredPin != profileToEdit.pin) {
          alert("Incorrect PIN. Profile edit cancelled.");
          return;
        }
      } else {
        // No pin required, proceed with editing
        if (!confirm("Are you sure you want to edit this profile?")) return;
      }

      // Pin verified or not required, proceed with editing
      await axios.put(`/api/profile/${profileId}`, {
        name,
      });
      router.push(`/settings/profile/${profileId}`);
      mutate(); // Refresh user data
    } catch (error) {
      console.error("Error editing profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/settings/${profileId}`);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleEmailSet = () => {
    setIsEmailSet(!isEmailSet);
  };

  // Toggle animation effects
  const togglePinSet = () => {
    setIsPinSet(!isPinSet);
  };

  const handlePinSetUp = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value);
  };

  return (
    <>
      <SettingsNavBar />
      <div className="max-w-4xl mx-auto px-3 pb-20">
        <h1 className="text-white font-bold text-4xl mt-8 mb-6">
          Edit Profile
        </h1>

        {/* Contents */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Avatar */}
          <div className="relative">
            <div className="w-36 h-36 rounded-md overflow-hidden bg-pink-600 relative">
              {currentProfile?.avatar && (
                <Image
                  src={currentProfile.avatar || DEFAULT_PROFILE_AVATAR}
                  alt={currentProfile?.name || "Profile"}
                  layout="fill"
                  objectFit="cover"
                />
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1">
            {/* Name Field */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-400 mb-1 text-sm"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-transparent text-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Gender Field */}
            <div className="mb-6">
              <label
                htmlFor="gender"
                className="block text-gray-400 mb-1 text-sm"
              >
                Gender
              </label>
              <div className="relative">
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 bg-transparent text-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 appearance-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FaChevronDown className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Game Handle Section */}
            <div className="mb-6">
              <h2 className="text-white text-xl mb-2">Game Handle</h2>
              <p className="text-gray-400 text-sm mb-3">
                Your handle is a unique name that&apos;ll be used for playing
                with other Netflix members across all Netflix Games.{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Learn more
                </a>
              </p>
              <button className="w-full p-3 bg-transparent text-white rounded border border-gray-300 flex items-center gap-2 hover:bg-gray-100 hover:text-black transition">
                <IoGameController size={20} />
                <span>Create Game Handle</span>
              </button>
            </div>

            {/* Contact Info Section */}
            <div className="mb-6">
              <h2 className="text-white text-xl mb-4">Contact Info</h2>
              <div
                onClick={() => handleEmailSet()}
                className="bg-transparent p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 hover:text-black transition rounded border border-gray-300"
              >
                <div className="flex items-center gap-3">
                  <MdEmail size={24} className="text-gray-600" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-500 text-sm">Add profile email</p>
                  </div>
                </div>
                <FaChevronDown className="text-gray-500" />
              </div>
              {isEmailSet && (
                <div className="mt-4">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email"
                    className="w-full p-3 bg-white text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}
            </div>

            {/* Profile PIN Section */}
            <div className="mb-6">
              <h2 className="text-white text-xl mb-4">Profile PIN</h2>
              <p className="text-gray-400 text-sm mb-3">
                Set a 4-digit PIN to protect your profile.{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Learn more
                </a>
              </p>
              <div className="w-full bg-transparent p-3 flex flex-row gap-8 items-center justify-between border border-gray-400 transition cursor-pointer">
                <button className="w-3/4 p-3 text-white rounded flex items-center gap-2 cursor-pointer">
                  <FaLock size={20} />
                  <span>Set Profile PIN</span>
                </button>

                {/*  */}
                <button
                  onClick={togglePinSet}
                  className={`w-12 h-6 rounded-full relative cursor-pointer ${
                    isPinSet ? "bg-gray-600" : "bg-gray-400"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      isPinSet ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
              {isPinSet && (
                <div className="mt-4">
                  <input
                    type="password"
                    value={pin}
                    onChange={handlePinSetUp}
                    placeholder="Enter your 4-digit PIN"
                    className="w-full p-3 bg-white text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3 cursor-pointer">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full py-3 bg-white/50 text-white font-medium rounded hover:bg-gray-900 transition cursor-pointer"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full py-3 bg-transparent text-white font-medium rounded hover:bg-gray-100 hover:text-black transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-300" />

        {/* Delete Profile Button */}
        <button
          onClick={handleDeleteProfile}
          disabled={isLoading}
          className="w-full py-3 border border-gray-300 text-red-600 font-medium rounded hover:bg-gray-100 transition cursor-pointer"
        >
          Delete Profile
        </button>
      </div>
    </>
  );
};

export default ProfileSettingsEdit;
