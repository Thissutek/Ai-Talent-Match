import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCandidates } from "@/lib/supabase/client";
import { FiSearch, FiFilter, FiChevronDown, FiLoader } from "react-icons/fi";

export default function CandidateList() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    minRanking: 0,
    searchTerm: "",
    skills: [],
  });
  const limit = 10;

  // Fetch candidates
  useEffect(() => {
    fetchCandidates();
  }, [page, filters]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const offset = page * limit;
      const data = await getCandidates(limit, offset);

      // Apply client-side filtering
      let filteredData = data;

      // Filter by minimum ranking
      if (filters.minRanking > 0) {
        filteredData = filteredData.filter(
          (candidate) => candidate.ai_ranking >= filters.minRanking,
        );
      }

      // Filter by search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter((candidate) => {
          const fullName = candidate.full_name?.toLowerCase() || "";
          const skills = candidate.skills || [];
          const skillsMatch = skills.some((skill) =>
            skill.toLowerCase().includes(searchLower),
          );

          return fullName.includes(searchLower) || skillsMatch;
        });
      }

      // Filter by selected skills
      if (filters.skills.length > 0) {
        filteredData = filteredData.filter((candidate) => {
          const candidateSkills = candidate.skills || [];
          return filters.skills.every((skill) =>
            candidateSkills.some(
              (candidateSkill) =>
                candidateSkill.toLowerCase() === skill.toLowerCase(),
            ),
          );
        });
      }

      setCandidates((prev) =>
        page === 0 ? filteredData : [...prev, ...filteredData],
      );
      setHasMore(data.length === limit);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to load candidates. Please try again.");
      setLoading(false);
    }
  };

  const handleViewCandidate = (id) => {
    router.push(`/recruiter/candidates/${id}`);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleSkillToggle = (skill) => {
    setFilters((prev) => {
      const skills = [...prev.skills];
      const index = skills.findIndex(
        (s) => s.toLowerCase() === skill.toLowerCase(),
      );

      if (index >= 0) {
        skills.splice(index, 1); // Remove skill
      } else {
        skills.push(skill); // Add skill
      }

      return { ...prev, skills };
    });
  };

  // Get unique skills from all candidates
  const allSkills = [
    ...new Set(candidates.flatMap((candidate) => candidate.skills || [])),
  ];

  return (
    <div className="bg-white/10 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl text-white font-bold mb-6">Candidate Search</h2>

      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div>
          <label
            htmlFor="searchTerm"
            className="block text-sm font-medium text-white mb-1"
          >
            Search by name or skill
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-white" size={18} />
            </div>
            <input
              type="text"
              id="searchTerm"
              value={filters.searchTerm}
              onChange={(e) =>
                handleFilterChange({ ...filters, searchTerm: e.target.value })
              }
              placeholder="Search candidates..."
              className="w-full pl-10 px-4 py-2 border border-gray-200 text-white rounded-md focus:ring-[#00ff9d] focus:border-[#00ff9d]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="minRanking"
            className="block text-sm font-medium text-white mb-1"
          >
            Minimum Ranking: {filters.minRanking}
          </label>
          <input
            type="range"
            id="minRanking"
            min="0"
            max="10"
            step="0.5"
            value={filters.minRanking}
            onChange={(e) =>
              handleFilterChange({
                ...filters,
                minRanking: parseFloat(e.target.value),
              })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-1">
            <FiFilter className="mr-2 text-white" size={16} />
            <p className="block text-sm font-medium text-white">
              Filter by skills
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {allSkills.slice(0, 15).map((skill, index) => (
              <button
                key={index}
                onClick={() => handleSkillToggle(skill)}
                className={`px-3 py-1 text-sm rounded-full ${
                  filters.skills.some(
                    (s) => s.toLowerCase() === skill.toLowerCase(),
                  )
                    ? "bg-green-500 text-black"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Candidate list */}
      <div className="space-y-4">
        {candidates.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            No candidates found matching your filters.
          </div>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewCandidate(candidate.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {candidate.full_name || "Unknown Name"}
                  </h3>
                  <p className="text-white/50 text-sm">
                    {candidate.users?.email || "Email not available"}
                  </p>

                  {/* Skills */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {candidate.skills &&
                      candidate.skills.slice(0, 5).map((skill, idx) => (
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
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      candidate.ai_ranking >= 8
                        ? "bg-green-500"
                        : candidate.ai_ranking >= 6
                          ? "bg-blue-500"
                          : candidate.ai_ranking >= 4
                            ? "bg-yellow-500"
                            : "bg-red-500"
                    }`}
                  >
                    {candidate.ai_ranking?.toFixed(1) || "N/A"}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Ranking</span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <FiLoader
              className="animate-spin mx-auto mb-2 text-blue-500"
              size={24}
            />
            <p className="text-gray-500">Loading candidates...</p>
          </div>
        )}

        {/* Load more button */}
        {!loading && hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={handleLoadMore}
              className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors mx-auto"
            >
              <FiChevronDown className="mr-2" size={16} />
              Load More Candidates
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
