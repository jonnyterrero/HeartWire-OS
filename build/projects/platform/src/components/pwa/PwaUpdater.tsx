"use client";

import { useEffect, useRef, useState } from "react";

const UPDATE_CHECK_MS = 60 * 60 * 1000;

export default function PwaUpdater() {
  const [updateReady, setUpdateReady] = useState(false);
  const reloadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    function onControllerChange() {
      if (reloadedRef.current) return;
      reloadedRef.current = true;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    async function checkForUpdates() {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.update();
      } catch {
        // ignore — offline or unsupported
      }
    }

    function attachUpdateListener(reg: ServiceWorkerRegistration) {
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setUpdateReady(true);
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    }

    navigator.serviceWorker.ready.then((reg) => {
      attachUpdateListener(reg);
      checkForUpdates();
    });

    const interval = window.setInterval(checkForUpdates, UPDATE_CHECK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") checkForUpdates();
    };
    const onOnline = () => checkForUpdates();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  if (!updateReady) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 rounded-lg border border-primary/30 bg-white dark:bg-darkSurface shadow-lg p-3 text-sm">
      <p className="text-gray-900 dark:text-white font-medium mb-2">
        Update available
      </p>
      <p className="text-gray-500 text-xs mb-3">
        A new version of HeartWire is ready. Reload to get the latest features.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="w-full px-3 py-1.5 bg-primary text-white rounded text-sm hover:opacity-90"
      >
        Reload now
      </button>
    </div>
  );
}
