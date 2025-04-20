'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

// Import icons from react-icons
import { 
  FiUpload, 
  FiMessageSquare, 
  FiUsers, 
  FiCheckCircle, 
  FiArrowLeft, 
  FiArrowRight, 
  FiFile, 
  FiStar, 
  FiTrendingUp, 
  FiSearch, 
  FiClipboard, 
  FiSettings 
} from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // If user is logged in, redirect to appropriate dashboard
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', user.id)
            .single();

          if (userData) {
            if (userData.user_type === 'candidate') {
              router.push('/candidate/dashboard');
            } else if (userData.user_type === 'recruiter') {
              router.push('/recruiter/dashboard');
            }
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking user:', error);
        setLoading(false);
      }
    }

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                AI-Powered Talent Matching
              </h1>
              <p className="text-xl mb-8 max-w-md">
                Connect the right candidates with the right opportunities using AI-powered skill assessment and matching.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/signup"
                  className="bg-white text-blue-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="border border-white text-white font-medium py-3 px-6 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors text-center"
                >
                  Log In
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white rounded-lg shadow-xl p-4 md:p-8">
                <img
                  src="https://via.placeholder.com/600x400"
                  alt="AI Talent Matching Platform"
                  className="rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUpload size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Resume</h3>
              <p className="text-gray-600">
                Candidates upload their resume and our AI automatically extracts skills and experience.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageSquare size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Assessment</h3>
              <p className="text-gray-600">
                Our AI conducts a conversational assessment to verify skills and experience in depth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Recruiters receive ranked candidates based on skill verification and assessment results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Candidates & Recruiters Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Candidates */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-4">For Job Seekers</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" size={18} />
                  <span>Get your skills accurately assessed by AI</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" size={18} />
                  <span>Stand out to recruiters with verified skill badges</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" size={18} />
                  <span>Get matched with jobs that fit your actual abilities</span>
                </li>
              </ul>
              <Link
                href="/signup?type=candidate"
                className="inline-block bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Sign Up as Job Seeker
              </Link>
            </div>

            {/* For Recruiters */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-4">For Recruiters</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" size={18} />
                  <span>Access AI-verified candidates with proven skills</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" size={18} />
                  <span>Save time with intelligent candidate ranking</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" size={18} />
                  <span>Reduce hiring costs and improve match quality</span>
                </li>
              </ul>
              <Link
                href="/signup?type=recruiter"
                className="inline-block bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Sign Up as Recruiter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Talent Match AI</h2>
              <p className="text-gray-400">AI-powered talent matching platform</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="hover:text-blue-400 transition-colors">
                About
              </Link>
              <Link href="/contact" className="hover:text-blue-400 transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Talent Match AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}