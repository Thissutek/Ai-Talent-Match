"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, signOut } from "@/lib/supabase/client";
import {
  FiEdit,
  FiUser,
  FiMail,
  FiPhone,
  FiAward,
  FiLogOut,
  FiArrowLeft,
} from "react-icons/fi";

export default function CandidateProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

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
          setFormData({
            full_name: profile.full_name || "",
            phone: profile.parsed_resume?.contactInfo?.phone || "",
          });
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      // Update parsed_resume with new contact info
      const updatedParsedResume = {
        ...profile.parsed_resume,
        contactInfo: {
          ...profile.parsed_resume?.contactInfo,
          name: formData.full_name,
          phone: formData.phone,
        },
      };

      // Update profile in database
      const { error } = await supabase
        .from("candidate_profiles")
        .update({
          full_name: formData.full_name,
          parsed_resume: updatedParsedResume,
          updated_at: new Date(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      // Update local state
      setProfile((prev) => ({
        ...prev,
        full_name: formData.full_name,
        parsed_resume: updatedParsedResume,
      }));

      // Exit edit mode
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
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
          <h1 className="text-2xl font-semibold text-gray-200">Your Profile</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage your personal information and view your profile
          </p>
        </div>
        <div className="mt-6 px-4 sm:px-0">
          <div className="bg-white/10 rounded-lg shadow-md overflow-hidden">
            {/* Profile header */}
            <div className="px-6 py-5 bg-white/10 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-200">
                Personal Information
              </h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center text-sm text-green-600 hover:text-green-500"
              >
                <FiEdit className="mr-1" />
                {editMode ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="px-6 py-5">
              {editMode ? (
                /* Edit Form */
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-gray-200"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-white rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-200"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm sm:text-sm text-gray-600"
                      />
                      <p className="mt-1 text-xs text-gray-300">
                        Email cannot be changed
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-200"
                      >
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border bg-white border-gray-300 py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Profile View */
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FiUser className="mt-0.5 mr-3 h-5 w-5 text-gray-200" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-200">
                        Full Name
                      </h3>
                      <p className="mt-1 text-sm text-gray-300">
                        {profile?.full_name || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiMail className="mt-0.5 mr-3 h-5 w-5 text-gray-200" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-200">
                        Email
                      </h3>
                      <p className="mt-1 text-sm text-gray-300">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiPhone className="mt-0.5 mr-3 h-5 w-5 text-gray-200" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-200">
                        Phone Number
                      </h3>
                      <p className="mt-1 text-sm text-gray-300">
                        {profile?.parsed_resume?.contactInfo?.phone ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resume and Skills Section */}
          {profile && (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Resume Section */}
              <div className="bg-white/10 rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-5 bg-white/10 ">
                  <h2 className="text-lg font-medium text-gray-200">Resume</h2>
                </div>
                <div className="px-6 py-5">
                  {profile.resume_url ? (
                    <div>
                      <p className="text-sm text-gray-300 mb-4">
                        Your resume has been uploaded and processed.
                      </p>
                      <div className="flex flex-col sm:flex-row sm:space-x-3">
                        <Link
                          href="/candidate/resume"
                          className="mb-2 sm:mb-0 inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md secondary-button secondary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Manage Resume
                        </Link>
                        <a
                          href={profile.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View Resume
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        You haven't uploaded a resume yet.
                      </p>
                      <Link
                        href="/candidate/resume"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Upload Resume
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-white/10 rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-5 bg-white/10 ">
                  <h2 className="text-lg font-medium text-gray-200">Skills</h2>
                </div>
                <div className="px-6 py-5">
                  {profile.skills && profile.skills.length > 0 ? (
                    <div>
                      <p className="text-sm text-gray-300 mb-4">
                        Skills extracted from your resume and verified through
                        chat.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            <FiAward className="mr-1 h-3 w-3" />
                            {skill}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/candidate/chat"
                          className="inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Verify More Skills
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        No skills have been verified yet. Upload a resume or
                        complete the skill assessment chat.
                      </p>
                      <Link
                        href="/candidate/chat"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Start Skill Assessment
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
