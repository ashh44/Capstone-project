"use client"; // Ensure this component is rendered on the client side

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<Float32Array[]>([]);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the interval ID
  const chunkBuffer = useRef<Float32Array[]>([]); // Buffer for 2-second chunks
  const sessionId = uuidv4();

  useEffect(() => {
    if (isRecording) {
      const startRecording = async () => {
        try {
          console.log('Requesting microphone access...');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

          console.log('Microphone stream tracks:', stream.getTracks());
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContext({ sampleRate: 44100 });

          console.log('AudioContext created');
          const source = audioCtx.createMediaStreamSource(stream);

          const bufferSize = 4096; // Adjust buffer size if needed
          const scriptNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);

          // Log buffer processing
          scriptNode.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
            const inputBuffer = audioProcessingEvent.inputBuffer.getChannelData(0);
            const inputData = new Float32Array(inputBuffer.length);
            inputData.set(inputBuffer);

            // Collect audio data into a chunk buffer
            chunkBuffer.current.push(inputData);
          };

          source.connect(scriptNode);
          scriptNode.connect(audioCtx.destination);

          setAudioContext(audioCtx);
          setAudioSource(source);
          scriptNodeRef.current = scriptNode;

          // Start sending chunks every 2 seconds
          intervalRef.current = setInterval(sendChunk, 2000);
        } catch (error) {
          console.error('Error accessing the microphone:', error);
        }
      };

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Stop sending chunks
    }
  };

  const sendChunk = async () => {
    if (chunkBuffer.current.length > 0) {
      // Flatten the chunk buffer into a single Float32Array
      const bufferLength = chunkBuffer.current.reduce((acc, buffer) => acc + buffer.length, 0);
      const resultBuffer = new Float32Array(bufferLength);
      let offset = 0;
      for (let i = 0; i < chunkBuffer.current.length; i++) {
        resultBuffer.set(chunkBuffer.current[i], offset);
        offset += chunkBuffer.current[i].length;
      }

      // Convert to base64 and send it to the backend
      const base64Audio = float32ToBase64(resultBuffer);
      const payload = {
        sessionId,
        audioData: base64Audio,
      };

    //Sending 2-second audio chunk to backend
      try {
        await fetch(`http://localhost:8080/api/consult/${sessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include',
        });

      } catch (error) {
        console.error('Error sending audio chunk:', error);
      }

      // Clear the chunk buffer after sending
      chunkBuffer.current = [];
    }
  };

  const handleStartStop = () => {
    setIsRecording(!isRecording);
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
        </div>
      </main>
    </div>
  );
}
