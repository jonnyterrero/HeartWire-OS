"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

type Mode = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      setLoading(false);
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "If that email is registered, a reset link is on its way.",
        });
      }
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setMessage({
          type: "success",
          text: "Account created. Check your inbox to confirm, then sign in.",
        });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191919] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-6">
          <img
            src="/icon-512.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-xl"
          />
          <span className="text-2xl font-bold text-white">HeartWire OS</span>
          <span className="text-[10px] uppercase tracking-[0.35em] text-teal-400/80">
            Intelligent Learning
          </span>
        </div>

        <p className="text-center text-sm text-gray-400 mb-6 leading-relaxed">
          Personal engineering study OS — tracks, courses, a timer, and a
          library. Public beta: expect sharp edges, and don&apos;t store
          anything you can&apos;t afford to lose.
        </p>

        <div className="bg-[#2F3437] border border-gray-700 rounded-xl p-8">
          <h2 className="text-lg font-semibold text-white mb-1">
            {mode === "signup"
              ? "Create your account"
              : mode === "forgot"
                ? "Reset your password"
                : "Welcome back"}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {mode === "signup"
              ? "We'll seed starter tracks so the dashboard isn't empty."
              : mode === "forgot"
                ? "We'll email a link if that account exists."
                : "Sign in to your workspace."}
          </p>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 bg-[#191919] border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {mode !== "forgot" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full px-4 py-2.5 bg-[#191919] border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {message && (
              <div
                className={`text-sm px-3 py-2 rounded-lg ${
                  message.type === "error"
                    ? "bg-red-900/30 text-red-400 border border-red-800"
                    : "bg-green-900/30 text-green-400 border border-green-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
            >
              {loading
                ? "…"
                : mode === "signup"
                  ? "Create Account"
                  : mode === "forgot"
                    ? "Send reset link"
                    : "Sign In"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-400 mt-5 space-y-2">
            {mode === "signin" && (
              <>
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setMessage(null);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setMessage(null);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Forgot password?
                  </button>
                </p>
              </>
            )}
            {mode !== "signin" && (
              <p>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setMessage(null);
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Back to sign in
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
          iPhone: Share → Add to Home Screen. Android: Chrome menu → Install app.
        </p>
        <p className="text-center text-xs text-gray-600 mt-2 space-x-3">
          <Link href="/privacy" className="hover:text-gray-400 underline underline-offset-2">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-gray-400 underline underline-offset-2">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}
