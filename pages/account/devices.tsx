"use client";

import { useRouter } from "next/router";
import SettingsNavBar from "@/components/SettingsNavBar";
import SideMenu from "@/components/SideMenu";
import { FaChevronRight } from "react-icons/fa";
import { MdDevices, MdDownload } from "react-icons/md";
import type { NextPageContext } from "next";
import { getSession } from "next-auth/react";

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

const DevicesPage = () => {
  const router = useRouter();

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
          <h1 className="text-white font-bold text-4xl mb-2">Devices</h1>

          {/* Account Access */}
          <div className="mb-8">
            <h2 className="text-white text-xl mb-4">Account Access</h2>

            <div className="bg-zinc-800 rounded-md overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700"
                onClick={() => router.push("/account/manage-devices")}
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
            </div>
          </div>

          {/* Mobile Downloads */}
          <div className="mb-8">
            <h2 className="text-white text-xl mb-4">Mobile Downloads</h2>

            <div className="bg-zinc-800 rounded-md overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700"
                onClick={() => router.push("/account/downloads")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-700 p-2 rounded-full">
                    <MdDownload className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-white">Mobile download devices</p>
                    <p className="text-gray-400 text-sm">
                      Using 0 of 2 download devices
                    </p>
                  </div>
                </div>
                <FaChevronRight className="text-white" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DevicesPage;
