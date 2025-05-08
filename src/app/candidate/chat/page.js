"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, signOut } from "@/lib/supabase/client";
import SkillsChat from "@/components/candidate/SkillsChat";
import {
  assessCandidateSkills,
  calculateCandidateRanking,
} from "@/lib/ai/skillChecker";
import {
  FiArrowLeft,
  FiLogOut,
  FiAward,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { sendInterviewInvitation } from "@/lib/email/interviewScheduler";

export default function CandidateChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatCompleted, setChatCompleted] = useState(false);
  const [assessment, setAssessment] = useState(null);

  // Fetch user and profile data
  useEffect(() => {
    async function fetchUserData() {
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

        // Get candidate profile
        const { data: profile, error: profileError } = await supabase
          .from("candidate_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!profileError && profile) {
          setProfile(profile);

          // Check if assessment was already completed
          if (profile.ai_ranking && profile.ai_notes) {
            setChatCompleted(true);
            setAssessment(JSON.parse(profile.ai_notes));
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
        setLoading(false);

        // Redirect to login if not authenticated
        if (error.message === "Not authenticated") {
          router.push("/login");
        }
      }
    }

    fetchUserData();
  }, [router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle chat completion
  const handleChatComplete = async (chatHistory) => {
    try {
      // Generate the assessment
      const newAssessment = await assessCandidateSkills(
        {
          parsedResume: profile.parsed_resume,
          extractedSkills: profile.skills,
        },
        chatHistory,
      );

      // Calculate ranking
      const ranking = calculateCandidateRanking(newAssessment);

      console.log("Candidate ranking:", ranking); // Debug log to verify score

      // Update candidate profile with assessment results
      const { data: updatedProfile, error } = await supabase
        .from("candidate_profiles")
        .update({
          ai_ranking: ranking,
          ai_notes: JSON.stringify(newAssessment),
          updated_at: new Date(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Update state with the updated profile data
      setProfile(updatedProfile);
      setAssessment(newAssessment);
      setChatCompleted(true);

      // Check if candidate qualifies for interview (score >= 80)
      if (ranking >= 80) {
        console.log("Candidate qualifies for interview!"); // Debug log

        try {
          // For MVP, simulate sending email by updating the database
          const { data: interviewData, error: interviewError } = await supabase
            .from("interview_requests")
            .insert([
              {
                candidate_id: updatedProfile.id,
                status: "pending",
                available_slots: [
                  {
                    date: "2025-05-15",
                    slots: ["10:00 AM", "1:00 PM", "3:30 PM"],
                  },
                  {
                    date: "2025-05-16",
                    slots: ["9:30 AM", "11:00 AM", "2:00 PM"],
                  },
                  {
                    date: "2025-05-17",
                    slots: ["10:30 AM", "1:30 PM", "4:00 PM"],
                  },
                ],
                email_sent: true,
                created_at: new Date(),
              },
            ])
            .select()
            .single();

          if (interviewError) throw interviewError;

          // Update candidate's interview status
          const { error: statusError } = await supabase
            .from("candidate_profiles")
            .update({
              interview_status: "invited",
              updated_at: new Date(),
            })
            .eq("id", updatedProfile.id);

          if (statusError) throw statusError;

          console.log("Interview invitation sent!", interviewData); // Debug log

          // Display a notification to the user (you would need to implement this)
          alert(
            "Congratulations! You've qualified for an interview. Check your email for details.",
          );
        } catch (interviewErr) {
          console.error("Error sending interview invitation:", interviewErr);
          // Continue without failing the whole process
        }
      }
    } catch (error) {
      console.error("Error updating assessment:", error);
      setError("Failed to save assessment. Please try again.");
    }
  }; // Start a new chat session
  const handleStartNewChat = () => {
    setChatCompleted(false);
    setAssessment(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/candidate/dashboard"
              className="flex items-center text-gray-200 hover:text-[#00ff9d]"
            >
              <FiArrowLeft className="mr-2" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-200">
            Skills Assessment
          </h1>
          <p className="mt-1 text-sm text-gray-300">
            Chat with our AI to verify your skills and experience
          </p>
        </div>

        <div className="mt-6 px-4 sm:px-0">
          {/* Resume Required Warning */}
          {(!profile || !profile.resume_url) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Resume Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Please upload your resume first to get the most accurate
                      skill assessment.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <Link
                        href="/candidate/resume"
                        className="px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Upload Resume
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className="bg-white/10 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-5 bg-white/10 ">
              <h2 className="text-lg font-medium text-gray-200">
                Skill Assessment Chat
              </h2>
              {!chatCompleted && (
                <p className="mt-1 text-sm text-gray-200">
                  Answer questions to verify your skills and improve your
                  profile
                </p>
              )}
            </div>

            <div className="p-6">
              {chatCompleted && assessment ? (
                <div className="space-y-6">
                  <div className="flex items-center text-green-600">
                    <FiCheckCircle className="h-6 w-6 mr-2" />
                    <h3 className="text-lg font-medium">
                      Assessment Completed
                    </h3>
                  </div>

                  <div className="bg-white/10 p-4 rounded-md">
                    <h4 className="font-medium text-gray-200 mb-2">Summary</h4>
                    <p className="text-sm text-gray-300">
                      {assessment.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Verified Skills */}
                    <div className="bg-white/10 p-4 rounded-md">
                      <h4 className="font-medium text-gray-200 mb-2 flex items-center">
                        <FiAward className="text-green-500 mr-2" />
                        Verified Skills
                      </h4>
                      {assessment.verifiedSkills &&
                      Object.keys(assessment.verifiedSkills).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(assessment.verifiedSkills).map(
                            ([skill, confidence], index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm font-medium text-white">
                                  {skill}
                                </span>
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div
                                      className="h-2 bg-green-500 rounded-full"
                                      style={{ width: `${confidence * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {Math.round(confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-200">
                          No skills have been verified yet
                        </p>
                      )}
                    </div>

                    {/* Areas for Improvement */}
                    <div className="bg-white/10 p-4 rounded-md">
                      <h4 className="font-medium text-gray-200 mb-2 flex items-center">
                        <FiInfo className="text-yellow-500 mr-2" />
                        Areas for Improvement
                      </h4>
                      {assessment.skillGaps &&
                      assessment.skillGaps.length > 0 ? (
                        <ul className="space-y-1 text-sm text-gray-300">
                          {assessment.skillGaps.map((gap, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-yellow-500 mr-2">•</span>
                              {gap}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-300">
                          No improvement areas identified
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleStartNewChat}
                      className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Start New Assessment
                    </button>
                  </div>
                </div>
              ) : (
                <SkillsChat
                  candidateId={profile?.id}
                  parsedResume={{
                    parsedResume: profile?.parsed_resume,
                    extractedSkills: profile?.skills,
                  }}
                  onChatComplete={handleChatComplete}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
