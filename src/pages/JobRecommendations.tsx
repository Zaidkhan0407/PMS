import React, { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
}

const JobRecommendations: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // TODO: Implement actual job recommendation logic
    const mockJobs: Job[] = [
      { id: 1, title: "Software Engineer", company: "TechCorp", location: "San Francisco, CA", description: "Exciting opportunity for a skilled software engineer..." },
      { id: 2, title: "Data Scientist", company: "DataInc", location: "New York, NY", description: "Join our team of data scientists and work on cutting-edge projects..." },
      { id: 3, title: "UX Designer", company: "DesignHub", location: "Seattle, WA", description: "Create beautiful and intuitive user experiences for our products..." },
    ];
    setJobs(mockJobs);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Job Recommendations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Briefcase className="text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">{job.title}</h2>
            </div>
            <p className="text-gray-600 mb-2">{job.company}</p>
            <p className="text-gray-600 mb-4">{job.location}</p>
            <p className="text-sm text-gray-700 mb-4">{job.description}</p>
            <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobRecommendations;