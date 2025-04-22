'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { FiStar, FiUser, FiCalendar, FiFileText, FiChevronRight, FiFilter } from 'react-icons/fi';

export default function MyReviewsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  
  // Fetch user and reviews data
  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Not authenticated');
        }
        
        setUser(user);
        
        // Fetch reviews made by this recruiter
        const { data: reviews, error: reviewsError } = await supabase
          .from('recruiter_feedback')
          .select(`
            id,
            rating,
            feedback,
            created_at,
            candidate_profiles(id, full_name, resume_url, ai_ranking, skills)
          `)
          .eq('recruiter_id', user.id)
          .order('created_at', { ascending: false });
        
        if (reviewsError) throw reviewsError;
        
        setReviews(reviews);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
        
        if (error.message === 'Not authenticated') {
          router.push('/login');
        }
      }
    }
    
    fetchData();
  }, [router]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <h1 className="text-2xl font-semibold text-gray-900">My Reviews</h1>
        <p className="mt-1 text-sm text-gray-600">
          View all candidates you have reviewed
        </p>
      </div>

      <div className="mt-6 px-4 sm:px-0">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-block rounded-full p-3 bg-gray-100">
              <FiFileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-2 text-gray-600">
              You haven't reviewed any candidates yet
            </p>
            <div className="mt-4">
              <Link
                href="/recruiter/candidates"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Candidates
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Reviews</h2>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Total:</span>
                <span className="text-sm font-medium text-gray-900">{reviews.length}</span>
              </div>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <li key={review.id}>
                  <Link
                    href={`/recruiter/candidates/${review.candidate_profiles.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">
                              {review.candidate_profiles.full_name || 'Unnamed Candidate'}
                            </h3>
                            <div className="flex items-center mt-1">
                              {/* Rating stars */}
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              
                              {/* Date */}
                              <div className="ml-3 flex items-center text-xs text-gray-500">
                                <FiCalendar className="h-3 w-3 mr-1" />
                                <span>{formatDate(review.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Ranking */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                            review.candidate_profiles.ai_ranking >= 8 ? 'bg-green-500' :
                            review.candidate_profiles.ai_ranking >= 6 ? 'bg-blue-500' :
                            review.candidate_profiles.ai_ranking >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {review.candidate_profiles.ai_ranking?.toFixed(1) || 'N/A'}
                          </div>
                          <span className="text-xs text-gray-500 mt-1">AI Rating</span>
                        </div>
                      </div>
                      
                      {/* Review text */}
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 line-clamp-2">{review.feedback}</p>
                      </div>
                      
                      {/* Skills */}
                      {review.candidate_profiles.skills && review.candidate_profiles.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {review.candidate_profiles.skills.slice(0, 3).map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {review.candidate_profiles.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                              +{review.candidate_profiles.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* View details link */}
                      <div className="mt-2 flex items-center text-xs text-blue-600">
                        <span>View candidate details</span>
                        <FiChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}