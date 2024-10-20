import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-indigo-600">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              AI Placement Management
            </Link>
            <div className="hidden ml-10 space-x-8 lg:block">
              {user && user.role === 'student' && (
                <>
                  <Link to="/resume-analysis" className="text-base font-medium text-white hover:text-indigo-50">
                    Resume Analysis
                  </Link>
                  <Link to="/interview-prep" className="text-base font-medium text-white hover:text-indigo-50">
                    Interview Prep
                  </Link>
                  <Link to="/job-recommendations" className="text-base font-medium text-white hover:text-indigo-50">
                    Job Recommendations
                  </Link>
                </>
              )}
              {user && user.role === 'tpo' && (
                <Link to="/tpo-dashboard" className="text-base font-medium text-white hover:text-indigo-50">
                  TPO Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="ml-10 space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white">{user.email}</span>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
                >
                  <User className="mr-2 h-5 w-5" />
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;