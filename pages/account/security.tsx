"use client";

import { useRouter } from "next/router";
import SettingsNavBar from "@/components/SettingsNavBar";
import SideMenu from "@/components/SideMenu";
import { FaChevronRight } from "react-icons/fa";
import {
  MdLock,
  MdEmail,
  MdDevices,
  MdPersonAdd,
  MdInfo,
  MdScience,
} from "react-icons/md";
import type { NextPageContext } from "next";
import { getSession } from "next-auth/react";
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

const SecurityPage = () => {
  const router = useRouter();

  const { data: currentUser } = useCurrentUser();

  const isUserVerified = currentUser.emailVerified !== null;
  console.log(isUserVerified);

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
          {/* Verification Alert */}
          {!isUserVerified && (
            <div className="bg-amber-100 p-4 rounded-md mb-6">
              <div className="flex items-start gap-3">
                <div className="text-amber-800 mt-1">
                  <MdInfo size={24} />
                </div>
                <div>
                  <h3 className="text-amber-900 font-medium">
                    Verify your email address
                  </h3>
                  <p className="text-amber-800">
                    Verifying your email enhances security and can help you
                    access and recover your account.
                    <a href="#" className="font-medium ml-1">
                      Verify now
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          <h1 className="text-white font-bold text-4xl mb-2">Security</h1>

          {/* Account Details */}
          <div className="mb-8">
            <h2 className="text-white text-xl mb-4">Account Details</h2>

            <div className="bg-zinc-800 rounded-md overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/password")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdLock className="text-white" size={20} />
                  </div>
                  <p className="text-white">Password</p>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/email")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdEmail className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-white">Email</p>
                    <p className="text-gray-400 text-sm">{currentUser.email}</p>
                    {!isUserVerified && (
                      <p className="text-red-500 text-sm">Needs verification</p>
                    )}
                  </div>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>
            </div>
          </div>

          {/* Access and Privacy */}
          <div className="mb-8">
            <h2 className="text-white text-xl mb-4">Access and Privacy</h2>

            <div className="bg-zinc-800 rounded-md overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/devices")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdDevices className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-white">Access and devices</p>
                    <p className="text-gray-400 text-sm">
                      Manage signed-in devices
                    </p>
                  </div>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/profile-transfer")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdPersonAdd className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white">Profile Transfer</p>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                        New
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">On</p>
                  </div>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/personal-info")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdInfo className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-white">Personal info access</p>
                    <p className="text-gray-400 text-sm">
                      Request a copy of your personal info
                    </p>
                  </div>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700"
                onClick={() => router.push("/account/feature-testing")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdScience className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-white">Feature testing</p>
                    <p className="text-gray-400 text-sm">On</p>
                  </div>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="mb-8">
            <button
              className="w-full py-3 border border-gray-600 rounded-md text-red-500 font-medium"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete your account? This action cannot be undone."
                  )
                ) {
                  // Handle account deletion
                  router.push("/auth");
                }
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityPage;
