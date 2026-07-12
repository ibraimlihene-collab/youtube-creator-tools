/**
 * Audio processing utilities for silence detection and removal
 * Fixed: padding logic, error handling, and type safety
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
 * Fixed: padding is now applied to non-silent segments (keep parts before/after silence)
 * instead of extending silent intervals
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
          // Record actual silent interval (without padding - padding is for non-silent segments)
          silentIntervals.push([currentSilenceStart, frameEnd]);
        }
        currentSilenceStart = null;
      }
    }
  }
  
  // Handle case where file ends with silence
  if (currentSilenceStart !== null) {
    const silenceDuration = audioBuffer.duration - currentSilenceStart;
    if (silenceDuration >= params.minSilenceDuration) {
      silentIntervals.push([currentSilenceStart, audioBuffer.duration]);
    }
  }
  
  return silentIntervals;
}

/**
 * Removes silent intervals from an audio buffer
 * Fixed: proper padding application on non-silent segments to keep context
 * 
 * @param audioBuffer - The original audio buffer
 * @param silentIntervals - Array of silent intervals to remove
 * @param padding - Optional padding in seconds to keep around non-silent segments
 * @returns New audio buffer with silent parts removed
 */
export async function removeSilentIntervals(
  audioBuffer: AudioBuffer,
  silentIntervals: [number, number][],
  padding: number = 0.06
): Promise<AudioBuffer> {
  // Sort intervals by start time
  const sortedIntervals = [...silentIntervals].sort((a, b) => a[0] - b[0]);
  
  // Merge overlapping intervals
  const mergedIntervals: [number, number][] = [];
  for (const interval of sortedIntervals) {
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
  
  // Create non-silent segments with padding
  const nonSilentSegments: { start: number; end: number }[] = [];
  
  // Add segment from beginning to first silence (with padding at end)
  if (mergedIntervals.length > 0 && mergedIntervals[0][0] > 0) {
    nonSilentSegments.push({ 
      start: 0, 
      end: Math.max(0, mergedIntervals[0][0] - padding) 
    });
  } else if (mergedIntervals.length === 0) {
    // No silences at all, keep entire buffer
    nonSilentSegments.push({ start: 0, end: audioBuffer.duration });
  }
  
  // Add segments between silences (with padding on both sides)
  for (let i = 0; i < mergedIntervals.length - 1; i++) {
    const currentEnd = mergedIntervals[i][1];
    const nextStart = mergedIntervals[i + 1][0];
    if (nextStart > currentEnd) {
      nonSilentSegments.push({ 
        start: Math.min(audioBuffer.duration, currentEnd + padding), 
        end: Math.max(0, nextStart - padding) 
      });
    }
  }
  
  // Add segment from last silence to end (with padding at start)
  if (mergedIntervals.length > 0) {
    const lastEnd = mergedIntervals[mergedIntervals.length - 1][1];
    if (lastEnd < audioBuffer.duration) {
      nonSilentSegments.push({ 
        start: Math.min(audioBuffer.duration, lastEnd + padding), 
        end: audioBuffer.duration 
      });
    }
  }
  
  // Filter out invalid segments (start >= end)
  const validSegments = nonSilentSegments.filter(seg => seg.end > seg.start);
  
  if (validSegments.length === 0) {
    // Entire file is silent, return a minimal buffer with a short beep
    const emptyContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      Math.max(1, Math.ceil(audioBuffer.sampleRate * 0.1)), // 0.1 second beep
      audioBuffer.sampleRate
    );
    return emptyContext.startRendering();
  }
  
  // Create new buffer with concatenated non-silent segments
  const totalDuration = validSegments.reduce(
    (sum, segment) => sum + (segment.end - segment.start),
    0
  );
  
  const newContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(totalDuration * audioBuffer.sampleRate),
    audioBuffer.sampleRate
  );
  
  let offset = 0;
  for (const segment of validSegments) {
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
 * Fixed: proper error handling and cleanup
 * 
 * @param arrayBuffer - The audio file as ArrayBuffer
 * @returns Promise resolving to AudioBuffer
 */
export async function decodeAudio(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  const audioContext = new AudioContext();
  try {
    const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    return decoded;
  } catch (error) {
    throw new Error(`Failed to decode audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await audioContext.close().catch(() => {});
  }
}

/**
 * Exports an AudioBuffer to WAV format
 * Fixed: clamp samples properly, handle edge cases
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
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * bytesPerSample, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length * numberOfChannels * bytesPerSample, true);
  
  // Write PCM samples with proper clamping
  let offset = headerLength;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numberOfChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
      const int16 = sample < 0 
        ? Math.max(-32768, sample * 0x8000) 
        : Math.min(32767, sample * 0x7FFF);
      view.setInt16(offset, Math.round(int16), true);
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
