"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, supabase } from "@/lib/supabase/client"; // Added supabase import here

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      // Attempt to sign in
      const { user } = await signIn(email, password);

      if (user) {
        // Get user type to determine redirect
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;

        // Redirect based on user type
        if (userData.user_type === "candidate") {
          router.push("/candidate/dashboard");
        } else if (userData.user_type === "recruiter") {
          router.push("/recruiter/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="rounded-lg w-full max-w-md bg-white/10 text-white p-8 rounded-lg backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold primary">NeuroMatch</h1>
          <p className="text-white mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00ff9d] focus:border-[#00ff9d]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00ff9d] focus:border-[#00ff9d]"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border duration-300 rounded-md shadow-sm text-sm font-medium primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-white">Or</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-white">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium primary hover:text-white"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

