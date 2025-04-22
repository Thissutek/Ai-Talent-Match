'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiHome, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <FiAlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-base text-gray-600">
            We encountered an unexpected error. Please try again or return to the home page.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiRefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiHome className="h-5 w-5 mr-2" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}