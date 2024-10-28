"use client";

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FiMic, FiSave, FiFileText } from 'react-icons/fi'; // npm install react-icons
import { ClipLoader } from 'react-spinners'; // npm install react-spinners



export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const chunkBuffer = useRef<Float32Array[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null); // Store the session ID (UUID)
  const [isSaving, setIsSaving] = useState(false); // State to manage saving/loading
  const [isGenerating, setIsGenerating] = useState(false); // State to manage summary generation
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

          const bufferSize = 4096; // Adjust buffer size if needed
          const scriptNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);

          // Log buffer processing
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
        } catch (error) {
          console.error('Error accessing the microphone:', error);
        }
      };

      // Generate a UUID when recording starts
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

  const saveRecording = async () => {
    if (chunkBuffer.current.length > 0 && sessionId) {
      setIsSaving(true); // Start saving/loading

      // Flatten the chunk buffer into a single Float32Array
      const bufferLength = chunkBuffer.current.reduce((acc, buffer) => acc + buffer.length, 0);
      const resultBuffer = new Float32Array(bufferLength);
      let offset = 0;
      for (let i = 0; i < chunkBuffer.current.length; i++) {
        resultBuffer.set(chunkBuffer.current[i], offset);
        offset += chunkBuffer.current[i].length;
      }

      // Convert the audio buffer to base64 and send to backend as .bin
      const base64Audio = float32ToBase64(resultBuffer);
      const payload = {
        sessionId,
        audioData: base64Audio,
      };

      try {
        const response = await fetch(`${apiBaseUrl}/consult/${sessionId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              userName: "",
              audioData: base64Audio
            }),
            credentials: 'include',
          });

        if (response.ok) {
          alert('Recording saved as .bin successfully.');
        } else {
          alert('Failed to save recording.');
        }
      } catch (error) {
        console.error('Error saving recording:', error);
      } finally {
        setIsSaving(false); // Stop saving/loading state
      }
    }
  };

  const generateSummaryAndLetter = async () => {
    setIsGenerating(true); // Start generating

   console.log(`Making request to URL: ${apiBaseUrl}/consult/${sessionId}/generate-summary`);

    try {
      const response = await fetch(`${apiBaseUrl}/consult/${sessionId}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           // sessionId: sessionId,
            //audioData: base64Audio,
            userName: "",

          }),
      credentials: 'include',

      });

      if (response.ok) {
      const responseData = await response.json();


       const { sessionId, summary, letter } = responseData;

       // Show the data in a popup window for debugging
       alert(`Session ID: ${sessionId}\nSummary: ${summary}\nLetter: ${letter}`);

       alert('Summary and letter generated successfully.');
      } else {
        alert('Failed to generate summary and letter.');
      }
    } catch (error) {
      console.error('Error generating summary and letter:', error);
    } finally {
      setIsGenerating(false); // Stop generating state
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

 if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Checking authentication...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-blue-900 flex flex-col justify-between text-white font-sans">
      <header className="w-full flex justify-between items-center px-6 py-4">
        <img src="/facere-logo.svg" alt="Facere Logo" className="h-12" />
        <nav className="space-x-6">
          <a href="/consultshistory" className="hover:underline">Home</a>
          <a href="/transcribe" className="hover:underline">Live Transcription</a>
          <a href="https://facere.ai/blog" className="hover:underline">News</a>
          <a href="https://facere.ai/faq" className="hover:underline">FAQ</a>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white bg-opacity-90 p-10 rounded-2xl shadow-2xl max-w-lg text-center border border-indigo-300">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-8 shadow-md">🎙️ Audio Recorder</h1>

          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-full py-3 mb-6 text-white font-bold rounded-lg transition-transform transform hover:scale-105 ${
              isRecording ? 'bg-red-500 hover:bg-red-700' : 'bg-teal-500 hover:bg-teal-700'
            } flex items-center justify-center space-x-2`}
          >
            <FiMic className="inline-block text-2xl" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          <p className="text-gray-600 mb-8">
            {isRecording ? '🎙️ Recording in progress...' : 'Click the button to start recording'}
          </p>

          {!isRecording && sessionId && (
            <>
              <button
                onClick={saveRecording}
                className="w-full py-3 mb-6 text-white font-bold rounded-lg bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center space-x-2"
                disabled={isSaving}
              >
                {isSaving ? <ClipLoader size={20} color={"#fff"} /> : <FiSave className="inline-block text-xl" />}
                {isSaving ? 'Saving...' : 'Save Recording'}
              </button>

              <button
                onClick={generateSummaryAndLetter}
                className="w-full py-3 mb-6 text-white font-bold rounded-lg bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center space-x-2"
                disabled={isGenerating}
              >
                {isGenerating ? <ClipLoader size={20} color={"#fff"} /> : <FiFileText className="inline-block text-xl" />}
                {isGenerating ? 'Generating...' : 'Generate Summary and Letter'}
              </button>
            </>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-sm bg-opacity-20">
        <p>&copy; 2024 Facere Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
