"use client"; 
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const chunkBuffer = useRef<Float32Array[]>([]); // Buffer for audio chunks
  const [sessionId, setSessionId] = useState<string | null>(null); // Store the session ID (UUID)
  const [isSaving, setIsSaving] = useState(false); // State to manage saving/loading
  const [isGenerating, setIsGenerating] = useState(false); // State to manage summary generation

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
        const response = await fetch(`http://localhost:8080/api/consult/${sessionId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              userName: "user5", // This must be included
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

   console.log(`Making request to URL: http://localhost:8080/api/consult/${sessionId}/generate-summary`);

    try {
      const response = await fetch(`http://localhost:8080/api/consult/${sessionId}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           // sessionId: sessionId,
            //audioData: base64Audio,
            userName: "user5", // This must be included

          }),
      credentials: 'include',

      });

      if (response.ok) {
      const responseData = await response.json();

       // Assuming the backend returns the sessionId, summary, and letter content
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

  return (
    <div className="min-h-screen bg-blue-900 flex flex-col justify-between">
      <header className="w-full flex justify-between items-center px-6 py-4">
        <img src="/facere-logo.svg" alt="Facere Logo" className="h-10" />
        <nav className="space-x-6">
          <a href="#" className="text-white hover:underline">Home</a>
          <a href="/transcribe" className="text-white hover:underline">Live Transcription</a>
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
            <>
              <button
                onClick={saveRecording}
                className="w-full py-3 mb-4 text-white font-semibold rounded-lg transition-all bg-blue-500 hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Recording'}
              </button>

              <button
                onClick={generateSummaryAndLetter}
                className="w-full py-3 mb-4 text-white font-semibold rounded-lg transition-all bg-blue-500 hover:bg-blue-700"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Summary and Letter'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
