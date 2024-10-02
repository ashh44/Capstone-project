"use client";

import LiveTranscription from '../components/LiveTranscription';

export default function TranscriptionPage() {
  return (
    <div className="min-h-screen bg-blue-900 flex flex-col justify-between">
      <header className="w-full flex justify-between items-center px-6 py-4">
        <img src="/facere-logo.svg" alt="Facere Logo" className="h-10" />
        <nav className="space-x-6">
          <a href="/record" className="text-white hover:underline">Record</a>
          <a href="/transcribe" className="text-white hover:underline">Live Transcribe</a>
          <a href="#" className="text-white hover:underline">Solution</a>
          <a href="#" className="text-white hover:underline">News</a>
          <a href="#" className="text-white hover:underline">FAQ</a>
          <a href="#" className="text-white hover:underline">About Us</a>
        </nav>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <LiveTranscription />
      </main>
    </div>
  );
}