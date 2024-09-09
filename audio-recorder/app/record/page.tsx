"use client";

import { useState, useEffect, useRef } from 'react';

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<Float32Array[]>([]);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  
  

  useEffect(() => {
    if (isRecording) {
      const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);

        const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
        scriptNode.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
          const inputBuffer = audioProcessingEvent.inputBuffer.getChannelData(0);
          setAudioBuffer((prev) => [...prev, inputBuffer]);
        };

        source.connect(scriptNode);
        scriptNode.connect(audioCtx.destination);

        setAudioContext(audioCtx);
        setAudioSource(source);
        scriptNodeRef.current = scriptNode;
      };

      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const stopRecording = () => {
    if (audioSource) {
      audioSource.disconnect();
      scriptNodeRef.current?.disconnect();
      audioContext?.close();
    }
  };

  const handleStartStop = () => {
    setIsRecording(!isRecording);
  };

  // Updated handleSave function to save as .bin format
  const handleSave = () => {
    if (audioBuffer.length > 0) {
      // Convert the Float32Array buffer to a Uint8Array for saving as raw binary data
      const floatArray = new Float32Array(audioBuffer.flat());
      const uint8Array = new Uint8Array(floatArray.buffer);

      // Create a Blob from the Uint8Array
      const audioBlob = new Blob([uint8Array], { type: 'application/octet-stream' });

      // Create a downloadable link
      const url = window.URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'recording.bin'; // Save as .bin file
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };


// Define the formatTime function
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-blue-900 flex flex-col justify-between">
      <header className="w-full flex justify-between items-center px-6 py-4">
        <img src="/facere-logo.svg" alt="Facere Logo" className="h-10" />
        <nav className="space-x-6">
          <a href="#" className="text-white hover:underline">Home</a>
          <a href="#" className="text-white hover:underline">Solution</a>
          <a href="#" className="text-white hover:underline">News</a>
          <a href="#" className="text-white hover:underline">FAQ</a>
          <a href="#" className="text-white hover:underline">About Us</a>
        </nav>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg text-center border-4 border-indigo-500">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">🎤 Audio Recorder</h1>
          <button
            onClick={handleStartStop}
            className={`w-full py-3 mb-4 text-white font-semibold rounded-lg transition-all ${
              isRecording ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
            }`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <p className="text-gray-600 mb-6">
            {isRecording ? '🎙️ Recording in progress...' : 'Click the button to start recording'}
          </p>
          <button
            onClick={handleSave}
            disabled={audioBuffer.length === 0}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-all ${
              audioBuffer.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-700'
            }`}
          >
            Save Recording
          </button>
        </div>
      </main>
    </div>
  );
}