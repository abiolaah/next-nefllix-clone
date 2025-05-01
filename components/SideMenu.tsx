import { sideMenuItems } from "@/constants/data";
import { useRouter } from "next/router";
import { MdArrowBack } from "react-icons/md";

const SideMenu = () => {
  const router = useRouter();

  // Determine if we're on the profiles page
  const isProfilesPage = router.pathname.includes("/account/profiles");

  // Handle navigation
  const handleNavigation = (link: string) => {
    router.push(link);
  };

  // Handle back to Netflix
  const handleBackToNetflix = () => {
    router.push("/browse");
  };
  return (
    <div className="flex flex-col space-y-8">
      {/* Back to Netflix button */}
      <button
        type="button"
        onClick={handleBackToNetflix}
        className="flex items-center gap-2 text-white hover:underline"
      >
        <MdArrowBack size={20} />
        <span className="text-sm font-medium">Back to Netflix</span>
      </button>

      {/* Navigation menu */}
      <nav className="flex flex-col space-y-3">
        {sideMenuItems.map((item) => {
          const isActive =
            (item.name === "Profiles" && isProfilesPage) ||
            router.pathname === item.link;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.link)}
              className={`flex items-center gap-3 py-2 px-3 rounded-md transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-gray-300 hover:bg-zinc-800/50"
              }`}
            >
              <item.icon
                size={20}
                className={isActive ? "text-white" : "text-gray-400"}
              />
              <span className="text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SideMenu;
