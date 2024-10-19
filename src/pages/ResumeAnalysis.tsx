import React, { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';

const ResumeAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement actual resume analysis logic
    setAnalysis("Your resume has been analyzed. Here are some suggestions...");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Resume Analysis</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-center justify-center w-full">
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">PDF, DOC, or DOCX (MAX. 5MB)</p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
          </label>
        </div>
        {file && (
          <div className="mt-4 flex items-center">
            <CheckCircle className="text-green-500 mr-2" />
            <span>{file.name} uploaded successfully</span>
          </div>
        )}
        <button type="submit" className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
          Analyze Resume
        </button>
      </form>
      {analysis && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis;