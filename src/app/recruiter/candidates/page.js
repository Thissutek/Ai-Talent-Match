'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, signOut } from '@/lib/supabase/client';
import { FiSearch, FiFilter, FiChevronDown, FiStar, FiUser, FiLogOut, FiChevronRight, FiArrowLeft } from 'react-icons/fi';

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minRanking, setMinRanking] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load candidates from Supabase
  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Not authenticated');
        }
        
        // Fetch candidates with their profiles
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidate_profiles')
          .select('*, users(email)')
          .order('ai_ranking', { ascending: false });
        
        if (candidatesError) throw candidatesError;

        // Extract all unique skills for filtering
        const allSkills = candidatesData
          .flatMap(candidate => candidate.skills || [])
          .filter((skill, index, self) => self.indexOf(skill) === index);
        
        setAvailableSkills(allSkills);
        setCandidates(candidatesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError(err.message);
        setLoading(false);
        
        // If not authenticated, redirect to login
        if (err.message === 'Not authenticated') {
          router.push('/login');
        }
      }
    }
    
    fetchCandidates();
  }, [router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Filter candidates based on search and filters
  const filteredCandidates = candidates.filter(candidate => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      (candidate.full_name && candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.skills && candidate.skills.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    // Filter by minimum ranking
    const matchesRanking = candidate.ai_ranking >= minRanking;
    
    // Filter by selected skills
    const matchesSkills = selectedSkills.length === 0 || 
      (candidate.skills && selectedSkills.every(skill => 
        candidate.skills.includes(skill)
      ));
    
    return matchesSearch && matchesRanking && matchesSkills;
  });

  // Toggle skill selection
  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setMinRanking(0);
    setSelectedSkills([]);
  };

  // Get color based on ranking
  const getRankingColor = (ranking) => {
    if (ranking >= 8) return 'bg-green-500';
    if (ranking >= 6) return 'bg-blue-500';
    if (ranking >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/recruiter/dashboard" className="flex items-center text-gray-700 hover:text-blue-600">
              <FiArrowLeft className="mr-2" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <FiLogOut className="mr-2" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">All Candidates</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and filter candidates based on skills and AI ranking
          </p>
        </div>

        <div className="mt-6 px-4 sm:px-0 flex flex-col md:flex-row gap-6">
          {/* Filters sidebar (mobile toggle) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md"
          >
            <FiFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filters sidebar */}
          <div className={`bg-white rounded-lg shadow-md p-4 w-full md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            
            {/* Search */}
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name or skill..."
                />
              </div>
            </div>
            
            {/* Minimum Ranking */}
            <div className="mb-4">
              <label htmlFor="minRanking" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Ranking: {minRanking}
              </label>
              <input
                type="range"
                id="minRanking"
                min="0"
                max="10"
                step="0.5"
                value={minRanking}
                onChange={(e) => setMinRanking(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
            
            {/* Skills */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <div className="max-h-48 overflow-y-auto pr-2">
                <div className="space-y-1">
                  {availableSkills.map((skill) => (
                    <div key={skill} className="flex items-center">
                      <input
                        id={`skill-${skill}`}
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`skill-${skill}`}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="w-full py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Reset all filters
            </button>
          </div>

          {/* Candidates list */}
          <div className="flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading candidates...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="inline-block rounded-full p-3 bg-gray-100">
                  <FiUser className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">No candidates found</h3>
                <p className="mt-2 text-gray-600">
                  Try adjusting your filters or search terms
                </p>
                {(searchTerm || minRanking > 0 || selectedSkills.length > 0) && (
                  <button
                    onClick={resetFilters}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredCandidates.length} of {candidates.length} candidates
                </p>
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {candidate.full_name || 'Unnamed Candidate'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {candidate.users?.email || 'Email not available'}
                          </p>
                          
                          {/* Skills */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {candidate.skills && candidate.skills.slice(0, 5).map((skill, idx) => (
                              <span 
                                key={idx} 
                                className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills && candidate.skills.length > 5 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                                +{candidate.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Ranking indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            getRankingColor(candidate.ai_ranking)
                          }`}>
                            {candidate.ai_ranking?.toFixed(1) || 'N/A'}
                          </div>
                          <span className="text-xs text-gray-500 mt-1">AI Rating</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* View profile button */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                      <Link 
                        href={`/recruiter/candidates/${candidate.id}`}
                        className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
                      >
                        View Profile
                        <FiChevronRight className="ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}