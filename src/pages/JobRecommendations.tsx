import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../context/AuthContext';

interface Company {
  _id: string;
  name: string;
  position: string;
  description: string;
  requirements: string;
}

const JobRecommendations: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get('http://localhost:5000/api/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Recommendations</h1>
      {companies.length === 0 ? (
        <p>No job recommendations available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company._id} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">{company.name}</h2>
              <h3 className="text-lg font-medium mb-2">{company.position}</h3>
              <p className="text-gray-600 mb-4">{company.description}</p>
              <h4 className="font-medium mb-2">Requirements:</h4>
              <p className="text-gray-600">{company.requirements}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;