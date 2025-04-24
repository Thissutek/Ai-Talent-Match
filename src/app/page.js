"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import ScrollBackground from "@/components/ui/ScrollBackground";

// Import icons from react-icons
import {
  FiUpload,
  FiMessageSquare,
  FiUsers,
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiFile,
  FiStar,
  FiTrendingUp,
  FiSearch,
  FiClipboard,
  FiSettings,
} from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    async function checkUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // If user is logged in, redirect to appropriate dashboard
        if (user) {
          const { data: userData } = await supabase
            .from("users")
            .select("user_type")
            .eq("id", user.id)
            .single();

          if (userData) {
            if (userData.user_type === "candidate") {
              router.push("/candidate/dashboard");
            } else if (userData.user_type === "recruiter") {
              router.push("/recruiter/dashboard");
            }
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking user:", error);
        setLoading(false);
      }
    }

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ScrollBackground videoSrc="/blender-animation.mp4">
      {/* First section */}
      <section className="h-screen flex items-center justify-center">
        <div className="bg-black/60 text-white p-8 rounded-lg max-w-2xl backdrop-blur-sm">
          <h1 className="text-5xl font-bold">
            Welcome to <span className="primary">NeuroMatch</span>
          </h1>
          <p className="mt-4 text-xl">
            Connect the right candidates with the right opportunities using
            AI-powered skill assessment and matching.
          </p>
          <div className="mt-8 animate-bounce flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* Services section */}
      <section className="min-h-screen py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-black/60 text-white p-8 rounded-lg backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Our Process
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUpload size={24} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Upload Resume</h3>
                <p>
                  Candidates upload their resume and our AI automatically
                  extracts skills and experience.
                </p>
              </div>

              {/* Service 2 */}
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageSquare size={24} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">AI Assessment</h3>
                <p>
                  Our AI conducts a conversational assessment to verify skills
                  and experience in depth.
                </p>
              </div>

              {/* Service 3 */}
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers size={24} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Smart Matching</h3>
                <p>
                  Recruiters receive ranked candidates based on skill
                  verification and assessment results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="h-screen flex items-center justify-center gap-20">
        <div className="bg-black/60 text-white p-8 rounded-lg max-w-2xl backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-6">For Job Seekers</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <FiCheckCircle
                className="primary mt-1 mr-2 flex-shrink-0"
                size={18}
              />
              <span>Get your skills accurately assessed by AI</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle
                className="primary mt-1 mr-2 flex-shrink-0"
                size={18}
              />
              <span>Stand out to recruiters with verified skill badges</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle
                className="primary mt-1 mr-2 flex-shrink-0"
                size={18}
              />
              <span>Get matched with jobs that fit your actual abilities</span>
            </li>
          </ul>
        </div>
        <div className="bg-black/60 text-white p-8 rounded-lg max-w-2xl backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-6">For Recruiters</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <FiCheckCircle
                className="primary mt-1 mr-2 flex-shrink-0"
                size={18}
              />
              <span>Access AI-verified candidates with proven skills</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle
                className="primary mt-1 mr-2 flex-shrink-0"
                size={18}
              />
              <span>Save time with intelligent candidate ranking</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle
                className="primary mt-1 mr-2 flex-shrink-0"
                size={18}
              />
              <span>Reduce hiring costs and improve match quality</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Contact section */}
      <section className="h-screen flex items-center justify-center">
        <div className="bg-black/60 text-white p-8 rounded-lg max-w-2xl backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your job search?
          </h2>
          <p className="mb-8">
            Connect with top recruiters and let AI bring the right opportunities
            to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="primary-button primary-button:hover border font-medium py-3 px-6 rounded-full duration-300 text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="secondary-button secondary-button:hover border font-medium py-3 px-6 rounded-full duration-300 text-center"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
      <footer className="text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold primary">NeuroMatch</h2>
              <p className="text-gray-400">
                AI-powered talent matching platform
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/about"
                className="hover:text-blue-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-blue-400 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} NeuroMatch. All rights reserved.
          </div>
        </div>
      </footer>
    </ScrollBackground>
  );
}
