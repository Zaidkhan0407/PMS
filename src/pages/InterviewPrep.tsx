import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const InterviewPrep: React.FC = () => {
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>('');

  const generateQuestion = () => {
    // TODO: Implement actual question generation logic
    setQuestion("Tell me about a challenging project you've worked on and how you overcame obstacles.");
    setAnswer('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement answer analysis logic
    console.log("Answer submitted:", answer);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Interview Preparation</h1>
      <button onClick={generateQuestion} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors mb-4">
        Generate Interview Question
      </button>
      {question && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Question:</h2>
          <p className="mb-4">{question}</p>
          <form onSubmit={handleSubmit}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              rows={6}
              placeholder="Type your answer here..."
            ></textarea>
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              Submit Answer
            </button>
          </form>
        </div>
      )}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <MessageSquare className="flex-shrink-0 text-yellow-500 mr-3" />
          <p className="text-sm text-yellow-700">
            Tip: Practice answering questions out loud to improve your verbal communication skills.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;