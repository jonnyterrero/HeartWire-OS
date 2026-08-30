"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "heartwire-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const ua = navigator.userAgent;
    const ios =
      /iPad|iPhone|iPod/.test(ua) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIos(ios);

    if (ios) {
      setVisible(true);
      return;
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }, [deferred, dismiss]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 rounded-lg border border-hw-sky/30 bg-[color:var(--hw-surface)] shadow-lg p-4 text-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-[color:var(--hw-text)]">
          Install HeartWire OS
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="min-h-[44px] min-w-[44px] -m-2 flex items-center justify-center text-[color:var(--hw-muted)]"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-[color:var(--hw-muted)] mb-3">
        {isIos
          ? "Tap Share, then “Add to Home Screen” for the full app experience."
          : "Add to your home screen for quick access and offline shell."}
      </p>
      {!isIos && deferred && (
        <button
          type="button"
          onClick={install}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-hw-sky text-white rounded-lg text-sm font-medium hover:opacity-90 min-h-[44px]"
        >
          <Download className="w-4 h-4" aria-hidden />
          Install app
        </button>
      )}
    </div>
  );
}
