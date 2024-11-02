import React, { useState, useRef } from 'react';

const LiveTranscription: React.FC = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Creating an AudioContext
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Creating a MediaStreamSource from the audio input stream
      const input = audioContext.createMediaStreamSource(stream);

      // Creating a ScriptProcessorNode to process raw audio data
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      // Open the WebSocket connection
      const webSocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';
      socketRef.current = new WebSocket(`${webSocketUrl}/api/deepgram-proxy`);
      socketRef.current.onopen = () => {
        console.log('WebSocket connection opened');
      };

      // Capturing raw audio data from the ScriptProcessorNode
      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0); // Raw PCM data (Float32Array)
        const rawAudioData = convertFloat32ToInt16(inputData); // Convert to Int16 for Deepgram

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(rawAudioData); // Send raw PCM data as Int16
        }
      };

      // Connecting the nodes
      input.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      // Handle WebSocket messages (transcriptions)
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.transcript) {
          setTranscription((prev) => prev + ' ' + data.transcript);
        }
      };

      // Handle WebSocket errors
      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket error occurred.');
      };

      // Handle WebSocket closure
      socketRef.current.onclose = (event) => {
        console.log(`WebSocket connection closed: code=${event.code}, reason=${event.reason}`);
        setIsTranscribing(false);
      };

      setIsTranscribing(true);
    } catch (err) {
    const error = err as Error;
    console.error('Error accessing microphone:', error);
    setError('Error accessing microphone: ' + error.message);
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    setIsTranscribing(false);
  };

  const handleStartStop = () => {
    setError(null);
    if (isTranscribing) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Helper function to convert Float32 PCM data to Int16 (Deepgram expects Int16 raw PCM)
  const convertFloat32ToInt16 = (buffer: Float32Array) => {
    const len = buffer.length;
    const int16Array = new Int16Array(len);
    for (let i = 0; i < len; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array.buffer;
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Live Transcription</h1>
      <button
        onClick={handleStartStop}
        className={`w-full py-3 mb-4 text-white font-semibold rounded-lg ${
          isTranscribing ? 'bg-red-500 hover:bg-red-700' : 'bg-teal-500 hover:bg-teal-700'
        } flex items-center justify-center space-x-2`}
      >
        {isTranscribing ? 'Stop Transcription' : 'Start Transcription'}
      </button>
      <div className="text-left bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
        <p className="whitespace-pre-wrap">{transcription}</p>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default LiveTranscription;