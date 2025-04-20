import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Please check your .env.local file.');
}

// Create client with fallback values for development if env vars are missing
export const supabase = createClient(
  supabaseUrl || 'https://your-project-url.supabase.co',
  supabaseAnonKey || 'your-anon-key-here'
);

// Helper functions for common database operations

// User Authentication
export const signUp = async (email, password, userType) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Create user profile in users table
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email, user_type: userType }]);
      
      if (profileError) throw profileError;

      // For candidates, create an empty candidate profile
      if (userType === 'candidate') {
        const { error: candidateError } = await supabase
          .from('candidate_profiles')
          .insert([{ 
            user_id: data.user.id,
            full_name: '',
            skills: [],
            ai_ranking: 0
          }]);
        
        if (candidateError) throw candidateError;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Candidate Operations
export const uploadResume = async (userId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const updateCandidateProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .upsert([
        {
          user_id: userId,
          ...profileData,
          updated_at: new Date()
        }
      ]);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Recruiter Operations
export const getCandidates = async (limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select('*, users(email)')
      .range(offset, offset + limit - 1)
      .order('ai_ranking', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get candidates error:', error);
    throw error;
  }
};

export const getCandidateById = async (candidateId) => {
  try {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select('*, users(email), chat_sessions(*)')
      .eq('id', candidateId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get candidate error:', error);
    throw error;
  }
};

export const submitFeedback = async (recruiterId, candidateId, feedback, rating) => {
  try {
    const { data, error } = await supabase
      .from('recruiter_feedback')
      .insert([
        {
          recruiter_id: recruiterId,
          candidate_id: candidateId,
          feedback,
          rating
        }
      ]);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Submit feedback error:', error);
    throw error;
  }
};

// Chat Operations
// Chat Operations
export const saveChatSession = async (candidateId, sessionData) => {
  try {
    console.log('Saving chat session for candidate:', candidateId);
    console.log('Session data structure:', JSON.stringify(sessionData, null, 2));
    
    // Ensure candidateId is valid
    if (!candidateId) {
      throw new Error('Missing candidate ID');
    }
    
    // Ensure sessionData is valid and not too large
    if (!sessionData || typeof sessionData !== 'object') {
      throw new Error('Invalid session data format');
    }
    
    // Convert complex objects to strings to avoid JSON issues
    const sanitizedSessionData = JSON.parse(JSON.stringify(sessionData));
    
    console.log('Checking for existing chat session...');
    
    // Check if session exists
    const { data: existingSession, error: checkError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('candidate_id', candidateId)
      .single();
    
    console.log('Existing session check result:', existingSession, checkError);
    
    let result;
    
    if (!existingSession || checkError) {
      // Create new session if it doesn't exist
      console.log('Creating new chat session');
      
      const newSession = {
        candidate_id: candidateId,
        session_data: sanitizedSessionData,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      result = await supabase
        .from('chat_sessions')
        .insert([newSession]);
    } else {
      // Update existing session
      console.log('Updating existing chat session:', existingSession.id);
      
      const updateData = {
        session_data: sanitizedSessionData,
        updated_at: new Date()
      };
      
      result = await supabase
        .from('chat_sessions')
        .update(updateData)
        .eq('id', existingSession.id);
    }
    
    const { data, error } = result;
    
    console.log('Save chat session result:', data, error);
    
    if (error) {
      console.error('Supabase error when saving chat session:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Save chat session error:', error);
    
    // Instead of throwing the error, log it and return empty data
    // This prevents the app from crashing but still logs the issue
    return null;
  }
};