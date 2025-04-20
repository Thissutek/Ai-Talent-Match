'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, signOut } from '@/lib/supabase/client';
import ResumeUploader from '@/components/candidate/ResumeUploader';
import SkillsChat from '@/components/candidate/SkillsChat';
import { assessCandidateSkills, calculateCandidateRanking } from '@/lib/ai/skillChecker';
import { FiLogOut } from 'react-icons/fi';

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
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Not authenticated');
        }
        
        setUser(user);
        
        // Get candidate profile
        const { data: profile, error: profileError } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('user_id', user.id)
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
        console.error('Error fetching user data:', error);
        router.push('/login'); // Redirect to login if not authenticated
      }
    }
    
    fetchUserData();
  }, [router]);
  
  // Handle resume upload completion
  // Handle resume upload completion
const handleResumeUpload = async (data) => {
  try {
    const { resumeUrl, parsedResume } = data;
    
    console.log('Resume upload complete:', resumeUrl);
    console.log('Parsed resume data:', parsedResume);
    
    // Create profile data object
    const profileData = {
      user_id: user.id,
      resume_url: resumeUrl,
      parsed_resume: parsedResume.parsedResume,
      skills: parsedResume.extractedSkills,
      updated_at: new Date()
    };
    
    console.log('Updating profile with data:', profileData);
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    console.log('Existing profile check:', existingProfile, checkError);
    
    let result;
    
    if (!existingProfile) {
      // Insert new profile if it doesn't exist
      console.log('Creating new profile');
      result = await supabase
        .from('candidate_profiles')
        .insert([profileData])
        .select()
        .single();
    } else {
      // Update existing profile
      console.log('Updating existing profile');
      result = await supabase
        .from('candidate_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
    }
    
    const { data: updatedProfile, error } = result;
    
    console.log('Update result:', updatedProfile, error);
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    setProfile(updatedProfile);
    setResumeUploaded(true);
    setCurrentStep(2); // Move to skills chat
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to save resume data. Please try again.');
  }
};
  
  // Handle chat completion
  const handleChatComplete = async (chatHistory) => {
    try {
      // Assess candidate based on resume and chat
      const assessment = await assessCandidateSkills(profile.parsed_resume, chatHistory);
      
      // Calculate ranking
      const ranking = calculateCandidateRanking(assessment);
      
      // Update candidate profile with assessment results
      const { data: updatedProfile, error } = await supabase
        .from('candidate_profiles')
        .update({
          ai_ranking: ranking,
          ai_notes: JSON.stringify(assessment),
          updated_at: new Date()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProfile(updatedProfile);
      setChatCompleted(true);
      setCurrentStep(3); // Move to completion step
    } catch (error) {
      console.error('Error updating assessment:', error);
      alert('Failed to save assessment data. Please try again.');
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
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
        <button
          onClick={handleSignOut}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FiLogOut className="mr-2" size={16} />
          Sign Out
        </button>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-text">Upload Resume</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-text">Skills Assessment</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <div className="step-text">Complete</div>
          </div>
        </div>
      </div>
      
      {/* Step 1: Resume Upload */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload Your Resume</h2>
          <p className="mb-6 text-gray-600">
            Upload your resume to begin the assessment process. Our AI will analyze your resume
            to extract your skills and experience.
          </p>
          <ResumeUploader userId={user.id} onUploadComplete={handleResumeUpload} />
        </div>
      )}
      
      {/* Step 2: Skills Chat */}
      {currentStep === 2 && resumeUploaded && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Step 2: Skills Assessment Chat</h2>
          <p className="mb-6 text-gray-600">
            Chat with our AI assistant to verify your skills and experience. This helps us provide 
            a more accurate assessment to potential employers.
          </p>
          <SkillsChat 
            candidateId={profile.id}
            parsedResume={{
              parsedResume: profile.parsed_resume,
              extractedSkills: profile.skills
            }} 
            onChatComplete={handleChatComplete} 
          />
        </div>
      )}
      
      {/* Step 3: Completion */}
      {currentStep === 3 && resumeUploaded && chatCompleted && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Assessment Complete!</h2>
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
          <p className="text-center text-gray-600 mb-4">
            Your profile is complete and ready to be viewed by recruiters. We&apos;ll notify you when 
            a recruiter shows interest in your profile.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
            <ul className="list-disc list-inside text-blue-700">
              <li>Recruiters will be able to view your profile</li>
              <li>You&apos;ll receive notifications when your profile is viewed</li>
              <li>You can update your profile at any time</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Profile Summary (visible after resume upload) */}
      {resumeUploaded && profile && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Contact Information</h3>
              <p className="text-gray-600">
                {profile.parsed_resume?.contactInfo?.name || 'Name not found'}
              </p>
              <p className="text-gray-600">
                {profile.parsed_resume?.contactInfo?.email || user.email}
              </p>
              <p className="text-gray-600">
                {profile.parsed_resume?.contactInfo?.phone || 'Phone not found'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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