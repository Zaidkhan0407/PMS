import React, { useState } from 'react';
import { PlusCircle, Users, BarChart, Briefcase } from 'lucide-react';

const TPODashboard: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement job posting logic
    console.log("Job posted:", { jobTitle, company, description });
    // Reset form
    setJobTitle('');
    setCompany('');
    setDescription('');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">TPO Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Post New Job</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              ></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              <PlusCircle className="inline-block mr-2" />
              Post Job
            </button>
          </form>
        </div>
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="flex justify-between">
              <div className="text-center">
                <Users className="inline-block text-blue-600 mb-2" size={32} />
                <p className="text-2xl font-bold">150</p>
                <p className="text-sm text-gray-600">Active Students</p>
              </div>
              <div className="text-center">
                <Briefcase className="inline-block text-green-600 mb-2" size={32} />
                <p className="text-2xl font-bold">25</p>
                <p className="text-sm text-gray-600">Open Positions</p>
              </div>
              <div className="text-center">
                <BarChart className="inline-block text-purple-600 mb-2" size={32} />
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-gray-600">Placement Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            <ul className="space-y-2">
              <li>New job posted: Software Engineer at TechCorp</li>
              <li>5 students completed resume analysis</li>
              <li>Interview scheduled: Jane Doe with DataInc</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TPODashboard;