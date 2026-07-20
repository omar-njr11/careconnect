"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        // Find user role after login to redirect correctly
        // NextAuth redirect: false allows us to handle redirection
        // To be safe, redirect to /app if they are a caregiver or general user
        if (email.includes("nurse")) {
          router.push("/nurse");
        } else {
          router.push("/app");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (emailVal: string) => {
    setEmail(emailVal);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl mb-3 shadow-md shadow-indigo-100">
            C
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome to CareConnect</h2>
          <p className="text-sm text-slate-500 mt-1">Please sign in to access your dashboard</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg text-rose-800 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-slate-800"
              placeholder="name@careconnect.de"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-slate-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all text-sm shadow-lg shadow-indigo-100"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Test Accounts/Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-4">
            Quick Test Accounts
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillCredentials("joanna@careconnect.de")}
              type="button"
              className="flex flex-col items-start p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all"
            >
              <span className="text-xs font-bold text-indigo-700">Caregiver</span>
              <span className="text-[10px] text-slate-500 mt-0.5">joanna@careconnect.de</span>
            </button>

            <button
              onClick={() => fillCredentials("nurse@careconnect.de")}
              type="button"
              className="flex flex-col items-start p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all"
            >
              <span className="text-xs font-bold text-indigo-700">Nurse</span>
              <span className="text-[10px] text-slate-500 mt-0.5">nurse@careconnect.de</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">
            Password for both: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">password123</code>
          </p>
        </div>

      </div>
    </div>
  );
}
