import { useState, useEffect } from 'react';
import { getCandidateById, submitFeedback } from '@/lib/supabase/client';
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
  FiMessageCircle
} from 'react-icons/fi';

export default function CandidateDetails({ candidateId, recruiterId }) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'resume', 'assessment', 'chat'

  // Fetch candidate details
  useEffect(() => {
    async function fetchCandidate() {
      try {
        setLoading(true);
        const data = await getCandidateById(candidateId);
        setCandidate(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError('Failed to load candidate details. Please try again.');
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
      alert('Please enter feedback before submitting.');
      return;
    }
    
    try {
      setSubmitting(true);
      await submitFeedback(recruiterId, candidateId, feedback, rating);
      setFeedbackSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
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
    <div className="bg-white rounded-lg shadow-lg">
      {/* Candidate header with ranking */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{candidate.full_name || 'Unnamed Candidate'}</h1>
            <p className="text-gray-600 flex items-center">
              <FiMail size={16} className="mr-2" />
              {candidate.users?.email || 'Email not available'}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
              candidate.ai_ranking >= 8 ? 'bg-green-500' :
              candidate.ai_ranking >= 6 ? 'bg-blue-500' :
              candidate.ai_ranking >= 4 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {candidate.ai_ranking?.toFixed(1) || 'N/A'}
            </div>
            <span className="text-sm text-gray-500 mt-1">AI Ranking</span>
          </div>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiUser size={16} className="mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'resume'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiDownload size={16} className="mr-2" />
            Resume
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'assessment'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiAward size={16} className="mr-2" />
            AI Assessment
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'chat'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
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
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiUser size={20} className="mr-2" />
              Candidate Profile
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FiUser size={16} className="mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center"><span className="text-gray-500 mr-2">Name:</span> {candidate.full_name || 'Not provided'}</p>
                  <p className="flex items-center">
                    <FiMail size={14} className="text-gray-500 mr-2" />
                    <span className="text-gray-500 mr-2">Email:</span> {candidate.users?.email || 'Not provided'}
                  </p>
                  <p className="flex items-center">
                    <FiPhone size={14} className="text-gray-500 mr-2" />
                    <span className="text-gray-500 mr-2">Phone:</span> 
                    {candidate.parsed_resume?.contactInfo?.phone || 'Not provided'}
                  </p>
                </div>
              </div>
              
              {/* Skills */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FiAward size={16} className="mr-2" />
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FiBook size={16} className="mr-2" />
                  Education
                </h3>
                {candidate.parsed_resume?.education && candidate.parsed_resume.education.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.parsed_resume.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-blue-300 pl-3">
                        <p className="font-medium">{edu.institution || 'Unknown Institution'}</p>
                        <p className="text-sm text-gray-600">{edu.degree || 'Degree not specified'}</p>
                        <p className="text-sm text-gray-600">{edu.graduationYear || 'Year not specified'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No education history available</p>
                )}
              </div>
              
              {/* Work Experience */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FiBriefcase size={16} className="mr-2" />
                  Work Experience
                </h3>
                {candidate.parsed_resume?.workExperience && candidate.parsed_resume.workExperience.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.parsed_resume.workExperience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-green-300 pl-3">
                        <p className="font-medium">{exp.position || 'Position not specified'}</p>
                        <p className="text-sm text-gray-600">{exp.company || 'Company not specified'}</p>
                        <p className="text-sm text-gray-600">{exp.duration || 'Duration not specified'}</p>
                        {exp.responsibilities && (
                          <p className="text-sm text-gray-600 mt-1">
                            {typeof exp.responsibilities === 'string' 
                              ? exp.responsibilities
                              : exp.responsibilities.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No work experience available</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Resume Tab */}
        {activeTab === 'resume' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiDownload size={20} className="mr-2" />
              Resume Document
            </h2>
            
            {candidate.resume_url ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-4">View or download the candidate's original resume document:</p>
                <div className="flex space-x-4">
                  <a 
                    href={candidate.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
        
        {/* AI Assessment Tab */}
        {activeTab === 'assessment' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiAward size={20} className="mr-2" />
              AI Skills Assessment
            </h2>
            
            {aiNotes ? (
              <div className="space-y-6">
                {/* Ranking explanation */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                    <FiTrendingUp size={16} className="mr-2" />
                    Overall Assessment
                  </h3>
                  <div className="flex items-center mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      candidate.ai_ranking >= 8 ? 'bg-green-500' :
                      candidate.ai_ranking >= 6 ? 'bg-blue-500' :
                      candidate.ai_ranking >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {candidate.ai_ranking?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">
                        {candidate.ai_ranking >= 8 ? 'Excellent Candidate' :
                         candidate.ai_ranking >= 6 ? 'Strong Candidate' :
                         candidate.ai_ranking >= 4 ? 'Average Candidate' : 'Below Average Candidate'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Score: {candidate.ai_ranking?.toFixed(1)}/10
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{aiNotes.summary}</p>
                </div>
                
                {/* Verified Skills */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FiCheck size={16} className="mr-2" />
                    Verified Skills
                  </h3>
                  {aiNotes.verifiedSkills && Object.keys(aiNotes.verifiedSkills).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(aiNotes.verifiedSkills).map(([skill, confidence], index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{skill}</span>
                          <div className="flex items-center">
                            <div className="w-32 h-3 bg-gray-200 rounded-full mr-2">
                              <div 
                                className="h-3 bg-blue-600 rounded-full" 
                                style={{ width: `${confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round(confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No verified skills available</p>
                  )}
                </div>
                
                {/* Skill Gaps */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FiAlertTriangle size={16} className="mr-2" />
                    Improvement Areas
                  </h3>
                  {aiNotes.skillGaps && aiNotes.skillGaps.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {aiNotes.skillGaps.map((gap, index) => (
                        <li key={index}>{gap}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No improvement areas identified</p>
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
        {activeTab === 'chat' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiMessageCircle size={20} className="mr-2" />
              AI Interview Chat History
            </h2>
            
            {candidate.chat_sessions && candidate.chat_sessions.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  {candidate.chat_sessions[0].session_data.messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`max-w-3/4 p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'ml-auto bg-blue-100 text-blue-900' 
                          : 'mr-auto bg-white border border-gray-200 text-gray-700'
                      }`}
                    >
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        {message.role === 'user' ? (
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
                  ))}
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
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
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
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
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
                      className={star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiMessageCircle size={16} className="mr-2" />
                Feedback
              </label>
              <textarea
                id="feedback"
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide your assessment of this candidate..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 flex items-center justify-center"
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