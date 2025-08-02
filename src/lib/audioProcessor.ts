/**
 * Audio processing utilities for silence detection and removal
 */

// Default analysis parameters
const DEFAULT_ANALYSIS_PARAMS = {
  frameDuration: 0.1, // seconds per frame for RMS analysis
  minSilenceDuration: 0.4, // seconds
  silenceThreshold: -40, // dB
  padding: 0.06 // seconds to keep before/after non-silent segments
};

/**
 * Converts dB to linear amplitude
 */
function dbToAmplitude(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Computes RMS (Root Mean Square) of an audio buffer channel
 */
function computeRMS(audioData: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  return Math.sqrt(sum / audioData.length);
}

/**
 * Detects silent intervals in an audio buffer
 * 
 * @param audioBuffer - The audio buffer to analyze
 * @param params - Analysis parameters
 * @returns Array of silent intervals as [start, end] in seconds
 */
export function detectSilentIntervals(
  audioBuffer: AudioBuffer,
  params: {
    minSilenceDuration: number;
    silenceThreshold: number;
    frameDuration: number;
    padding: number;
  } = DEFAULT_ANALYSIS_PARAMS
): [number, number][] {
  const { numberOfChannels, sampleRate } = audioBuffer;
  const frameSize = Math.floor(params.frameDuration * sampleRate);
  const silenceThresholdAmplitude = dbToAmplitude(params.silenceThreshold);
  
  const silentIntervals: [number, number][] = [];
  let currentSilenceStart: number | null = null;
  
  const totalFrames = Math.ceil(audioBuffer.length / frameSize);
  
  for (let frame = 0; frame < totalFrames; frame++) {
    const startSample = frame * frameSize;
    const endSample = Math.min(startSample + frameSize, audioBuffer.length);
    const frameDuration = (endSample - startSample) / sampleRate;
    
    // Compute RMS for this frame across all channels
    let maxRMS = 0;
    for (let ch = 0; ch < numberOfChannels; ch++) {
      const channelData = audioBuffer.getChannelData(ch);
      const frameData = channelData.subarray(startSample, endSample);
      const rms = computeRMS(frameData);
      if (rms > maxRMS) {
        maxRMS = rms;
      }
    }
    
    const isSilent = maxRMS < silenceThresholdAmplitude;
    const frameStart = startSample / sampleRate;
    const frameEnd = endSample / sampleRate;
    
    if (isSilent) {
      if (currentSilenceStart === null) {
        currentSilenceStart = frameStart;
      }
    } else {
      // Non-silent frame
      if (currentSilenceStart !== null) {
        const silenceDuration = frameEnd - currentSilenceStart;
        if (silenceDuration >= params.minSilenceDuration) {
          // Extend the silent interval by padding
          const paddedStart = Math.max(0, currentSilenceStart - params.padding);
          const paddedEnd = Math.min(audioBuffer.duration, frameEnd + params.padding);
          silentIntervals.push([paddedStart, paddedEnd]);
        }
        currentSilenceStart = null;
      }
    }
  }
  
  // Handle case where file ends with silence
  if (currentSilenceStart !== null) {
    const silenceDuration = audioBuffer.duration - currentSilenceStart;
    if (silenceDuration >= params.minSilenceDuration) {
      const paddedStart = Math.max(0, currentSilenceStart - params.padding);
      silentIntervals.push([paddedStart, audioBuffer.duration]);
    }
  }
  
  return silentIntervals;
}

/**
 * Removes silent intervals from an audio buffer
 * 
 * @param audioBuffer - The original audio buffer
 * @param silentIntervals - Array of silent intervals to remove
 * @returns New audio buffer with silent parts removed
 */
export async function removeSilentIntervals(
  audioBuffer: AudioBuffer,
  silentIntervals: [number, number][]
): Promise<AudioBuffer> {
  // Sort intervals by start time
  silentIntervals.sort((a, b) => a[0] - b[0]);
  
  // Merge overlapping intervals
  const mergedIntervals: [number, number][] = [];
  for (const interval of silentIntervals) {
    if (mergedIntervals.length === 0) {
      mergedIntervals.push(interval);
      continue;
    }
    
    const lastInterval = mergedIntervals[mergedIntervals.length - 1];
    if (interval[0] <= lastInterval[1]) {
      // Overlapping or adjacent, merge them
      lastInterval[1] = Math.max(lastInterval[1], interval[1]);
    } else {
      mergedIntervals.push(interval);
    }
  }
  
  // Create non-silent segments
  const nonSilentSegments: { start: number; end: number }[] = [];
  
  // Add segment from beginning to first silence (if any)
  if (mergedIntervals.length > 0 && mergedIntervals[0][0] > 0) {
    nonSilentSegments.push({ start: 0, end: mergedIntervals[0][0] });
  } else if (mergedIntervals.length === 0) {
    // No silences at all, keep entire buffer
    nonSilentSegments.push({ start: 0, end: audioBuffer.duration });
  }
  
  // Add segments between silences
  for (let i = 0; i < mergedIntervals.length - 1; i++) {
    const currentEnd = mergedIntervals[i][1];
    const nextStart = mergedIntervals[i + 1][0];
    if (nextStart > currentEnd) {
      nonSilentSegments.push({ start: currentEnd, end: nextStart });
    }
  }
  
  // Add segment from last silence to end (if any)
  if (mergedIntervals.length > 0) {
    const lastEnd = mergedIntervals[mergedIntervals.length - 1][1];
    if (lastEnd < audioBuffer.duration) {
      nonSilentSegments.push({ start: lastEnd, end: audioBuffer.duration });
    }
  }
  
  if (nonSilentSegments.length === 0) {
    // Entire file is silent, return a minimal buffer
    const emptyContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      1,
      audioBuffer.sampleRate
    );
    return emptyContext.startRendering();
  }
  
  // Create new buffer with concatenated non-silent segments
  const totalDuration = nonSilentSegments.reduce(
    (sum, segment) => sum + (segment.end - segment.start),
    0
  );
  
  const newContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(totalDuration * audioBuffer.sampleRate),
    audioBuffer.sampleRate
  );
  
  let offset = 0;
  for (const segment of nonSilentSegments) {
    const startSample = Math.floor(segment.start * audioBuffer.sampleRate);
    const endSample = Math.ceil(segment.end * audioBuffer.sampleRate);
    const segmentDuration = (endSample - startSample) / audioBuffer.sampleRate;
    
    // Create a buffer source for this segment
    const segmentSource = newContext.createBufferSource();
    const segmentBuffer = newContext.createBuffer(
      audioBuffer.numberOfChannels,
      endSample - startSample,
      audioBuffer.sampleRate
    );
    
    // Copy audio data for each channel
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const originalData = audioBuffer.getChannelData(ch);
      const segmentData = segmentBuffer.getChannelData(ch);
      segmentData.set(originalData.subarray(startSample, endSample));
    }
    
    segmentSource.buffer = segmentBuffer;
    segmentSource.connect(newContext.destination);
    segmentSource.start(offset);
    offset += segmentDuration;
  }
  
  return await newContext.startRendering();
}

/**
 * Decodes an audio file (mp3, wav, etc.) into an AudioBuffer
 * 
 * @param arrayBuffer - The audio file as ArrayBuffer
 * @returns Promise resolving to AudioBuffer
 */
export async function decodeAudio(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    return await audioContext.decodeAudioData(arrayBuffer);
  } finally {
    audioContext.close();
  }
}

/**
 * Exports an AudioBuffer to WAV format
 * 
 * @param audioBuffer - The audio buffer to export
 * @returns Promise resolving to ArrayBuffer of WAV file
 */
export async function exportToWav(audioBuffer: AudioBuffer): Promise<ArrayBuffer> {
  const { numberOfChannels, sampleRate, length } = audioBuffer;
  
  // WAV header constants
  const headerLength = 44;
  const bytesPerSample = 2; // 16-bit
  const byteRate = sampleRate * numberOfChannels * bytesPerSample;
  const blockAlign = numberOfChannels * bytesPerSample;
  const bitsPerSample = bytesPerSample * 8;
  
  const buffer = new ArrayBuffer(headerLength + length * numberOfChannels * bytesPerSample);
  const view = new DataView(buffer);
  
  // Write WAV header
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File length minus RIFF identifier length and file description length
  view.setUint32(4, 36 + length * numberOfChannels * bytesPerSample, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // Format chunk identifier
  writeString(view, 12, 'fmt ');
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (raw)
  view.setUint16(20, 1, true);
  // Channel count
  view.setUint16(22, numberOfChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sample rate * block align)
  view.setUint32(28, byteRate, true);
  // Block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // Bits per sample
  view.setUint16(34, bitsPerSample, true);
  // Data chunk identifier
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, length * numberOfChannels * bytesPerSample, true);
  
  // Write PCM samples
  let offset = headerLength;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numberOfChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }
  
  return buffer;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}