import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Briefcase } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to AI Placement Management System</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/resume-analysis" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <FileText size={48} className="mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Resume Analysis</h2>
          <p>Get AI-powered insights and suggestions for your resume</p>
        </Link>
        <Link to="/interview-prep" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Users size={48} className="mx-auto mb-4 text-green-600" />
          <h2 className="text-xl font-semibold mb-2">Interview Preparation</h2>
          <p>Practice with AI-generated interview questions tailored to your profile</p>
        </Link>
        <Link to="/job-recommendations" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Briefcase size={48} className="mx-auto mb-4 text-purple-600" />
          <h2 className="text-xl font-semibold mb-2">Job Recommendations</h2>
          <p>Discover job opportunities matched to your skills and preferences</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;