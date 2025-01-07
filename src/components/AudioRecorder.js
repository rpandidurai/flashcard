// src/components/AudioRecorder.js
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, X } from 'lucide-react';
import { formatTime } from '../utils/audioUtils';

const AudioRecorder = ({ onRecordingComplete, selectedAudio }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      clearInterval(timerRef.current);
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-4 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white`}
        >
          {isRecording ? <Square size={24} /> : <Mic size={24} />}
        </button>
        <div>
          {isRecording ? (
            <div className="text-red-500 animate-pulse">
              Recording: {formatTime(recordingTime)}
            </div>
          ) : (
            <div>Click to {audioURL ? 're-record' : 'start recording'}</div>
          )}
        </div>
      </div>

      {(audioURL || selectedAudio) && !isRecording && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <audio src={audioURL || selectedAudio} controls className="flex-1" />
          <button
            onClick={() => {
              if (audioURL) URL.revokeObjectURL(audioURL);
              setAudioURL('');
              onRecordingComplete(null);
            }}
            className="p-2 text-red-500"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;