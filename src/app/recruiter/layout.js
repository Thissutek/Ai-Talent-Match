'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase, signOut } from '@/lib/supabase/client';
import { FiUsers, FiHome, FiClipboard, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function RecruiterLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }
        
        // Verify user is a recruiter
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (userError || userData?.user_type !== 'recruiter') {
          router.push('/login');
          return;
        }
        
        setUser(user);
        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      }
    }
    
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/recruiter/dashboard', icon: FiHome },
    { name: 'Candidates', href: '/recruiter/candidates', icon: FiUsers },
    { name: 'My Reviews', href: '/recruiter/my-reviews', icon: FiClipboard },
    { name: 'Settings', href: '/recruiter/settings', icon: FiSettings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          {/* Sidebar backdrop */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}
          
          {/* Sidebar */}
          <div 
            className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white transform transition duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-gray-50">
              <span className="text-xl font-semibold text-gray-800">Talent Match AI</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-600 focus:outline-none"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 h-0 overflow-y-auto">
              <nav className="px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === item.href || (item.href !== '/recruiter/dashboard' && pathname.startsWith(item.href))
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon 
                      className={`mr-3 h-5 w-5 ${
                        pathname === item.href || (item.href !== '/recruiter/dashboard' && pathname.startsWith(item.href))
                          ? 'text-blue-500' 
                          : 'text-gray-500'
                      }`} 
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="px-3 py-4 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <FiLogOut className="mr-3 h-5 w-5 text-gray-500" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-50">
            <span className="text-xl font-semibold text-gray-800">Talent Match AI</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href || (item.href !== '/recruiter/dashboard' && pathname.startsWith(item.href))
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 ${
                      pathname === item.href || (item.href !== '/recruiter/dashboard' && pathname.startsWith(item.href))
                        ? 'text-blue-500' 
                        : 'text-gray-500'
                    }`} 
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.email}</p>
                  <p className="text-xs text-gray-500">Recruiter</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <FiLogOut className="mr-3 h-5 w-5 text-gray-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile top navigation */}
      <div className="lg:hidden flex items-center justify-between h-16 bg-white shadow px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none"
        >
          <FiMenu className="h-6 w-6" />
        </button>
        <div>
          <span className="font-semibold text-gray-800">Talent Match AI</span>
        </div>
        <div className="w-6"></div> {/* Spacer for layout balance */}
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col">
        <main className="flex-1">
          <div className="pt-2 pb-6 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}