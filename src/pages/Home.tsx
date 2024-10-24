import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, FileText, Users, Building } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">AI-Powered</span>
            <span className="block text-indigo-600">Placement Management System</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your placement process with advanced AI technology. Get personalized resume analysis, interview preparation, and job recommendations.
          </p>
        </div>

        {!user ? (
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-100 bg-indigo-800 hover:bg-indigo-900"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {user.role === 'student' ? (
              <>
                <Link
                  to="/resume-analysis"
                  className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <FileText className="h-12 w-12 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-semibold">Resume Analysis</h3>
                  <p className="text-gray-600 text-center mt-2">Get AI-powered feedback on your resume</p>
                </Link>
                <Link
                  to="/interview-prep"
                  className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <Users className="h-12 w-12 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-semibold">Interview Preparation</h3>
                  <p className="text-gray-600 text-center mt-2">Practice with AI-generated interview questions</p>
                </Link>
                <Link
                  to="/job-recommendations"
                  className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <Building className="h-12 w-12 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-semibold">Job Recommendations</h3>
                  <p className="text-gray-600 text-center mt-2">Get personalized job matches</p>
                </Link>
              </>
            ) : (
              <Link
                to="/tpo-dashboard"
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <GraduationCap className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-lg font-semibold">TPO Dashboard</h3>
                <p className="text-gray-600 text-center mt-2">Manage job listings and placements</p>
              </Link>
            )}
          </div>
        )}

        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Resume Analysis</h3>
              <p className="text-gray-600">Get detailed feedback and suggestions to improve your resume</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interview Mastery</h3>
              <p className="text-gray-600">Practice with AI-generated questions tailored to your profile</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Job Matching</h3>
              <p className="text-gray-600">Find the perfect job opportunities based on your skills</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;