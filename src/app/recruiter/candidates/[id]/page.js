'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import CandidateDetails from '@/components/recruiter/CandidateDetails';
import { FiArrowLeft } from 'react-icons/fi';

export default function CandidateDetailPage({ params }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get candidate ID from URL params
  const candidateId = params.id;

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Not authenticated');
        }
        
        // Verify user is a recruiter
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          throw new Error('Failed to fetch user profile');
        }
        
        if (userData.user_type !== 'recruiter') {
          throw new Error('Unauthorized access');
        }
        
        setUser(user);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
        setLoading(false);
        
        // Redirect to login if not authenticated
        if (error.message === 'Not authenticated') {
          router.push('/login');
        }
        
        // Redirect to dashboard if unauthorized
        if (error.message === 'Unauthorized access') {
          router.push('/recruiter/dashboard');
        }
      }
    }
    
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="w-5 h-5 mr-1" />
          Back to Candidates
        </button>
      </div>
      
      <CandidateDetails candidateId={candidateId} recruiterId={user.id} />
    </div>
  );
}