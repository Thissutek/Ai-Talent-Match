"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, signOut } from "@/lib/supabase/client";
import CandidateList from "@/components/recruiter/CandidateList";

// Import icons from react-icons
import {
  FiUsers,
  FiCheckSquare,
  FiStar,
  FiTrendingUp,
  FiSearch,
  FiClipboard,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    reviewedCandidates: 0,
    averageRating: 0,
    highRankedCandidates: 0,
  });

  // Fetch user data and statistics
  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Not authenticated");
        }

        setUser(user);

        // Fetch statistics
        const { data: totalCandidates } = await supabase
          .from("candidate_profiles")
          .select("id", { count: "exact" });

        const { data: reviewedCandidates } = await supabase
          .from("recruiter_feedback")
          .select("id", { count: "exact" })
          .eq("recruiter_id", user.id);

        const { data: feedbackData } = await supabase
          .from("recruiter_feedback")
          .select("rating")
          .eq("recruiter_id", user.id);

        const { data: highRankedCandidates } = await supabase
          .from("candidate_profiles")
          .select("id", { count: "exact" })
          .gte("ai_ranking", 8);

        // Calculate average rating
        const totalRating =
          feedbackData?.reduce((sum, item) => sum + item.rating, 0) || 0;
        const averageRating = feedbackData?.length
          ? (totalRating / feedbackData.length).toFixed(1)
          : 0;

        setStats({
          totalCandidates: totalCandidates?.length || 0,
          reviewedCandidates: reviewedCandidates?.length || 0,
          averageRating,
          highRankedCandidates: highRankedCandidates?.length || 0,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/login"); // Redirect to login if not authenticated
      }
    }

    fetchData();
  }, [router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with sign out button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl primary font-bold">Recruiter Dashboard</h1>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/20 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <FiUsers size={24} />
            </div>
            <div className="ml-4">
              <p className="text-white text-sm">Total Candidates</p>
              <p className="text-2xl text-white font-semibold">
                {stats.totalCandidates}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/20 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <FiCheckSquare size={24} />
            </div>
            <div className="ml-4">
              <p className="text-white text-sm">Reviewed by You</p>
              <p className="text-2xl text-white font-semibold">
                {stats.reviewedCandidates}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/20 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
              <FiStar size={24} />
            </div>
            <div className="ml-4">
              <p className="text-white text-sm">Avg. Rating Given</p>
              <p className="text-2xl text-white font-semibold">
                {stats.averageRating}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/20 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-800">
              <FiTrendingUp size={24} />
            </div>
            <div className="ml-4">
              <p className="text-white text-sm">High-Ranked Candidates</p>
              <p className="text-2xl text-white font-semibold">
                {stats.highRankedCandidates}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates list section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Candidate Pool</h2>
        <CandidateList />
      </div>

      {/* Quick actions */}
      <div className="bg-white/20 rounded-lg shadow p-6">
        <h2 className="text-xl text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/recruiter/candidates")}
            className="flex items-center p-3 hover:bg-blue-50 text-blue-700 rounded-lg bg-blue-100 transition-colors"
          >
            <FiSearch className="w-6 h-6 mr-2" />
            Browse All Candidates
          </button>

          <button
            onClick={() => router.push("/recruiter/my-reviews")}
            className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FiClipboard className="w-6 h-6 mr-2" />
            View My Reviews
          </button>

          <button
            onClick={() => router.push("/recruiter/settings")}
            className="flex items-center p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiSettings className="w-6 h-6 mr-2" />
            Account Settings
          </button>
        </div>
      </div>
    </div>
  );
}

