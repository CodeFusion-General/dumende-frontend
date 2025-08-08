import { useCallback, useEffect, useState } from "react";
import { useViewport } from "./useResponsiveAnimations";

interface MobileNavigationState {
  isMenuOpen: boolean;
  isFilterOpen: boolean;
  isSearchOpen: boolean;
  activeBottomSheet: string | null;
}

interface BottomSheetOptions {
  id: string;
  title: string;
  height?: "auto" | "half" | "full";
  backdrop?: boolean;
  swipeToClose?: boolean;
}

export const useMobileNavigation = () => {
  const { isMobile } = useViewport();
  const [navigationState, setNavigationState] = useState<MobileNavigationState>(
    {
      isMenuOpen: false,
      isFilterOpen: false,
      isSearchOpen: false,
      activeBottomSheet: null,
    }
  );

  // Close all mobile overlays
  const closeAllOverlays = useCallback(() => {
    setNavigationState({
      isMenuOpen: false,
      isFilterOpen: false,
      isSearchOpen: false,
      activeBottomSheet: null,
    });
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setNavigationState((prev) => ({
      ...prev,
      isMenuOpen: !prev.isMenuOpen,
      isFilterOpen: false,
      isSearchOpen: false,
      activeBottomSheet: null,
    }));
  }, []);

  // Toggle filter sidebar
  const toggleFilterSidebar = useCallback(() => {
    setNavigationState((prev) => ({
      ...prev,
      isFilterOpen: !prev.isFilterOpen,
      isMenuOpen: false,
      isSearchOpen: false,
      activeBottomSheet: null,
    }));
  }, []);

  // Toggle search overlay
  const toggleSearchOverlay = useCallback(() => {
    setNavigationState((prev) => ({
      ...prev,
      isSearchOpen: !prev.isSearchOpen,
      isMenuOpen: false,
      isFilterOpen: false,
      activeBottomSheet: null,
    }));
  }, []);

  // Open bottom sheet
  const openBottomSheet = useCallback((id: string) => {
    setNavigationState((prev) => ({
      ...prev,
      activeBottomSheet: id,
      isMenuOpen: false,
      isFilterOpen: false,
      isSearchOpen: false,
    }));
  }, []);

  // Close bottom sheet
  const closeBottomSheet = useCallback(() => {
    setNavigationState((prev) => ({
      ...prev,
      activeBottomSheet: null,
    }));
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAllOverlays();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeAllOverlays]);

  // Handle body scroll lock
  useEffect(() => {
    const hasActiveOverlay =
      navigationState.isMenuOpen ||
      navigationState.isFilterOpen ||
      navigationState.isSearchOpen ||
      navigationState.activeBottomSheet !== null;

    if (hasActiveOverlay && isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [navigationState, isMobile]);

  return {
    navigationState,
    isMobile,
    toggleMobileMenu,
    toggleFilterSidebar,
    toggleSearchOverlay,
    openBottomSheet,
    closeBottomSheet,
    closeAllOverlays,
  };
};

// Bottom sheet component hook
export const useBottomSheet = (options: BottomSheetOptions) => {
  const { navigationState, openBottomSheet, closeBottomSheet } =
    useMobileNavigation();
  const isOpen = navigationState.activeBottomSheet === options.id;

  const open = useCallback(() => {
    openBottomSheet(options.id);
  }, [openBottomSheet, options.id]);

  const close = useCallback(() => {
    closeBottomSheet();
  }, [closeBottomSheet]);

  const getBottomSheetProps = useCallback(() => {
    const heightClass =
      options.height === "full"
        ? "h-full"
        : options.height === "half"
        ? "h-1/2"
        : "h-auto max-h-[80vh]";

    return {
      className: `fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-white/20 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ${heightClass} ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`,
      "aria-hidden": !isOpen,
      role: "dialog",
      "aria-labelledby": `${options.id}-title`,
    };
  }, [isOpen, options.height, options.id]);

  const getBackdropProps = useCallback(() => {
    if (!options.backdrop) return null;

    return {
      className: `fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`,
      onClick: close,
    };
  }, [isOpen, close, options.backdrop]);

  return {
    isOpen,
    open,
    close,
    getBottomSheetProps,
    getBackdropProps,
  };
};
