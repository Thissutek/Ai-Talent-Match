import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { scheduleInterview } from "@/lib/email/interviewScheduler";
import { FiCalendar, FiClock, FiCheck } from "react-icons/fi";

export default function InterviewScheduler({ candidateId }) {
  const [loading, setLoading] = useState(true);
  const [interviewRequest, setInterviewRequest] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch interview request data
  useEffect(() => {
    async function fetchInterviewRequest() {
      try {
        const { data, error } = await supabase
          .from("interview_requests")
          .select("*")
          .eq("candidate_id", candidateId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        setInterviewRequest(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching interview request:", error);
        setError(error.message);
        setLoading(false);
      }
    }

    if (candidateId) {
      fetchInterviewRequest();
    }
  }, [candidateId]);

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      setError("Please select both a date and time");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await scheduleInterview(interviewRequest.id, selectedDate, selectedTime);

      setSuccess(true);
      setSubmitting(false);
    } catch (err) {
      console.error("Error scheduling interview:", err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!interviewRequest) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No interview requests found
      </div>
    );
  }

  if (interviewRequest.status === "scheduled" || success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FiCheck className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Interview Scheduled!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Your interview is scheduled for {interviewRequest.selected_date}{" "}
                at {interviewRequest.selected_time}.
              </p>
              <p className="mt-1">
                Please prepare for your interview and make sure to join on time.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
      <h3 className="text-lg font-medium text-black-900 mb-4">
        Schedule Your Interview
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Date Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black-800 mb-2">
            <FiCalendar className="inline mr-2" />
            Select a Date
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {interviewRequest.available_slots.map((slot) => (
              <button
                key={slot.date}
                type="button"
                onClick={() => handleDateSelect(slot.date)}
                className={`p-2 border rounded-md text-sm focus:outline-none ${
                  selectedDate === slot.date
                    ? "primary-button primary-button:hover"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {slot.date}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection (only show if date is selected) */}
        {selectedDate && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black-800 mb-2">
              <FiClock className="inline mr-2 text-black" />
              Select a Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {interviewRequest.available_slots
                .find((slot) => slot.date === selectedDate)
                ?.slots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`p-2 border rounded-md text-sm focus:outline-none ${
                      selectedTime === time
                        ? "border-blue-500 primary-button primary-button:hover"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {time}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-4">
          <button
            type="submit"
            disabled={!selectedDate || !selectedTime || submitting}
            className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:text-gray-300"
          >
            {submitting ? "Scheduling..." : "Schedule Interview"}
          </button>
        </div>
      </form>
    </div>
  );
}
