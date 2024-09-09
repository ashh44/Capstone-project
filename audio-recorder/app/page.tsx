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

  // Updated handleSave function to save as .bin
  const handleSave = () => {
    if (audioBuffer.length > 0) {
      const bufferLength = audioBuffer.length * audioBuffer[0].length;
      const resultBuffer = new Float32Array(bufferLength);
      let offset = 0;
      for (let i = 0; i < audioBuffer.length; i++) {
        resultBuffer.set(audioBuffer[i], offset);
        offset += audioBuffer[i].length;
      }

      const audioBlob = new Blob([resultBuffer], { type: 'application/octet-stream' });
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

  return (
    <div className="container">
      <h1>Audio Recorder</h1>
      <button onClick={handleStartStop}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>{isRecording ? 'Recording in progress...' : 'Click to start recording'}</p>
      <button onClick={handleSave} disabled={audioBuffer.length === 0}>
        Save Recording as .bin
      </button>
    </div>
  );
}
