"use client";

import { useRouter } from "next/router";
import SettingsNavBar from "@/components/SettingsNavBar";
import SideMenu from "@/components/SideMenu";
import { FaChevronRight } from "react-icons/fa";
import type { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { RiVisaFill } from "react-icons/ri";
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

const MembershipPage = () => {
  const router = useRouter();

  const { data: currentUser } = useCurrentUser();

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
          <h1 className="text-white font-bold text-4xl mb-2">Membership</h1>

          {/* Plan Details */}
          <div className="mb-8">
            <h2 className="text-white text-xl mb-4">Plan Details</h2>

            <div className="bg-zinc-800 rounded-md overflow-hidden">
              <div className="p-4 border-b border-zinc-700">
                <h3 className="text-white text-lg font-medium mb-2">
                  Standard with ads plan
                </h3>
                <p className="text-gray-400">
                  1080p video resolution. Limited ad breaks.
                </p>
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700"
                onClick={() => router.push("/account/change-plan")}
              >
                <p className="text-white">Change plan</p>
                <FaChevronRight className="text-white" size={16} />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-8">
            <h2 className="text-white text-xl mb-4">Payment Info</h2>

            <div className="bg-zinc-800 rounded-md overflow-hidden">
              <div className="p-4 border-b border-zinc-700">
                <h3 className="text-white text-lg font-medium mb-2">
                  Next payment
                </h3>
                <p className="text-gray-400 mb-2">{nextPaymentDate()}</p>
                <div className="flex items-center gap-2">
                  <RiVisaFill className="text-blue-700" size={30} />
                  <p className="text-gray-400">•••• •••• •••• 8989</p>
                </div>
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/payment-method")}
              >
                <p className="text-white">Manage payment method</p>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700 border-b border-zinc-700"
                onClick={() => router.push("/account/redeem")}
              >
                <p className="text-white">Redeem gift or promo code</p>
                <FaChevronRight className="text-white" size={16} />
              </div>

              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-700"
                onClick={() => router.push("/account/billing-history")}
              >
                <p className="text-white">View payment history</p>
                <FaChevronRight className="text-white" size={16} />
              </div>
            </div>
          </div>

          {/* Cancel Membership */}
          <div className="mb-8">
            <button
              className="w-full py-3 border border-gray-600 rounded-md text-red-500 font-medium"
              onClick={() => {
                if (
                  confirm("Are you sure you want to cancel your membership?")
                ) {
                  // Handle cancellation
                  router.push("/account/cancel-confirmation");
                }
              }}
            >
              Cancel Membership
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MembershipPage;
