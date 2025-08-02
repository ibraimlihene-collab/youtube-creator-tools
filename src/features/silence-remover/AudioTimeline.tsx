import React, { useEffect, useRef } from 'react';

interface AudioTimelineProps {
  audioBuffer: AudioBuffer | null;
  silentIntervals: [number, number][];
  onIntervalClick?: (start: number, end: number) => void;
}

const AudioTimeline: React.FC<AudioTimelineProps> = ({ 
  audioBuffer, 
  silentIntervals,
  onIntervalClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // Draw silent intervals
    ctx.fillStyle = '#ff6b6b';
    const duration = audioBuffer.duration;
    
    for (const [start, end] of silentIntervals) {
      const startX = (start / duration) * width;
      const endX = (end / duration) * width;
      ctx.fillRect(startX, 0, endX - startX, height);
    }
    
    // Draw waveform
    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(0, amp);
    
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const idx = Math.floor((i * step) + j);
        if (idx >= channelData.length) continue;
        
        const value = channelData[idx];
        if (value < min) min = value;
        if (value > max) max = value;
      }
      
      ctx.lineTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [audioBuffer, silentIntervals]);
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioBuffer || !onIntervalClick) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = canvas.width;
    const duration = audioBuffer.duration;
    const time = (x / width) * duration;
    
    // Find if click is in a silent interval
    for (const [start, end] of silentIntervals) {
      if (time >= start && time <= end) {
        onIntervalClick(start, end);
        break;
      }
    }
  };
  
  if (!audioBuffer) {
    return (
      <div className="w-full h-32 bg-base-200 rounded-lg flex items-center justify-center">
        <span className="text-base-content/50">No audio to display</span>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-32 bg-base-200 rounded-lg cursor-pointer"
        onClick={handleClick}
      />
      <div className="flex justify-between text-xs text-base-content/70 mt-1">
        <span>0:00</span>
        <span>{Math.floor(audioBuffer.duration / 60)}:{Math.floor(audioBuffer.duration % 60).toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default AudioTimeline;