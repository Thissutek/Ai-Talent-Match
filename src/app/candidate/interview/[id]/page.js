"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import VideoInterview from "@/components/candidate/VideoInterview";
import React from "react";
import Link from "next/link";

export default function InterviewPage({ params }) {
  const candidateId = React.use(params).id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviewData, setInterviewData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if user is the candidate
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("You must be logged in to access this page.");
          setLoading(false);
          return;
        }

        // Get candidate profile to verify ownership
        const { data: candidateProfile, error: profileError } = await supabase
          .from("candidate_profiles")
          .select("user_id, interview_status")
          .eq("id", candidateId)
          .single();

        if (profileError) throw profileError;

        // Verify this is the candidate's profile
        if (candidateProfile.user_id !== user.id) {
          setError("You do not have permission to access this interview.");
          setLoading(false);
          return;
        }

        // Verify interview is scheduled
        if (candidateProfile.interview_status !== "scheduled") {
          setError(
            "Your interview is not currently scheduled. Please schedule an interview first.",
          );
          setLoading(false);
          return;
        }

        // Get interview request data
        const { data: interviewRequest, error: requestError } = await supabase
          .from("interview_requests")
          .select("*")
          .eq("candidate_id", candidateId)
          .eq("status", "scheduled")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (requestError) throw requestError;

        setInterviewData(interviewRequest);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching interview data:", err);
        setError("Failed to load interview data. Please try again.");
        setLoading(false);
      }
    }

    if (candidateId) {
      fetchData();
    }
  }, [candidateId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <Link
            href="/candidate/dashboard"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Video Interview</h1>

        <VideoInterview
          candidateId={candidateId}
          interviewId={interviewData.id}
        />

        <div className="mt-6 text-center">
          <Link
            href="/candidate/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
