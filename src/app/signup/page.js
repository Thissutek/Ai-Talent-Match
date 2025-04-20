'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/supabase/client';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiUser,
  FiBriefcase, FiAlertCircle, FiUserPlus
} from 'react-icons/fi';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('candidate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');

    try {
      setIsLoading(true);
      setError(null);
      await signUp(email, password, userType);
      router.push('/login?success=true');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-10 box-border">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-8 md:p-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-blue-100 text-blue-600 rounded-xl p-3">
            <FiUserPlus className="w-6 h-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-800">Create Your Account</h1>
          <p className="text-sm text-gray-500 mt-1">Start your journey with us</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center bg-red-100 text-red-700 text-sm p-3 rounded-md">
            <FiAlertCircle className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I want to</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'candidate', label: 'Find Jobs', Icon: FiUser },
                { value: 'recruiter', label: 'Hire Talent', Icon: FiBriefcase }
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUserType(value)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all ${
                    userType === value
                      ? 'bg-blue-100 text-blue-700 border-blue-400'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2.5 rounded-lg font-medium flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" />
                </svg>
              ) : null}
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>

        <p className="mt-3 text-center text-xs text-gray-400">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline text-blue-500 hover:text-blue-600">Terms</Link> and{' '}
          <Link href="/privacy" className="underline text-blue-500 hover:text-blue-600">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
