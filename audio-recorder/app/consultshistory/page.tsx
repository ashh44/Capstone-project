"use client";

// User history

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '../Context/UserContext'; // Ensure this path is correct

interface HistoryRecord {
  sessionId: string;
  creationTime: string;
  summary: string;
  letter: string;
  username: string;
}

const UserHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Safely access the UserContext
  const userContext = useContext(UserContext);
  const username = userContext?.username ?? 'User';
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${backendUrl}/consult/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data: HistoryRecord[] = await response.json();
          setHistory(data);
        } else {
          setError('Failed to fetch history');
        }
      } catch (error) {
        setError('Error fetching history');
        console.error('Error:', error);
      }
    };

    fetchHistory();
  }, []);

  const handleGoToRecord = () => {
    router.push('/record');
  };

  const handleDownload = (sessionId: string, type: 'summary' | 'letter') => {
    const downloadUrl = `${backendUrl}/consult/${sessionId}/download-${type}`;
    window.open(downloadUrl, "_blank");
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-start">
      {/* Header with Logo, Navigation Links, and Button */}
      <header className="w-full max-w-6xl bg-blue-900 flex justify-between items-center sticky top-0 z-50 shadow-lg p-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <img src="/facere-logo.svg" alt="Company Logo" className="h-10" />
          <span className="text-white font-bold text-lg"></span>
        </div>


        <nav className="space-x-6 text-white hidden md:flex">
          <a href="#" className="hover:underline">Home</a>
          <a href="https://facere.ai/blog" className="hover:underline">News</a>
          <a href="https://facere.ai/faq" className="hover:underline">FAQ</a>
        </nav>


        <button
          onClick={handleGoToRecord}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
        >
          Go to Record Page
        </button>
      </header>

      {/* Main Content */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full text-center mt-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Previous History</h1>
        <p className="text-gray-600 mb-6 text-lg">Welcome, {username || 'User'}</p>

        {history.length === 0 ? (
          <p className="text-gray-600 mb-4">No records found</p>
        ) : (
          <table className="min-w-full bg-white mb-6 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-4 px-6 text-left text-gray-700 font-semibold">Last Visit</th>
                <th className="py-4 px-6 text-left text-gray-700 font-semibold">Summary</th>
                <th className="py-4 px-6 text-left text-gray-700 font-semibold">Letter</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="py-4 px-6 text-gray-700">
                    {new Date(record.creationTime).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
                      onClick={() => handleDownload(record.sessionId, 'summary')}
                    >
                      Download Summary PDF
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
                      onClick={() => handleDownload(record.sessionId, 'letter')}
                    >
                      Download Letter PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserHistory;