"use client";

//user history

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '../Context/UserContext'; // Ensure this path is correct

interface HistoryRecord {
  creationTime: string;
  summary: string;
  letter: string;
}

const UserHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // Safely access the UserContext
  const userContext = useContext(UserContext);
  const username = userContext?.username ?? 'User';

  useEffect(() => {
    const fetchHistory = async () => {
      try {

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        const response = await fetch(`${backendUrl}/api/consult/history`, {
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

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">User History</h1>
        <p className="text-gray-600 mb-4">Welcome, {username}</p>

        {history.length === 0 ? (
          <p className="text-gray-600 mb-4">No records found</p>
        ) : (
          <table className="min-w-full bg-white mb-6">
            <thead>
              <tr>
                <th className="py-2">Creation Time</th>
                <th className="py-2">Summary</th>
                <th className="py-2">Letter</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr key={index} className="text-center">
                  <td className="py-2">{new Date(record.creationTime).toLocaleString()}</td>
                  <td className="py-2">{record.summary || 'N/A'}</td>
                  <td className="py-2">{record.letter || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={handleGoToRecord}
          className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
        >
          Go to Record Page
        </button>
      </div>
    </div>
  );
};

export default UserHistory;