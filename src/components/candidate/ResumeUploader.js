import { useState } from "react";
import { uploadResume } from "@/lib/supabase/client";
import { parseResume, extractTextFromPDF } from "@/lib/ai/resumeParser";
import { FiUpload, FiAlertCircle, FiCheckCircle, FiFile } from "react-icons/fi";

export default function ResumeUploader({ userId, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

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

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("Uploading resume...");
      setUploadProgress(10);

      // Read the file as buffer
      const buffer = await file.arrayBuffer();

      // Extract text from PDF
      setUploadStatus("Extracting text from PDF...");
      setUploadProgress(30);
      const extractedText = await extractTextFromPDF(buffer);

      // Parse resume using AI
      setUploadStatus("Analyzing resume with AI...");
      setUploadProgress(50);
      const parsedData = await parseResume(extractedText);

      // Upload file to Supabase storage
      setUploadStatus("Saving to database...");
      setUploadProgress(70);
      const resumeUrl = await uploadResume(userId, file);

      // Update progress
      setUploadProgress(90);

      // Complete the upload
      setUploadStatus("Upload complete!");
      setUploadProgress(100);

      // Call the callback with parsed data and resume URL
      if (onUploadComplete) {
        onUploadComplete({
          resumeUrl,
          parsedResume: parsedData,
        });
      }

      // Reset state after completion
      setTimeout(() => {
        setIsUploading(false);
        setFile(null);
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Upload failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Resume (PDF format, max 5MB)
          </label>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">PDF only (MAX. 5MB)</p>
              </div>
              <input
                id="resume"
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
        </div>

        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium primary-button primary-button:hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isUploading ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Processing...
            </>
          ) : (
            <>
              <FiUpload className="mr-2" size={16} />
              Upload Resume
            </>
          )}
        </button>
      </form>

      {isUploading && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2 flex items-center">
            {uploadProgress === 100 ? (
              <FiCheckCircle className="mr-2 text-green-500" size={16} />
            ) : null}
            {uploadStatus}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

