import { create } from "zustand";

export interface ModalStoreInterface {
  movieId?: string;
  contentType: "movie" | "tv";
  isOpen: boolean;
  openModal: (movieId: string, contentType: "movie" | "tv") => void;
  closeModal: () => void;
}

const useInfoModal = create<ModalStoreInterface>((set) => ({
  movieId: undefined,
  contentType: "movie",
  isOpen: false,
  openModal: (movieId: string, contentType: "movie" | "tv") => {
    // Force the contentType to be exactly "movie" or "tv"
    const validContentType = contentType === "tv" ? "tv" : "movie";
    return set({
      isOpen: true,
      movieId,
      contentType: validContentType,
    });
  },
  closeModal: () =>
    set({
      isOpen: false,
      movieId: undefined,
      // Don't reset contentType here to maintain it for future uses
    }),
}));

export default useInfoModal;
