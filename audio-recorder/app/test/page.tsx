"use client"; // Ensure this component is rendered on the client side

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Record() {
  const [isSending, setIsSending] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<Float32Array[]>([]);
  const sessionId = uuidv4();
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the interval ID
  const audioBufferRef = useRef<Float32Array[]>([]); // Ref to store the buffer directly

  const loadAudioFile = async (filePath: string) => {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load audio file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      const audioCtx = new AudioContext();
      const decodedData = await audioCtx.decodeAudioData(arrayBuffer);

      const sampleRate = decodedData.sampleRate;
      const totalSamples = decodedData.length;
      const chunkSize = sampleRate * 2; // Number of samples for 2 seconds

      const chunks: Float32Array[] = [];
      for (let i = 0; i < totalSamples; i += chunkSize) {
        const chunk = decodedData.getChannelData(0).slice(i, i + chunkSize); // Get the first channel
        if (chunk.length > 0) {
          chunks.push(chunk);
        } else {
          console.warn(`Skipping empty chunk at index ${i}`);
        }
      }


      if (chunks.length > 0) {
        setAudioBuffer(chunks);  // For triggering any UI update, if needed
        audioBufferRef.current = chunks; // Store the buffer in the ref for real-time access
      } else {
        console.warn("No valid chunks found in the audio file.");
      }

      // Now start sending chunks every 2 seconds
      intervalRef.current = setInterval(sendChunk, 2000);
    } catch (error) {
      console.error("Error loading audio file:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log("Interval cleared.");
      }
    };
  }, []);

  const stopSending = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      console.log("Stopped sending audio.");
    }
  };

  const sendChunk = async () => {
    if (audioBufferRef.current.length > 0) {
      console.log("Preparing next chunk...");
      const [chunk, ...remainingChunks] = audioBufferRef.current; // Access buffer from ref

      if (chunk) {
        console.log("Sending chunk to backend...");
        const base64Audio = float32ToBase64(chunk);

        const payload = {
          sessionId,
          audioData: base64Audio,
        };

        //Sending 2-second audio chunk to backend
        try {
          const response = await fetch(`http://localhost:8080/api/consult/${sessionId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`Failed to send audio chunk: ${response.statusText}`);
          }

          // After sending the chunk, update the buffer in the ref with remaining chunks
          audioBufferRef.current = remainingChunks;
          setAudioBuffer(remainingChunks); // Optional: Update state for UI if needed

          // Stop sending when there are no more chunks left
          if (remainingChunks.length === 0) {
            stopSending();
          }
        } catch (error) {
          console.error('Error sending audio chunk:', error);
        }
      }
    } else {
      console.log('Audio buffer is empty. No chunks to send.');
      stopSending();
    }
  };

  const handleStartStop = () => {
    if (isSending) {
      setIsSending(false);
      stopSending();
    } else {
      setIsSending(true);
      loadAudioFile('output7299.wav'); // Specify the path to the pre-recorded audio file
    }
  };

  const float32ToBase64 = (float32Array: Float32Array) => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      int16Array[i] = Math.max(-1, Math.min(1, float32Array[i])) * 32767;
    }

    const buffer = new ArrayBuffer(int16Array.length * 2); // 2 bytes per int16 sample
    const view = new DataView(buffer);
    for (let i = 0; i < int16Array.length; i++) {
      view.setInt16(i * 2, int16Array[i], true); // true for little-endian
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary); // Base64 encoding
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
          <h1 className="text-4xl font-bold text-gray-800 mb-6">🎤 Audio Testing</h1>
          <button
            onClick={handleStartStop}
            className={`w-full py-3 mb-4 text-white font-semibold rounded-lg transition-all ${isSending ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}
          >
            {isSending ? 'Stop Sending' : 'Start Sending'}
          </button>
          <p className="text-gray-600 mb-6">
            {isSending ? '📤 Sending audio chunks...' : 'Click the button to send pre-recorded audio'}
          </p>
        </div>
      </main>
    </div>
  );
}
