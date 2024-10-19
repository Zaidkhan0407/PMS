import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Briefcase size={24} />
          <span className="text-xl font-bold">AI Placement Management</span>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/resume-analysis" className="hover:text-blue-200">Resume Analysis</Link></li>
            <li><Link to="/interview-prep" className="hover:text-blue-200">Interview Prep</Link></li>
            <li><Link to="/job-recommendations" className="hover:text-blue-200">Job Recommendations</Link></li>
            <li><Link to="/tpo-dashboard" className="hover:text-blue-200">TPO Dashboard</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;