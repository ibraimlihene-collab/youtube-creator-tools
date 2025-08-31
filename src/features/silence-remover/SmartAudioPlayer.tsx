import React, { useEffect, useRef, useState } from 'react';

interface SmartAudioPlayerProps {
  audioBuffer: AudioBuffer;
  silentIntervals: [number, number][];
  onTimeUpdate?: (time: number) => void;
}

const SmartAudioPlayer: React.FC<SmartAudioPlayerProps> = ({ 
  audioBuffer, 
  silentIntervals,
  onTimeUpdate
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setDuration(audioBuffer.duration);
  }, [audioBuffer]);

  const play = async () => {
    if (isPlayingRef.current) return;
    
    // Create AudioContext if it doesn't exist
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    
    // Resume if suspended
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // Stop any existing playback
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
    }
    
    // Create new source
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    sourceRef.current = source;
    
    // Set up time tracking
    startTimeRef.current = ctx.currentTime - pausedTimeRef.current;
    isPlayingRef.current = true;
    setIsPlaying(true);
    
    // Start playback
    source.start(0, pausedTimeRef.current);
    
    // Set up animation frame for time updates
    const updateTime = () => {
      if (isPlayingRef.current && ctx) {
        const elapsed = ctx.currentTime - startTimeRef.current;
        let newTime = elapsed;
        
        // Check if we're in a silent interval and skip it
        for (const [start, end] of silentIntervals) {
          if (newTime >= start && newTime < end) {
            // Use the seek function to jump to the end of the silence.
            // This properly handles stopping the old source and starting a new one.
            seek(end);
            return; // Exit the current update loop, seek will start a new one.
          }
        }
        
        setCurrentTime(newTime);
        if (onTimeUpdate) onTimeUpdate(newTime);
        
        // Check if playback has ended
        if (newTime >= duration) {
          pause();
          setCurrentTime(duration);
          if (onTimeUpdate) onTimeUpdate(duration);
          return;
        }
        
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(updateTime);
  };

  const pause = () => {
    if (!isPlayingRef.current) return;
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Stop audio source
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
    }
    
    // Update paused time
    if (audioContextRef.current) {
      pausedTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
    }
    
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  const stop = () => {
    pause();
    pausedTimeRef.current = 0;
    setCurrentTime(0);
    if (onTimeUpdate) onTimeUpdate(0);
  };

  const seek = (time: number) => {
    if (time < 0) time = 0;
    if (time > duration) time = duration;

    const wasPlaying = isPlayingRef.current;
    if (wasPlaying) {
      pause();
    }

    pausedTimeRef.current = time;
    setCurrentTime(time);
    if (onTimeUpdate) onTimeUpdate(time);

    if (wasPlaying) {
      play();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pause();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-base-200 rounded-lg">
      <div className="w-full flex justify-between text-sm">
        <span>{currentTime.toFixed(2)}s</span>
        <span>{duration.toFixed(2)}s</span>
      </div>
      
      <div className="w-full flex justify-center gap-4">
        <button 
          className="btn btn-circle btn-red-600"
          onClick={isPlaying ? pause : play}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button 
          className="btn btn-circle"
          onClick={stop}
        >
          ⏹
        </button>
      </div>
      
      <input
        type="range"
        min="0"
        max={duration}
        step="0.01"
        value={currentTime}
        onChange={(e) => seek(parseFloat(e.target.value))}
        className="range range-primary w-full"
      />
    </div>
  );
};

export default SmartAudioPlayer;