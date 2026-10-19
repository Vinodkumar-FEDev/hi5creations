"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * TabTitleManager
 * When the visitor switches browser tabs (document becomes hidden),
 * updates the browser tab title to "We miss you 🥺".
 * When the visitor switches back to the tab, immediately restores
 * the exact page title.
 */
export default function TabTitleManager() {
  const pathname = usePathname();
  const originalTitleRef = useRef<string>("");
  const awayTitle = "We miss you 🥺";

  // Keep original title up to date on route changes while the page is visible
  useEffect(() => {
    if (typeof document !== "undefined" && !document.hidden && document.title !== awayTitle) {
      originalTitleRef.current = document.title;
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Capture initial title once mounted
    if (document.title && document.title !== awayTitle) {
      originalTitleRef.current = document.title;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden (user switched tabs)
        if (document.title && document.title !== awayTitle) {
          originalTitleRef.current = document.title;
        }
        document.title = awayTitle;
      } else {
        // Tab is visible again (user switched back)
        if (originalTitleRef.current) {
          document.title = originalTitleRef.current;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
