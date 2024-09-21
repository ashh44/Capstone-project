"use client"; // Ensure this component is rendered on the client side

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaStreamAudioSourceNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<Float32Array[]>([]);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    if (isRecording) {
      const startRecording = async () => {
        try {
          // Request microphone access
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

          // Create a new AudioContext
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContext({ sampleRate: 44100 }); // Set sample rate if necessary

          // Create a MediaStreamAudioSourceNode from the stream
          const source = audioCtx.createMediaStreamSource(stream);

          // Create a ScriptProcessorNode
          const bufferSize = 4096; // Set buffer size, larger sizes reduce hissing
          const scriptNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);

          // Handle audio processing
          scriptNode.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
            const inputBuffer = audioProcessingEvent.inputBuffer.getChannelData(0);
            // Clone the buffer to avoid mutations
            const inputData = new Float32Array(inputBuffer.length);
            inputData.set(inputBuffer);

            // Append the chunk to the audioBuffer array
            setAudioBuffer((prev) => [...prev, inputData]);
          };

          // Connect the nodes
          source.connect(scriptNode);
          scriptNode.connect(audioCtx.destination);

          // Store references
          setAudioContext(audioCtx);
          setAudioSource(source);
          scriptNodeRef.current = scriptNode;
        } catch (error) {
          console.error('Error accessing the microphone:', error);
        }
      };

      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      // Cleanup if component unmounts
      if (audioSource) {
        audioSource.disconnect();
        scriptNodeRef.current?.disconnect();
        audioContext?.close();
      }
    };
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

  const handleSave = async () => {
    if (audioBuffer.length > 0) {
      // Concatenate all the Float32Arrays into a single Float32Array
      const bufferLength = audioBuffer.reduce((acc, buffer) => acc + buffer.length, 0);
      const resultBuffer = new Float32Array(bufferLength);
      let offset = 0;
      for (let i = 0; i < audioBuffer.length; i++) {
        resultBuffer.set(audioBuffer[i], offset);
        offset += audioBuffer[i].length;
      }

      // Convert to WAV format
      const wavBuffer = encodeWAV(resultBuffer, 44100); // Assuming a sample rate of 44100 Hz
      const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = window.URL.createObjectURL(audioBlob);

      // Generate a unique session ID using UUID
      const sessionId = uuidv4();
      const timestamp = new Date().toISOString().replace(/:/g, '-'); // Replace colons for filename safety
      const filename = `recording_${sessionId}_${timestamp}.wav`;

      // Download the file
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      // Save session details to the database using the new session endpoint
      try {
        // Send the sessionId as a query parameter
        await fetch(`http://localhost:8080/api/consult/new-session?sessionId=${sessionId}`, { // Adjust the URL to your API endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include credentials (cookies) with the request
        });
        console.log('Session record saved successfully');
      } catch (error) {
        console.error('Error saving session record:', error);
      }
    }
  };


  // Function to encode raw audio data to WAV format
  const encodeWAV = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // PCM format
    view.setUint16(20, 1, true); // Linear PCM
    view.setUint16(22, 1, true); // Mono channel
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write PCM samples
    floatTo16BitPCM(view, 44, samples);

    return view;
  };

  // Helper functions to write WAV file
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
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