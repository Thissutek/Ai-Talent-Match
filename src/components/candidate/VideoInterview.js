// src/components/candidate/VideoInterview.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  FiVideo,
  FiMic,
  FiPlay,
  FiPause,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import Webcam from "react-webcam";

export default function VideoInterview({ candidateId, interviewId }) {
  const [status, setStatus] = useState("setup"); // setup, ready, recording, processing, completed
  const [permissions, setPermissions] = useState({
    video: false,
    audio: false,
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);
  const [debugMessages, setDebugMessages] = useState([]);

  // Using refs
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Mock interview questions
  const questions = [
    "Tell me about yourself and your background in this field.",
    "What are your key strengths that make you a good fit for this role?",
    "Describe a challenging situation you faced at work and how you resolved it.",
    "How do you handle pressure and deadlines?",
    "Where do you see yourself professionally in 5 years?",
  ];

  // Add debug message function
  const addDebugMessage = (message) => {
    console.log(message);
    setDebugMessages((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // Handle webcam errors
  const handleWebcamError = useCallback((err) => {
    addDebugMessage(`Webcam error: ${err.message || "Unknown error"}`);
    setError(
      `Camera access error: ${err.message || "Unable to access your camera or microphone"}`,
    );
  }, []);

  // Handle successful webcam initialization
  const handleWebcamInit = useCallback(() => {
    addDebugMessage("Webcam initialized successfully");
    setPermissions({ video: true, audio: true });
    setStatus("ready");
  }, []);

  // Speak the current question using speech synthesis
  const speakQuestion = (question) => {
    try {
      addDebugMessage(`Speaking question: ${question}`);
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9; // Slightly slower rate for clarity
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);

      // Add the question to the transcript
      setTranscript((prev) => [
        ...prev,
        {
          type: "question",
          text: question,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      addDebugMessage(`Error speaking question: ${err.message}`);
      setError(`Failed to speak the question: ${err.message}`);
    }
  };

  // Start the interview
  const startInterview = useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.stream) {
      addDebugMessage("Cannot start interview: No media stream");
      setError(
        "Media stream not available. Please refresh the page and try again.",
      );
      return;
    }

    addDebugMessage("Starting interview");
    setStatus("recording");
    startRecording();

    // Start with the first question
    speakQuestion(questions[0]);
  }, []);

  // Handle moving to the next question
  const handleNextQuestion = () => {
    const nextIndex = currentQuestion + 1;

    if (nextIndex < questions.length) {
      addDebugMessage(
        `Moving to question ${nextIndex + 1} of ${questions.length}`,
      );
      setCurrentQuestion(nextIndex);
      speakQuestion(questions[nextIndex]);
    } else {
      // End of interview
      addDebugMessage("All questions completed, ending interview");
      stopRecording();
      setStatus("completed");
    }
  };

  // Set up speech recognition to transcribe candidate responses
  const setupSpeechRecognition = useCallback(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      addDebugMessage("Setting up speech recognition");
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;

      let finalTranscript = "";

      recognition.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // When we get final transcript for an answer, add it
        if (finalTranscript) {
          addDebugMessage(`Transcript: ${finalTranscript}`);
          setTranscript((prev) => [
            ...prev,
            {
              type: "answer",
              text: finalTranscript,
              timestamp: new Date().toISOString(),
            },
          ]);

          finalTranscript = "";
        }
      };

      recognition.onend = () => {
        // Restart recognition as long as we're still recording
        if (recording) {
          recognition.start();
        }
      };

      recognition.onerror = (event) => {
        addDebugMessage(`Speech recognition error: ${event.error}`);
      };

      try {
        recognition.start();
        addDebugMessage("Speech recognition started");

        // Store the recognition instance
        window.speechRecognition = recognition;
      } catch (err) {
        addDebugMessage(`Error starting speech recognition: ${err.message}`);
      }
    } else {
      addDebugMessage("Speech Recognition not supported in this browser");
    }
  }, [recording]);

  // Start recording audio and video
  const startRecording = useCallback(() => {
    chunksRef.current = [];

    if (webcamRef.current && webcamRef.current.stream) {
      try {
        addDebugMessage("Starting media recording");
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = handleRecordingStop;

        mediaRecorderRef.current.start(1000); // Collect data every second
        setRecording(true);

        // Set up speech recognition for the candidate's answers
        setupSpeechRecognition();
      } catch (err) {
        addDebugMessage(`Error starting recorder: ${err.message}`);
        setError(`Failed to start recording: ${err.message}`);
      }
    } else {
      addDebugMessage("Cannot record: No media stream available");
      setError("Cannot start recording: No camera/microphone stream available");
    }
  }, [setupSpeechRecognition]);

  // Stop recording
  const stopRecording = useCallback(() => {
    addDebugMessage("Stopping recording");
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      addDebugMessage("Media recorder stopped");
    }

    // Stop speech recognition
    if (window.speechRecognition) {
      window.speechRecognition.stop();
      addDebugMessage("Speech recognition stopped");
    }
  }, []);

  // Handle the recording being stopped
  const handleRecordingStop = async () => {
    addDebugMessage("Recording stopped, processing data");
    setStatus("processing");

    try {
      // Create a blob from the recorded chunks
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      addDebugMessage(`Created blob of size: ${blob.size} bytes`);

      // Upload the recording to Supabase Storage
      const fileName = `interview_${candidateId}_${Date.now()}.webm`;
      addDebugMessage(`Uploading recording as ${fileName}`);

      const { data, error } = await supabase.storage
        .from("interview-recordings")
        .upload(fileName, blob);

      if (error) {
        addDebugMessage(`Error uploading to storage: ${error.message}`);
        throw error;
      }

      addDebugMessage("Upload successful, getting public URL");

      // Get the public URL for the uploaded video
      const { data: urlData } = supabase.storage
        .from("interview-recordings")
        .getPublicUrl(fileName);

      // Save interview data to the database
      addDebugMessage("Saving interview data to database");
      const { error: saveError } = await supabase
        .from("interview_recordings")
        .insert([
          {
            interview_request_id: interviewId,
            candidate_id: candidateId,
            recording_url: urlData.publicUrl,
            transcript: transcript,
            completed_at: new Date(),
          },
        ]);

      if (saveError) {
        addDebugMessage(`Error saving to database: ${saveError.message}`);
        throw saveError;
      }

      // Update the candidate profile to indicate the interview is completed
      addDebugMessage("Updating candidate profile status");
      const { error: updateError } = await supabase
        .from("candidate_profiles")
        .update({
          interview_status: "completed",
          interview_completed_at: new Date(),
        })
        .eq("id", candidateId);

      if (updateError) {
        addDebugMessage(`Error updating profile: ${updateError.message}`);
        throw updateError;
      }

      addDebugMessage("Interview successfully completed and saved");
      setStatus("completed");
    } catch (err) {
      console.error("Error saving interview recording:", err);
      addDebugMessage(`Error processing recording: ${err.message}`);
      setError(`Failed to save the interview: ${err.message}`);
      setStatus("ready");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiVideo className="mr-2 text-green-600" />
        AI Video Interview
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Video preview */}
      <div className="mb-6">
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
          {status === "setup" ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <FiVideo className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 mb-4">
                  Camera access required for the interview
                </p>
                <button
                  onClick={() => setStatus("connecting")}
                  className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiVideo className="mr-2" /> Enable Camera & Microphone
                </button>
              </div>
            </div>
          ) : (
            <Webcam
              ref={webcamRef}
              audio={true}
              muted={true}
              onUserMedia={handleWebcamInit}
              onUserMediaError={handleWebcamError}
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "user",
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </div>
      </div>

      {/* Debug information */}
      <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded overflow-auto max-h-40 text-xs">
        <h3 className="font-bold mb-1">Debug Info:</h3>
        <ul>
          {debugMessages.map((msg, i) => (
            <li key={i} className="text-gray-700">
              {msg}
            </li>
          ))}
        </ul>
      </div>

      {/* Permissions status */}
      {status === "ready" && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <FiCheck className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">Camera and microphone are ready.</p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              During this interview, the AI will ask you {questions.length}{" "}
              questions. Please answer each question naturally, as you would in
              a real interview.
            </p>
            <button
              onClick={startInterview}
              className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlay className="mr-2" /> Start Interview
            </button>
          </div>
        </div>
      )}

      {/* Interview in progress */}
      {status === "recording" && (
        <div className="mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
            <h3 className="font-medium text-blue-800 mb-2">
              Question {currentQuestion + 1} of {questions.length}
            </h3>
            <p className="text-blue-700">{questions[currentQuestion]}</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleNextQuestion}
              className="flex-1 flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next Question
            </button>

            <button
              onClick={stopRecording}
              className="flex-1 flex justify-center items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              End Interview
            </button>
          </div>
        </div>
      )}

      {/* Processing state */}
      {status === "processing" && (
        <div className="flex justify-center p-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">
              Processing your interview recording...
            </p>
          </div>
        </div>
      )}

      {/* Completed state */}
      {status === "completed" && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-md text-center">
          <FiCheck className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Interview Completed!
          </h3>
          <p className="text-green-700 mb-4">
            Your video interview has been recorded and submitted for review.
          </p>
          <p className="text-sm text-gray-600">
            The recruiter will be notified and will review your interview
            responses.
          </p>
        </div>
      )}

      {/* Interview transcript - only show in completed state */}
      {status === "completed" && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Interview Transcript</h3>
          <div className="border border-gray-200 rounded-md p-4 max-h-96 overflow-y-auto">
            {transcript.map((entry, index) => (
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
                  {entry.type === "question" ? "AI Interviewer:" : "You:"}
                </p>
                <p className="text-sm mt-1">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
