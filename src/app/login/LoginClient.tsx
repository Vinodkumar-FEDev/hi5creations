"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/gallery/upload");
      } else {
        setErrorMsg(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setErrorMsg("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-24 pb-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black text-xl shadow-md">
            H5
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight font-display">
            Admin Portal Login
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Sign in to manage Cloudflare R2 image gallery & uploads
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Admin</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <Link
            href="/gallery"
            className="text-xs text-stone-500 hover:text-orange-500 transition-colors font-medium"
          >
            ← Back to Public Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
