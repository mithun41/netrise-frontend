"use client";

import { useSyncExternalStore } from "react";

/**
 * Custom hook to detect media query matches using useSyncExternalStore
 * @param {string} query 
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const subscribe = (callback) => {
    if (typeof window === "undefined") {
      return () => {};
    }
    const media = window.matchMedia(query);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
