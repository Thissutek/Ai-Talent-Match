"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, signOut } from "@/lib/supabase/client";
import ResumeUploader from "@/components/candidate/ResumeUploader";
import SkillsChat from "@/components/candidate/SkillsChat";
import InterviewScheduler from "@/components/candidate/InterviewScheduler";
import {
  assessCandidateSkills,
  calculateCandidateRanking,
} from "@/lib/ai/skillChecker";
import { FiAlertCircle, FiVideo, FiCheck } from "react-icons/fi";
import VideoInterview from "@/components/candidate/VideoInterview";
import Link from "next/link";

export default function CandidateDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [chatCompleted, setChatCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload Resume, 2: Skills Chat, 3: Complete

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

          // Determine current step
          if (profile.resume_url) {
            setResumeUploaded(true);
            setCurrentStep(profile.ai_ranking ? 3 : 2);
            setChatCompleted(!!profile.ai_ranking);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login"); // Redirect to login if not authenticated
      }
    }

    fetchUserData();
  }, [router]);

  // Handle resume upload completion
  const handleResumeUpload = async (data) => {
    try {
      const { resumeUrl, parsedResume } = data;

      console.log("Resume upload complete:", resumeUrl);
      console.log("Parsed resume data:", parsedResume);

      // Create profile data object
      const profileData = {
        user_id: user.id,
        resume_url: resumeUrl,
        parsed_resume: parsedResume.parsedResume,
        skills: parsedResume.extractedSkills,
        updated_at: new Date(),
      };

      console.log("Updating profile with data:", profileData);

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      console.log("Existing profile check:", existingProfile, checkError);

      let result;

      if (!existingProfile) {
        // Insert new profile if it doesn't exist
        console.log("Creating new profile");
        result = await supabase
          .from("candidate_profiles")
          .insert([profileData])
          .select()
          .single();
      } else {
        // Update existing profile
        console.log("Updating existing profile");
        result = await supabase
          .from("candidate_profiles")
          .update(profileData)
          .eq("user_id", user.id)
          .select()
          .single();
      }

      const { data: updatedProfile, error } = result;

      console.log("Update result:", updatedProfile, error);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setProfile(updatedProfile);
      setResumeUploaded(true);
      setCurrentStep(2); // Move to skills chat
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save resume data. Please try again.");
    }
  };

  // Handle chat completion
  const handleChatComplete = async (chatHistory) => {
    try {
      // Assess candidate based on resume and chat
      const assessment = await assessCandidateSkills(
        profile.parsed_resume,
        chatHistory,
      );

      // Calculate ranking
      const ranking = calculateCandidateRanking(assessment);

      // Update candidate profile with assessment results
      const { data: updatedProfile, error } = await supabase
        .from("candidate_profiles")
        .update({
          ai_ranking: ranking,
          ai_notes: JSON.stringify(assessment),
          updated_at: new Date(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(updatedProfile);
      setChatCompleted(true);
      setCurrentStep(3); // Move to completion step
    } catch (error) {
      console.error("Error updating assessment:", error);
      alert("Failed to save assessment data. Please try again.");
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
        <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
      </div>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
            <div className="step-circle">1</div>
            <div className="step-text">Upload Resume</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
            <div className="step-circle">2</div>
            <div className="step-text">Skills Assessment</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
            <div className="step-circle">3</div>
            <div className="step-text">Complete</div>
          </div>
        </div>
      </div>
      {/* Step 1: Resume Upload */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Step 1: Upload Your Resume
          </h2>
          <p className="mb-6 text-gray-600">
            Upload your resume to begin the assessment process. Our AI will
            analyze your resume to extract your skills and experience.
          </p>
          <ResumeUploader
            userId={user.id}
            onUploadComplete={handleResumeUpload}
          />
        </div>
      )}
      {/* Step 2: Skills Chat */}
      {currentStep === 2 && resumeUploaded && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Step 2: Skills Assessment Chat
          </h2>
          <p className="mb-6 text-gray-600">
            Chat with our AI assistant to verify your skills and experience.
            This helps us provide a more accurate assessment to potential
            employers.
          </p>
          <SkillsChat
            candidateId={profile.id}
            parsedResume={{
              parsedResume: profile.parsed_resume,
              extractedSkills: profile.skills,
            }}
            onChatComplete={handleChatComplete}
          />
        </div>
      )}
      {/* Step 3: Completion */}
      {currentStep === 3 && resumeUploaded && chatCompleted && (
        <div className="bg-white/10 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl text-white font-semibold mb-4">
            Assessment Complete!
          </h2>
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <p className="text-center text-gray-300 mb-4">
            Your profile is complete and ready to be viewed by recruiters.
            We&apos;ll notify you when a recruiter shows interest in your
            profile.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              What happens next?
            </h3>
            <ul className="list-disc list-inside text-green-700">
              <li>Recruiters will be able to view your profile</li>
              <li>
                You&apos;ll receive notifications when your profile is viewed
              </li>
              <li>You can update your profile at any time</li>
            </ul>
          </div>
        </div>
      )}
      {/* Step 4. Emails candidate based on ranking and schedules and interview */}
      {chatCompleted &&
        profile &&
        profile.ai_ranking >= 80 &&
        !profile.interview_status && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  You qualify for an interview!
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Based on your skills assessment, you&apos;ve qualified for
                    an interview. Click the button below to see available time
                    slots.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={async () => {
                      try {
                        // Create interview request
                        const availableSlots = [
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
                        ];

                        const { data: interviewRequest, error: requestError } =
                          await supabase
                            .from("interview_requests")
                            .insert([
                              {
                                candidate_id: profile.id,
                                status: "pending",
                                available_slots: availableSlots,
                                email_sent: true,
                                created_at: new Date(),
                              },
                            ])
                            .select()
                            .single();

                        if (requestError) throw requestError;

                        // Update interview status
                        const { data: updatedProfile, error: statusError } =
                          await supabase
                            .from("candidate_profiles")
                            .update({
                              interview_status: "invited",
                            })
                            .eq("id", profile.id)
                            .select()
                            .single();

                        if (statusError) throw statusError;

                        // Update local state without page refresh
                        setProfile(updatedProfile);

                        // Show success message
                        alert(
                          "Interview invitation created! Please select a time slot below.",
                        );
                      } catch (err) {
                        console.error("Error setting up interview:", err);
                        alert(
                          "There was an error setting up your interview. Please try again.",
                        );
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    View Available Times
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      {/* Interview Scheduler - Show this after the button is clicked */}
      {profile && profile.interview_status === "invited" && (
        <div className="mt-6 bg-white/10 rounded-lg shadow-md p-6">
          <h2 className="text-xl text-white font-semibold mb-4">
            Schedule Your Interview
          </h2>
          <InterviewScheduler candidateId={profile.id} />
        </div>
      )}{" "}
      {/* Video Interview*/}
      {profile &&
        profile.interview_status === "scheduled" &&
        !profile.interview_completed_at && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Video Interview</h2>
            <p className="text-gray-600 mb-4">
              You&apos;ve scheduled your interview! You can now complete your AI
              video interview.
            </p>
            <Link
              href={`/candidate/interview/${profile.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiVideo className="mr-2" />
              Start Video Interview
            </Link>
          </div>
        )}
      {profile && profile.interview_completed_at && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Video Interview</h2>
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <FiCheck className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Interview Completed
                </h3>
                <p className="mt-1 text-xs text-green-700">
                  Your video interview was completed on{" "}
                  {new Date(
                    profile.interview_completed_at,
                  ).toLocaleDateString()}
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Profile Summary (visible after resume upload) */}
      {resumeUploaded && profile && (
        <div className="bg-white/10 rounded-lg shadow-md p-6">
          <h2 className="text-xl text-white font-semibold mb-4">
            Your Profile Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-200 mb-2">
                Contact Information
              </h3>
              <p className="text-gray-300">
                {profile.parsed_resume?.contactInfo?.name || "Name not found"}
              </p>
              <p className="text-gray-300">
                {profile.parsed_resume?.contactInfo?.email || user.email}
              </p>
              <p className="text-gray-300">
                {profile.parsed_resume?.contactInfo?.phone || "Phone not found"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-200 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills &&
                  profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
