'use client';

import Link from 'next/link';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <FiAlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mt-2 text-base text-gray-600">
            Sorry, the page you were looking for could not be found.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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