import { supabase } from "@/lib/supabase/client";

// Available time slots (in a real app, these would come from a calendar API)
const AVAILABLE_TIME_SLOTS = [
  { date: "2025-05-15", slots: ["10:00 AM", "1:00 PM", "3:30 PM"] },
  { date: "2025-05-16", slots: ["9:30 AM", "11:00 AM", "2:00 PM"] },
  { date: "2025-05-17", slots: ["10:30 AM", "1:30 PM", "4:00 PM"] },
];

/**
 * Send interview invitation email to high-scoring candidates
 */
export async function sendInterviewInvitation(
  candidateId,
  candidateEmail,
  candidateName,
) {
  try {
    console.log(`Sending interview invitation to ${candidateEmail}`);

    // In a real application, this would use an email service like SendGrid
    // For the MVP, we'll simulate the email sending and just record it in the database

    // Create an interview request record
    const { data, error } = await supabase
      .from("interview_requests")
      .insert([
        {
          candidate_id: candidateId,
          status: "pending",
          available_slots: AVAILABLE_TIME_SLOTS,
          created_at: new Date(),
          email_sent: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update candidate status in the database
    await supabase
      .from("candidate_profiles")
      .update({
        interview_status: "invited",
        updated_at: new Date(),
      })
      .eq("id", candidateId);

    return data;
  } catch (error) {
    console.error("Error sending interview invitation:", error);
    throw error;
  }
}

/**
 * Get all available interview time slots
 */
export function getAvailableTimeSlots() {
  // In a real app, this would fetch from a calendar API
  return AVAILABLE_TIME_SLOTS;
}

/**
 * Record candidate's selected interview time
 */
export async function scheduleInterview(
  interviewRequestId,
  selectedDate,
  selectedTime,
) {
  try {
    // Update the interview request with the selected time
    const { data, error } = await supabase
      .from("interview_requests")
      .update({
        status: "scheduled",
        selected_date: selectedDate,
        selected_time: selectedTime,
        updated_at: new Date(),
      })
      .eq("id", interviewRequestId)
      .select()
      .single();

    if (error) throw error;

    // Update candidate status
    await supabase
      .from("candidate_profiles")
      .update({
        interview_status: "scheduled",
        updated_at: new Date(),
      })
      .eq("id", data.candidate_id);

    return data;
  } catch (error) {
    console.error("Error scheduling interview:", error);
    throw error;
  }
}
