import { useState, useEffect } from "react";
import { getCandidateById, submitFeedback } from "@/lib/supabase/client";
import {
  FiCheck,
  FiStar,
  FiDownload,
  FiExternalLink,
  FiUser,
  FiMail,
  FiPhone,
  FiAward,
  FiBriefcase,
  FiBook,
  FiTrendingUp,
  FiAlertTriangle,
  FiMessageCircle,
  FiCalendar,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { supabase } from "@/lib/supabase/client";

export default function CandidateDetails({ candidateId, recruiterId }) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'resume', 'assessment', 'chat'
  const [interviewData, setInterviewData] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [interviewRecording, setInterviewRecording] = useState(null);
  const [loadingRecording, setLoadingRecording] = useState(false);

  const fetchInterviewData = async () => {
    if (!candidate || !candidate.id) return;

    try {
      setLoadingInterview(true);

      // Fetch interview requests for this candidate
      const { data, error } = await supabase
        .from("interview_requests")
        .select("*")
        .eq("candidate_id", candidate.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching interview data:", error);
        setLoadingInterview(false);
        return;
      }

      setInterviewData(data.length > 0 ? data[0] : null);
      setLoadingInterview(false);
    } catch (err) {
      console.error("Error in fetchInterviewData:", err);
      setLoadingInterview(false);
    }
  };

  const fetchInterviewRecording = async () => {
    if (!candidate || !candidate.id) return;

    try {
      setLoadingRecording(true);

      const { data, error } = await supabase
        .from("interview_recordings")
        .select("*")
        .eq("candidate_id", candidate.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      setInterviewRecording(data.length > 0 ? data[0] : null);
      setLoadingRecording(false);
    } catch (err) {
      console.error("Error fetching interview recording:", err);
      setLoadingRecording(false);
    }
  };

  useEffect(() => {
    if (activeTab === "interview" && candidate) {
      fetchInterviewData();
      fetchInterviewRecording();
    }
  }, [activeTab, candidate]);

  // Fetch candidate details
  useEffect(() => {
    async function fetchCandidate() {
      try {
        setLoading(true);
        const data = await getCandidateById(candidateId);
        setCandidate(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching candidate:", err);
        setError("Failed to load candidate details. Please try again.");
        setLoading(false);
      }
    }

    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  // Handle feedback submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      alert("Please enter feedback before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      await submitFeedback(recruiterId, candidateId, feedback, rating);
      setFeedbackSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md flex items-center">
        <FiAlertTriangle size={20} className="mr-2" />
        {error}
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md flex items-center">
        <FiAlertTriangle size={20} className="mr-2" />
        Candidate not found.
      </div>
    );
  }

  // Parse AI notes if available
  const aiNotes = candidate.ai_notes ? JSON.parse(candidate.ai_notes) : null;

  return (
    <div className="bg-white/10 rounded-lg shadow-lg">
      {/* Candidate header with ranking */}
      <div className="p-6 border-b border-black-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {candidate.full_name || "Unnamed Candidate"}
            </h1>
            <p className="text-gray-400 flex items-center">
              <FiMail size={16} className="mr-2" />
              {candidate.users?.email || "Email not available"}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                candidate.ai_ranking >= 8
                  ? "bg-green-500"
                  : candidate.ai_ranking >= 6
                    ? "bg-blue-500"
                    : candidate.ai_ranking >= 4
                      ? "bg-yellow-500"
                      : "bg-red-500"
              }`}
            >
              {candidate.ai_ranking?.toFixed(1) || "N/A"}
            </div>
            <span className="text-sm text-gray-400 mt-1">AI Ranking</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-black-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === "profile"
                ? "border-b-2 border-[#00ff9d] text-[#00ff9d]"
                : "text-gray-200 hover:text-gray-700"
            }`}
          >
            <FiUser size={16} className="mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === "resume"
                ? "border-b-2 border-[#00ff9d] text-[#00ff9d]"
                : "text-gray-200 hover:text-gray-700"
            }`}
          >
            <FiDownload size={16} className="mr-2" />
            Resume
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === "interview"
                ? "border-b-2 border-[#00ff9d] text-[#00ff9d]"
                : "text-gray-200 hover:text-gray-700"
            }`}
          >
            <FiCalendar size={16} className="mr-2" />
            Interview
          </button>

          <button
            onClick={() => setActiveTab("assessment")}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === "assessment"
                ? "border-b-2 border-[#00ff9d] text-[#00ff9d]"
                : "text-gray-200 hover:text-gray-700"
            }`}
          >
            <FiAward size={16} className="mr-2" />
            AI Assessment
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === "chat"
                ? "border-b-2 border-[#00ff9d] text-[#00ff9d]"
                : "text-gray-200 hover:text-gray-700"
            }`}
          >
            <FiMessageCircle size={16} className="mr-2" />
            Chat History
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
              <FiUser size={20} className="mr-2" />
              Candidate Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <FiUser size={16} className="mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="text-gray-300 mr-2">Name:</span>{" "}
                    <span className="text-white">
                      {" "}
                      {candidate.full_name || "Not provided"}{" "}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <FiMail size={14} className="text-gray-300 mr-2" />
                    <span className="text-gray-300 mr-2">Email:</span>{" "}
                    <span className="text-white">
                      {" "}
                      {candidate.users?.email || "Not provided"}{" "}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <FiPhone size={14} className="text-gray-300 mr-2" />
                    <span className="text-gray-300 mr-2">Phone:</span>
                    <span className="text-white">
                      {" "}
                      {candidate.parsed_resume?.contactInfo?.phone ||
                        "Not provided"}{" "}
                    </span>
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <FiAward size={16} className="mr-2 text-white" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    candidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills listed</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <FiBook size={16} className="mr-2 text-white" />
                  Education
                </h3>
                {candidate.parsed_resume?.education &&
                candidate.parsed_resume.education.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.parsed_resume.education.map((edu, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-blue-300 pl-3"
                      >
                        <p className="font-medium text-white">
                          {edu.institution || "Unknown Institution"}
                        </p>
                        <p className="text-sm text-gray-300">
                          {edu.degree || "Degree not specified"}
                        </p>
                        <p className="text-sm text-gray-300">
                          {edu.graduationYear || "Year not specified"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No education history available
                  </p>
                )}
              </div>

              {/* Work Experience */}
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <FiBriefcase size={16} className="mr-2 text-white" />
                  Work Experience
                </h3>
                {candidate.parsed_resume?.workExperience &&
                candidate.parsed_resume.workExperience.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.parsed_resume.workExperience.map(
                      (exp, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-green-300 pl-3"
                        >
                          <p className="font-medium text-white">
                            {exp.position || "Position not specified"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {exp.company || "Company not specified"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {exp.duration || "Duration not specified"}
                          </p>
                          {exp.responsibilities && (
                            <p className="text-sm text-gray-400 mt-1">
                              {typeof exp.responsibilities === "string"
                                ? exp.responsibilities
                                : exp.responsibilities.join(", ")}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-white">No work experience available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === "resume" && (
          <div>
            <h2 className="text-xl text-white font-semibold mb-4 flex items-center">
              <FiDownload size={20} className="mr-2" />
              Resume Document
            </h2>

            {candidate.resume_url ? (
              <div className="bg-white/10 text-white p-4 rounded-lg">
                <p className="mb-4">
                  View or download the candidate&apos;s original resume
                  document:
                </p>
                <div className="flex space-x-4">
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 primary-button text-white rounded-md transition-colors"
                  >
                    <FiExternalLink className="mr-2" size={16} />
                    View Resume
                  </a>
                  <a
                    href={candidate.resume_url}
                    download
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <FiDownload className="mr-2" size={16} />
                    Download Resume
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md flex items-center">
                <FiAlertTriangle size={20} className="mr-2" />
                No resume document available.
              </div>
            )}
          </div>
        )}

        {/* Interview Tab */}
        {activeTab === "interview" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
              <FiCalendar className="mr-2" size={20} />
              Interview Status
            </h2>

            {loadingInterview ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {candidate.interview_status ? (
                  <div>
                    {candidate.interview_status === "invited" && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <FiAlertCircle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium text-yellow-800">
                              Interview Invitation Sent
                            </h3>
                            <p className="mt-2 text-sm text-yellow-700">
                              An interview invitation has been sent to this
                              candidate. Waiting for them to select a time slot.
                            </p>
                            {interviewData && (
                              <p className="mt-1 text-xs text-yellow-600">
                                Invitation sent on{" "}
                                {new Date(
                                  interviewData.created_at,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {candidate.interview_status === "scheduled" && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <FiCheck className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium text-green-800">
                              Interview Scheduled
                            </h3>
                            <p className="mt-2 text-sm text-green-700">
                              The candidate has scheduled an interview.
                            </p>

                            {interviewData && interviewData.selected_date && (
                              <div className="mt-3 bg-white p-4 rounded-md border border-green-200">
                                <div className="flex items-center">
                                  <FiCalendar className="text-green-500 mr-2" />
                                  <span className="font-medium">Date:</span>
                                  <span className="ml-2">
                                    {interviewData.selected_date}
                                  </span>
                                </div>
                                <div className="flex items-center mt-2">
                                  <FiClock className="text-green-500 mr-2" />
                                  <span className="font-medium">Time:</span>
                                  <span className="ml-2">
                                    {interviewData.selected_time}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600">
                      No interview has been scheduled with this candidate yet.
                    </p>
                    {candidate.ai_ranking >= 8 && (
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

                            const { error: requestError } = await supabase
                              .from("interview_requests")
                              .insert([
                                {
                                  candidate_id: candidate.id,
                                  status: "pending",
                                  available_slots: availableSlots,
                                  email_sent: true,
                                  created_at: new Date(),
                                },
                              ]);

                            if (requestError) throw requestError;

                            // Update interview status
                            const { error: statusError } = await supabase
                              .from("candidate_profiles")
                              .update({
                                interview_status: "invited",
                              })
                              .eq("id", candidate.id);

                            if (statusError) throw statusError;

                            alert("Interview invitation sent to candidate!");

                            // Refresh data
                            window.location.reload();
                          } catch (err) {
                            console.error(
                              "Error sending interview invitation:",
                              err,
                            );
                            alert(
                              "There was an error sending the interview invitation. Please try again.",
                            );
                          }
                        }}
                        className="mt-4 inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiMail className="mr-2" />
                        Send Interview Invitation
                      </button>
                    )}
                  </div>
                )}

                {candidate.interview_status === "completed" && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">
                      Video Interview Recording
                    </h3>

                    {loadingRecording ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                    ) : interviewRecording ? (
                      <div>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                          <video
                            controls
                            className="w-full h-full"
                            src={interviewRecording.recording_url}
                          />
                        </div>

                        <div className="bg-white border border-gray-200 rounded-md p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Interview Transcript
                          </h4>
                          <div className="max-h-96 overflow-y-auto">
                            {interviewRecording.transcript.map(
                              (entry, index) => (
                                <div
                                  key={index}
                                  className={`mb-4 ${entry.type === "question" ? "pl-0" : "pl-6"}`}
                                >
                                  <p
                                    className={`text-sm font-medium ${
                                      entry.type === "question"
                                        ? "text-blue-800"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {entry.type === "question"
                                      ? "AI Interviewer:"
                                      : "Candidate:"}
                                  </p>
                                  <p className="text-sm mt-1">{entry.text}</p>
                                </div>
                              ),
                            )}{" "}
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Add Notes
                          </h4>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-md"
                            rows="4"
                            placeholder="Add your notes about this candidate's interview performance..."
                            onChange={(e) => {
                              // Save notes functionality would go here
                            }}
                          />
                          <button
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            onClick={() => {
                              // Save notes functionality
                            }}
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                        <p className="text-gray-600">
                          No interview recording found for this candidate.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {/* Available time slots section (only for invited candidates) */}
                {candidate.interview_status === "invited" && interviewData && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Available Time Slots
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      {interviewData.available_slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="mb-4">
                          <h4 className="font-medium text-gray-800">
                            {slot.date}
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {slot.slots.map((time, timeIndex) => (
                              <span
                                key={timeIndex}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* AI Assessment Tab */}
        {activeTab === "assessment" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
              <FiAward size={20} className="mr-2" />
              AI Skills Assessment
            </h2>

            {aiNotes ? (
              <div className="space-y-6 text-white bg-white/10">
                {/* Ranking explanation */}
                <div className="p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-2 flex items-center">
                    <FiTrendingUp size={16} className="mr-2" />
                    Overall Assessment
                  </h3>
                  <div className="flex items-center mb-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        candidate.ai_ranking >= 8
                          ? "bg-green-500"
                          : candidate.ai_ranking >= 6
                            ? "bg-blue-500"
                            : candidate.ai_ranking >= 4
                              ? "bg-yellow-500"
                              : "bg-red-500"
                      }`}
                    >
                      {candidate.ai_ranking?.toFixed(1) || "N/A"}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">
                        {candidate.ai_ranking >= 8
                          ? "Excellent Candidate"
                          : candidate.ai_ranking >= 6
                            ? "Strong Candidate"
                            : candidate.ai_ranking >= 4
                              ? "Average Candidate"
                              : "Below Average Candidate"}
                      </p>
                      <p className="text-sm text-gray-400">
                        Score: {candidate.ai_ranking?.toFixed(1)}/10
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300">{aiNotes.summary}</p>
                </div>

                {/* Verified Skills */}
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-300 mb-2 flex items-center">
                    <FiCheck size={16} className="mr-2" />
                    Verified Skills
                  </h3>
                  {aiNotes.verifiedSkills &&
                  Object.keys(aiNotes.verifiedSkills).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(aiNotes.verifiedSkills).map(
                        ([skill, confidence], index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="font-medium">{skill}</span>
                            <div className="flex items-center">
                              <div className="w-32 h-3 bg-gray-200 rounded-full mr-2">
                                <div
                                  className="h-3 bg-[#00ff9d] rounded-full"
                                  style={{ width: `${confidence * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-200">
                                {Math.round(confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No verified skills available
                    </p>
                  )}
                </div>

                {/* Skill Gaps */}
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-300 mb-2 flex items-center">
                    <FiAlertTriangle size={16} className="mr-2" />
                    Improvement Areas
                  </h3>
                  {aiNotes.skillGaps && aiNotes.skillGaps.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-gray-200">
                      {aiNotes.skillGaps.map((gap, index) => (
                        <li key={index}>{gap}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">
                      No improvement areas identified
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md flex items-center">
                <FiAlertTriangle size={20} className="mr-2" />
                AI assessment data not available.
              </div>
            )}
          </div>
        )}

        {/* Chat History Tab */}
        {activeTab === "chat" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
              <FiMessageCircle size={20} className="mr-2" />
              AI Interview Chat History
            </h2>

            {candidate.chat_sessions && candidate.chat_sessions.length > 0 ? (
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="space-y-3">
                  {candidate.chat_sessions[0].session_data.messages.map(
                    (message, index) => (
                      <div
                        key={index}
                        className={`max-w-3/4 p-3 rounded-lg ${
                          message.role === "user"
                            ? "ml-auto bg-green-100 text-blue-900"
                            : "mr-auto bg-white border border-gray-200 text-gray-700"
                        }`}
                      >
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          {message.role === "user" ? (
                            <>
                              <FiUser size={12} className="mr-1" />
                              Candidate
                            </>
                          ) : (
                            <>
                              <FiMessageCircle size={12} className="mr-1" />
                              AI Interviewer
                            </>
                          )}
                        </p>
                        <p>{message.content}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md flex items-center">
                <FiAlertTriangle size={20} className="mr-2" />
                Chat history not available.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback form */}
      <div className="p-6 bg-white/10 border-t ">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
          <FiMessageCircle size={20} className="mr-2" />
          Provide Feedback
        </h2>

        {feedbackSubmitted ? (
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
            <div className="flex items-center">
              <FiCheck className="text-green-500 mr-2" size={20} />
              Feedback submitted successfully!
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback}>
            <div className="mb-4">
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-gray-300 mb-1 flex items-center"
              >
                <FiStar size={16} className="mr-2" />
                Rating (1-5)
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <FiStar
                      size={24}
                      className={
                        star <= rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-300 mb-1 flex items-center"
              >
                <FiMessageCircle size={16} className="mr-2" />
                Feedback
              </label>
              <textarea
                id="feedback"
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide your assessment of this candidate..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" size={16} />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
