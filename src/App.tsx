// @ts-ignore: React is implicitly used by JSX
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ResumeAnalysis from './pages/ResumeAnalysis';
import InterviewPrep from './pages/InterviewPrep';
import JobRecommendations from './pages/JobRecommendations';
import TPODashboard from './pages/TPODashboard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume-analysis" element={<ResumeAnalysis />} />
            <Route path="/interview-prep" element={<InterviewPrep />} />
            <Route path="/job-recommendations" element={<JobRecommendations />} />
            <Route path="/tpo-dashboard" element={<TPODashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;