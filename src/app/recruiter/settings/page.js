"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FiSave, FiAlertCircle, FiUser, FiMail } from "react-icons/fi";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    company: "",
    position: "",
    notification_email: true,
    notification_app: true,
  });

  // Fetch user and profile data
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

        // Check if recruiter profile exists
        const { data: profile, error: profileError } = await supabase
          .from("recruiter_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        // If profile exists, set form data
        if (!profileError && profile) {
          setProfile(profile);
          setFormData({
            full_name: profile.full_name || "",
            company: profile.company || "",
            position: profile.position || "",
            notification_email: profile.notification_email !== false,
            notification_app: profile.notification_app !== false,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);

        if (error.message === "Not authenticated") {
          router.push("/login");
        }
      }
    }

    fetchData();
  }, [router]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Determine if we need to insert or update
      const isNew = !profile;

      const profileData = {
        user_id: user.id,
        full_name: formData.full_name,
        company: formData.company,
        position: formData.position,
        notification_email: formData.notification_email,
        notification_app: formData.notification_app,
        updated_at: new Date(),
      };

      let result;

      if (isNew) {
        // Insert new profile
        result = await supabase
          .from("recruiter_profiles")
          .insert([
            {
              ...profileData,
              created_at: new Date(),
            },
          ])
          .select()
          .single();
      } else {
        // Update existing profile
        result = await supabase
          .from("recruiter_profiles")
          .update(profileData)
          .eq("id", profile.id)
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) throw error;

      setProfile(data);
      setSuccess(true);

      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError(error.message);
    } finally {
      setSaving(false);
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-semibold primary">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your profile and notification preferences
        </p>
      </div>

      <div className="mt-6 px-4 sm:px-0">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <FiAlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
            <FiSave className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
            <span className="text-green-700">Settings saved successfully</span>
          </div>
        )}

        <div className="bg-white/10 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b bg-white/10">
            <h2 className="text-lg font-medium text-gray-200">
              Profile Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            {/* Account Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-200 mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm sm:text-sm text-gray-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border bg-gray-50 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Professional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border bg-gray-50 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Your position"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-3">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notification_email"
                      name="notification_email"
                      type="checkbox"
                      checked={formData.notification_email}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 h-4 w-4 text-white-300 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="notification_email"
                      className="font-medium text-gray-300"
                    >
                      Email notifications
                    </label>
                    <p className="text-gray-400">
                      Receive email notifications about new candidate matches
                      and updates
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="notification_app"
                      name="notification_app"
                      type="checkbox"
                      checked={formData.notification_app}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="notification_app"
                      className="font-medium text-gray-300"
                    >
                      In-app notifications
                    </label>
                    <p className="text-gray-400">
                      Receive notifications within the application
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
