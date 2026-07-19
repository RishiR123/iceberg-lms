"use client";

import { useEffect } from "react";

/**
 * When a new version is deployed, chunk hashes change and any already-open tab
 * will fail to fetch the old chunks (ChunkLoadError / "failed to load chunk").
 * That leaves the page broken until a manual refresh — bad for learners who are
 * mid-session during a deploy.
 *
 * This listens for that specific failure and does a single full reload, which
 * pulls fresh HTML and the current chunks. A sessionStorage guard prevents a
 * reload loop if the reload itself somehow hits the same error.
 */
export function ChunkErrorReloader() {
  useEffect(() => {
    const GUARD = "chunk-reload-attempted";

    const isChunkError = (message?: string) =>
      !!message &&
      (/ChunkLoadError/i.test(message) ||
        /Loading chunk [\w-]+ failed/i.test(message) ||
        /Failed to load chunk/i.test(message) ||
        /error loading dynamically imported module/i.test(message));

    const recover = (message?: string) => {
      if (!isChunkError(message)) return;
      if (sessionStorage.getItem(GUARD)) return; // already tried once — don't loop
      sessionStorage.setItem(GUARD, "1");
      window.location.reload();
    };

    const onError = (e: ErrorEvent) => recover(e.message || e.error?.message);
    const onRejection = (e: PromiseRejectionEvent) =>
      recover(typeof e.reason === "string" ? e.reason : e.reason?.message);

    // A clean navigation means the app loaded fine — clear the guard so a future
    // deploy can recover again.
    if (document.readyState === "complete") sessionStorage.removeItem(GUARD);
    else window.addEventListener("load", () => sessionStorage.removeItem(GUARD), { once: true });

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
