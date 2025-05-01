"use client";

import { useRouter } from "next/router";
import Image from "next/image";
import SettingsNavBar from "@/components/SettingsNavBar";
import SideMenu from "@/components/SideMenu";
import { FaChevronRight } from "react-icons/fa";
import {
  MdCreditCard,
  MdDevices,
  MdLock,
  MdOutlineWarning,
  MdPersonAdd,
  MdSettings,
} from "react-icons/md";
import useCurrentUser from "@/hooks/useCurrentUser";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { RiVisaFill } from "react-icons/ri";

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

const AccountPage = () => {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  const createdDate = () => {
    const date = new Date(currentUser?.createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const nextPaymentDate = () => {
    if (!currentUser?.updatedAt) return "No date available";

    const date = new Date(currentUser.updatedAt);
    date.setMonth(date.getMonth() + 6); // Add 6 months

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric", // Optional: include day if needed
    });
  };

  const numberOfProfiles = currentUser?.profiles?.length || 0;

  return (
    <>
      <SettingsNavBar />
      <div className="flex flex-row max-w-6xl mx-auto pb-20">
        {/* Side Menu */}
        <div className="w-1/4 pr-8">
          <SideMenu />
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          <h1 className="text-white font-bold text-4xl mb-2">Account</h1>

          {/* Membership Details */}
          <div className="mb-8">
            <h2 className="text-white text-xl mb-4">Membership Details</h2>

            <div className="bg-zinc-800 rounded-md overflow-hidden">
              <div className="p-4 border-b border-zinc-700">
                <div className="bg-blue-800 text-white text-sm px-3 py-1 rounded-full inline-block mb-3">
                  {createdDate()}
                </div>

                <h3 className="text-white text-lg font-medium mb-1">
                  Standard with ads plan
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-gray-400">
                    Next payment: {nextPaymentDate()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <RiVisaFill className="text-blue-700" size={30} />
                  <p className="text-gray-400">•••• •••• •••• 8989</p>
                </div>
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700"
                onClick={() => router.push("/account/membership")}
              >
                <p className="text-white">Manage membership</p>
                <FaChevronRight className="text-white" size={16} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-white text-xl mb-4">Quick Links</h2>

            <div className="bg-zinc-800 rounded-md overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/membership")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdCreditCard className="text-white" size={20} />
                  </div>
                  <p className="text-white">Change plan</p>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/membership")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdCreditCard className="text-white" size={20} />
                  </div>
                  <p className="text-white">Manage payment method</p>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/devices")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdDevices className="text-white" size={20} />
                  </div>
                  <p className="text-white">Manage access and devices</p>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/security")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdLock className="text-white" size={20} />
                  </div>
                  <p className="text-white">Update password</p>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/profiles")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdPersonAdd className="text-white" size={20} />
                  </div>
                  <p className="text-white">Transfer a profile</p>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/profiles")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdOutlineWarning className="text-white" size={20} />
                  </div>
                  <p className="text-white">Adjust parental controls</p>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700"
                onClick={() => router.push("/settings")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdSettings className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-white">Edit settings</p>
                    <p className="text-gray-400 text-sm">
                      Languages, subtitles, autoplay, notifications, privacy and
                      more
                    </p>
                  </div>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>
            </div>
          </div>

          {/* Manage Profiles */}
          <div className="mb-8">
            <div
              className="bg-zinc-800 rounded-md p-4 cursor-pointer hover:bg-zinc-700"
              onClick={() => router.push("/profiles")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Manage profiles</h3>
                  <p className="text-gray-400 text-sm">
                    {numberOfProfiles} profiles
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {currentUser?.profiles
                      ?.slice(0, numberOfProfiles)
                      .map(
                        (profile: {
                          id: string;
                          avatar: string;
                          name: string;
                        }) => (
                          <div
                            key={profile.id}
                            className="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-800"
                          >
                            <Image
                              src={profile.avatar || "/placeholder.svg"}
                              width={32}
                              height={32}
                              alt={profile.name}
                              className="object-cover"
                            />
                          </div>
                        )
                      )}
                  </div>
                  <FaChevronRight className="text-white ml-2" size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountPage;
