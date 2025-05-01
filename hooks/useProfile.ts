// hooks/useProfile.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useEffect } from "react";

interface Profile {
  id: string;
  name: string;
  avatar: string;
}

interface ProfileStore {
  currentProfileId: string | null;
  currentProfile: Profile | null;
  setCurrentProfileId: (id: string | null) => void;
  setCurrentProfile: (profile: Profile | null) => void;
  reset: () => void;
}

const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      currentProfileId: null,
      currentProfile: null,
      setCurrentProfileId: (id) => set({ currentProfileId: id }),
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      reset: () => set({ currentProfileId: null, currentProfile: null }),
    }),
    {
      name: "netflix-profile-storage",
    }
  )
);

// Combined hook that uses both the store and user data
const useProfile = () => {
  const { data: currentUser } = useCurrentUser();
  const {
    currentProfileId,
    currentProfile,
    setCurrentProfileId,
    setCurrentProfile,
  } = useProfileStore();

  useEffect(() => {
    if (currentUser?.profiles && currentProfileId) {
      const profile =
        currentUser.profiles.find((p: Profile) => p.id === currentProfileId) ||
        currentUser.profiles[0];

      if (profile) {
        setCurrentProfile(profile);
      }
    }
  }, [currentUser?.profiles, currentProfileId, setCurrentProfile]);

  return {
    currentProfileId,
    currentProfile,
    setCurrentProfileId,
    setCurrentProfile,
  };
};

export default useProfile;
