"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, signOut } from "@/lib/supabase/client";
import { parseResume, extractTextFromPDF } from "@/lib/ai/resumeParser";
import {
  FiUpload,
  FiFile,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiLogOut,
  FiDownload,
  FiTrash2,
} from "react-icons/fi";

export default function CandidateResumePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeData, setResumeData] = useState(null);

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

          // If resume already exists, set the resume data
          if (profile.parsed_resume) {
            setResumeData(profile.parsed_resume);
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

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    // Check file type
    if (selectedFile && !selectedFile.type.includes("pdf")) {
      setError("Please upload a PDF file only");
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setFile(selectedFile);
  };

  // Handle resume upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Read the file as buffer
      const buffer = await file.arrayBuffer();

      // Extract text from PDF
      setUploadProgress(30);
      const extractedText = await extractTextFromPDF(buffer);

      // Parse resume using AI
      setUploadProgress(50);
      const parsedData = await parseResume(extractedText);

      // Upload file to storage
      setUploadProgress(70);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      // For MVP, generate a mock URL instead of actual upload
      const resumeUrl = `https://mockurl.com/resumes/${fileName}`;

      // Update candidate profile
      setUploadProgress(90);
      const { data, error: updateError } = await supabase
        .from("candidate_profiles")
        .update({
          resume_url: resumeUrl,
          parsed_resume: parsedData.parsedResume,
          skills: parsedData.extractedSkills,
          updated_at: new Date(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update state
      setProfile(data);
      setResumeData(parsedData.parsedResume);

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setFile(null);
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Upload failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  // Handle resume deletion
  const handleDeleteResume = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your resume? This will remove all parsed skills and data.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // Update profile to remove resume data
      const { error } = await supabase
        .from("candidate_profiles")
        .update({
          resume_url: null,
          parsed_resume: null,
          skills: [],
          updated_at: new Date(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Update state
      setProfile((prev) => ({
        ...prev,
        resume_url: null,
        parsed_resume: null,
        skills: [],
      }));
      setResumeData(null);

      setLoading(false);
    } catch (err) {
      console.error("Delete error:", err);
      setError(`Failed to delete resume: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/candidate/dashboard"
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FiArrowLeft className="mr-2" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <FiLogOut className="mr-2" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            Resume Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload, update, or delete your resume
          </p>
        </div>

        <div className="mt-6 px-4 sm:px-0">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Your Resume</h2>
            </div>

            <div className="px-6 py-5">
              {profile?.resume_url ? (
                <div>
                  <div className="flex items-center text-sm text-green-600 mb-4">
                    <FiCheckCircle className="mr-2" />
                    <span>Your resume has been uploaded and processed</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-3">
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-3 sm:mb-0 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiDownload className="mr-2" />
                      View Resume
                    </a>
                    <button
                      onClick={handleDeleteResume}
                      className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FiTrash2 className="mr-2" />
                      Delete Resume
                    </button>
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-base font-medium text-gray-900 mb-4">
                      Upload a new version
                    </h3>
                    <form onSubmit={handleUpload}>
                      <div className="mb-4">
                        <label
                          htmlFor="resume-upload"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Resume (PDF format, max 5MB)
                        </label>

                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF only (MAX. 5MB)
                              </p>
                            </div>
                            <input
                              id="resume-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf"
                              onChange={handleFileChange}
                              disabled={isUploading}
                            />
                          </label>
                        </div>

                        {file && (
                          <p className="mt-2 text-sm text-gray-600 flex items-center">
                            <FiFile className="mr-2" size={16} />
                            Selected file: {file.name}
                          </p>
                        )}

                        {error && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <FiAlertCircle className="mr-2" size={16} />
                            {error}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={!file || isUploading}
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <span className="mr-2">Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </>
                        ) : (
                          <>
                            <FiUpload className="mr-2" />
                            Upload New Version
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center text-sm text-yellow-600 mb-4">
                    <FiAlertCircle className="mr-2" />
                    <span>You haven&apos;t uploaded a resume yet</span>
                  </div>

                  <form onSubmit={handleUpload}>
                    <div className="mb-4">
                      <label
                        htmlFor="resume-upload"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Resume (PDF format, max 5MB)
                      </label>

                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF only (MAX. 5MB)
                            </p>
                          </div>
                          <input
                            id="resume-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileChange}
                            disabled={isUploading}
                          />
                        </label>
                      </div>

                      {file && (
                        <p className="mt-2 text-sm text-gray-600 flex items-center">
                          <FiFile className="mr-2" size={16} />
                          Selected file: {file.name}
                        </p>
                      )}

                      {error && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <FiAlertCircle className="mr-2" size={16} />
                          {error}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!file || isUploading}
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <span className="mr-2">Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </>
                      ) : (
                        <>
                          <FiUpload className="mr-2" />
                          Upload Resume
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Parsed Resume Data */}
          {resumeData && (
            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Parsed Resume Data
                </h2>
              </div>

              <div className="px-6 py-5">
                {/* Contact Information */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Contact Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium">
                          {resumeData.contactInfo?.name || "Not found"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium">
                          {resumeData.contactInfo?.email || "Not found"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium">
                          {resumeData.contactInfo?.phone || "Not found"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Extracted Skills
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {resumeData.skills && resumeData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No skills extracted
                      </p>
                    )}
                  </div>
                </div>

                {/* Work Experience */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Work Experience
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {resumeData.workExperience &&
                    resumeData.workExperience.length > 0 ? (
                      <div className="space-y-4">
                        {resumeData.workExperience.map((experience, index) => (
                          <div
                            key={index}
                            className="border-l-2 border-blue-500 pl-4"
                          >
                            <p className="text-sm font-medium">
                              {experience.position}
                            </p>
                            <p className="text-xs text-gray-600">
                              {experience.company}
                            </p>
                            <p className="text-xs text-gray-500">
                              {experience.duration}
                            </p>
                            {experience.responsibilities && (
                              <ul className="mt-2 text-xs text-gray-600 space-y-1 list-disc list-inside">
                                {Array.isArray(experience.responsibilities) ? (
                                  experience.responsibilities.map(
                                    (resp, idx) => <li key={idx}>{resp}</li>,
                                  )
                                ) : (
                                  <li>{experience.responsibilities}</li>
                                )}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No work experience extracted
                      </p>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Education
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {resumeData.education && resumeData.education.length > 0 ? (
                      <div className="space-y-4">
                        {resumeData.education.map((edu, index) => (
                          <div
                            key={index}
                            className="border-l-2 border-green-500 pl-4"
                          >
                            <p className="text-sm font-medium">
                              {edu.institution}
                            </p>
                            <p className="text-xs text-gray-600">
                              {edu.degree}
                            </p>
                            <p className="text-xs text-gray-500">
                              {edu.graduationYear}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No education history extracted
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

