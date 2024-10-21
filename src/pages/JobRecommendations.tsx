import React, { useState } from 'react';
import axios from 'axios';
import { getAuthToken } from '../context/AuthContext';

interface Job {
  id: string;
  name: string;
  position: string;
  description: string;
  requirements: string;
  similarity_score: number;
}

const JobRecommendations: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendedJobs([]);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('action', 'recommend_jobs');

    try {
      const token = getAuthToken();
      const response = await axios.post('http://localhost:5000/api/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setRecommendedJobs(response.data.recommended_jobs);
    } catch (error) {
      console.error('Error recommending jobs:', error);
      setError('An error occurred while recommending jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Recommendations</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
            Upload your resume (PDF)
          </label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? 'Analyzing...' : 'Get Job Recommendations'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {recommendedJobs.length > 0 && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Recommended Jobs</h2>
          {recommendedJobs.map((job, index) => (
            <div key={job.id} className="mb-6 p-4 border rounded">
              <h3 className="text-xl font-semibold">{job.name} - {job.position}</h3>
              <h3 className="text-xl font-semibold">{index + 1}. {job.name} - {job.position}</h3>
              <p className="text-gray-600 mb-2">Similarity Score: {(job.similarity_score * 100).toFixed(2)}%</p>
              <h4 className="font-medium mb-1">Description:</h4>
              <p className="text-gray-700 mb-2">{job.description}</p>
              <h4 className="font-medium mb-1">Requirements:</h4>
              <p className="text-gray-700">{job.requirements}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;