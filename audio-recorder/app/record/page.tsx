"use client";

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const chunkBuffer = useRef<Float32Array[]>([]); // Buffer for audio chunks
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://54.208.12.34/api';
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://54.208.12.34';

  // Authentication check
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/check-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          window.location.href = `${frontendUrl}/login`;
        }
      } else {
        window.location.href = `${frontendUrl}/login`;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = `${frontendUrl}/login`;
    }
  };

  useEffect(() => {
    if (isRecording) {
      const startRecording = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContext({ sampleRate: 44100 });
          const source = audioCtx.createMediaStreamSource(stream);

          const bufferSize = 4096;
          const scriptNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);

          scriptNode.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
            const inputBuffer = audioProcessingEvent.inputBuffer.getChannelData(0);
            const inputData = new Float32Array(inputBuffer.length);
            inputData.set(inputBuffer);
            chunkBuffer.current.push(inputData);
          };

          source.connect(scriptNode);
          scriptNode.connect(audioCtx.destination);

          setAudioContext(audioCtx);
          setAudioSource(source);
          scriptNodeRef.current = scriptNode;
          setError(null);
        } catch (error) {
          console.error('Error accessing the microphone:', error);
          setError('Unable to access microphone. Please check permissions.');
        }
      };

      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      console.log('New recording session started:', newSessionId);

      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      if (audioSource) {
        audioSource.disconnect();
      }
      if (scriptNodeRef.current) {
        scriptNodeRef.current.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isRecording]);

  const stopRecording = () => {
    if (audioSource) {
      audioSource.disconnect();
    }
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
    }
    if (audioContext) {
      audioContext.close();
    }
  };

  const float32ToBase64 = (float32Array: Float32Array) => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      int16Array[i] = Math.max(-1, Math.min(1, float32Array[i])) * 32767;
    }

    const buffer = new ArrayBuffer(int16Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < int16Array.length; i++) {
      view.setInt16(i * 2, int16Array[i], true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const saveRecording = async () => {
    if (chunkBuffer.current.length > 0 && sessionId) {
      setIsSaving(true);
      setError(null);

      try {
        // Flatten the chunk buffer
        const bufferLength = chunkBuffer.current.reduce((acc, buffer) => acc + buffer.length, 0);
        const resultBuffer = new Float32Array(bufferLength);
        let offset = 0;
        for (const buffer of chunkBuffer.current) {
          resultBuffer.set(buffer, offset);
          offset += buffer.length;
        }

        const base64Audio = float32ToBase64(resultBuffer);
        console.log('Saving recording for session:', sessionId);

        const response = await fetch(`${apiBaseUrl}/consult/${sessionId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            userName: "user5",
            audioData: base64Audio
          }),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Recording saved successfully:', data);
          alert('Recording saved successfully!');
          chunkBuffer.current = []; // Clear the buffer after successful save
        } else {
          const errorData = await response.json().catch(() => null);
          console.error('Save failed:', errorData);
          setError(errorData?.message || 'Failed to save recording.');
        }
      } catch (error) {
        console.error('Error saving recording:', error);
        setError('An error occurred while saving the recording.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const generateSummaryAndLetter = async () => {
    if (!sessionId) {
      setError('No recording session available.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('Generating summary for session:', sessionId);

      const response = await fetch(`${apiBaseUrl}/consult/${sessionId}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          userName: "user5"
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Summary generated:', data);
        alert(`Summary and Letter Generated Successfully!\n\nSummary: ${data.summary}\n\nLetter: ${data.letter}`);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Generate failed:', errorData);
        setError(errorData?.message || 'Failed to generate summary and letter.');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('An error occurred while generating the summary.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Checking authentication...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>;
  }

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
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg text-center border-4 border-indigo-500">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">🎤 Audio Recorder</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-full py-3 mb-4 text-white font-semibold rounded-lg transition-all ${
              isRecording ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
            }`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          <p className="text-gray-600 mb-6">
            {isRecording ? '🎙️ Recording in progress...' : 'Click the button to start recording'}
          </p>

          {!isRecording && sessionId && (
            <div className="space-y-4">
              <button
                onClick={saveRecording}
                disabled={isSaving}
                className={`w-full py-3 text-white font-semibold rounded-lg transition-all ${
                  isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Recording'}
              </button>

              <button
                onClick={generateSummaryAndLetter}
                disabled={isGenerating}
                className={`w-full py-3 text-white font-semibold rounded-lg transition-all ${
                  isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate Summary and Letter'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}