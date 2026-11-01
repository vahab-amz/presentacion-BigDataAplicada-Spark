"use client";

import { useEffect } from "react";

/** Registers /sw.js in production so the deck keeps working without Wi-Fi. */
export function OfflineSupport() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is best-effort */
    });
  }, []);
  return null;
}
