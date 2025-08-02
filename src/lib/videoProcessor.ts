/**
 * Video processing utilities for silence detection and removal
 * Uses ffmpeg.wasm for video/audio processing in the browser
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';

// We'll load ffmpeg asynchronously only when needed
let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Loads ffmpeg.wasm library
 */
async function loadFFmpeg(): Promise<void> {
  if (ffmpegLoaded) return;
  
  // Create ffmpeg instance
  ffmpeg = new FFmpeg();
  await ffmpeg.load();
  ffmpegLoaded = true;
}

/**
 * Extracts audio track from a video file
 *
 * @param videoBuffer - The video file as ArrayBuffer
 * @returns Promise resolving to AudioBuffer of the extracted audio
 */
export async function extractAudioFromVideo(videoBuffer: ArrayBuffer): Promise<AudioBuffer> {
  if (!ffmpegLoaded) {
    await loadFFmpeg();
  }
  
  if (!ffmpeg) {
    throw new Error('FFmpeg not loaded');
  }
  
  // Write video file to ffmpeg virtual file system
  ffmpeg.writeFile('input.mp4', new Uint8Array(videoBuffer));
  
  // Extract audio to WAV
  await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', 'output.wav']);
  
  // Read the output file
  const wavData = await ffmpeg.readFile('output.wav');
  
  // Clean up
  ffmpeg.deleteFile('input.mp4');
  ffmpeg.deleteFile('output.wav');
  
  // Handle different return types from readFile
  const wavArrayBuffer = wavData instanceof Uint8Array ? wavData.buffer : new TextEncoder().encode(wavData as string).buffer;
  
  // Decode the WAV data
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    return await audioContext.decodeAudioData(wavArrayBuffer);
  } finally {
    audioContext.close();
  }
}

/**
 * Replaces audio track in a video file with a new audio track
 *
 * @param videoBuffer - The original video file as ArrayBuffer
 * @param newAudioBuffer - The new audio track as ArrayBuffer (WAV format)
 * @returns Promise resolving to ArrayBuffer of the new video file
 */
export async function replaceAudioInVideo(
  videoBuffer: ArrayBuffer,
  newAudioBuffer: ArrayBuffer
): Promise<ArrayBuffer> {
  if (!ffmpegLoaded) {
    await loadFFmpeg();
  }
  
  if (!ffmpeg) {
    throw new Error('FFmpeg not loaded');
  }
  
  // Write files to ffmpeg virtual file system
  ffmpeg.writeFile('input.mp4', new Uint8Array(videoBuffer));
  ffmpeg.writeFile('audio.wav', new Uint8Array(newAudioBuffer));
  
  // Replace audio track
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-i', 'audio.wav',
    '-c:v', 'copy',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    'output.mp4'
  ]);
  
  // Read the output file
  const outputData = await ffmpeg.readFile('output.mp4');
  
  // Clean up
  ffmpeg.deleteFile('input.mp4');
  ffmpeg.deleteFile('audio.wav');
  ffmpeg.deleteFile('output.mp4');
  
  // Handle different return types from readFile
  if (outputData instanceof Uint8Array) {
    return outputData.buffer;
  } else {
    return new TextEncoder().encode(outputData as string).buffer;
  }
}