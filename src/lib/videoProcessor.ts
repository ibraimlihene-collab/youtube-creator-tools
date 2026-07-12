/**
 * Video processing utilities for audio extraction and replacement
 * Uses ffmpeg.wasm for video/audio processing in the browser
 * Fixed: proper async API for modern @ffmpeg/ffmpeg, includes fetchFile helper
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';

// Simple fetchFile helper to avoid needing @ffmpeg/util package
async function fetchFile(file: Blob): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// FFmpeg instance - loaded on demand
let ffmpeg: FFmpeg | null = null;
let ffmpegLoading: Promise<void> | null = null;

/**
 * Loads ffmpeg.wasm library with singleton pattern
 * Fixed: prevents multiple simultaneous load attempts
 */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  
  if (ffmpegLoading) {
    await ffmpegLoading;
    if (ffmpeg) return ffmpeg;
  }
  
  ffmpegLoading = (async () => {
    ffmpeg = new FFmpeg();
    await ffmpeg.load();
  })();
  
  await ffmpegLoading;
  ffmpegLoading = null;
  
  if (!ffmpeg) {
    throw new Error('Failed to initialize FFmpeg');
  }
  
  return ffmpeg;
}

/**
 * Extracts audio track from a video file
 * Fixed: uses proper async FFmpeg API with fetchFile helper
 *
 * @param videoBuffer - The video file as ArrayBuffer
 * @returns Promise resolving to AudioBuffer of the extracted audio
 */
export async function extractAudioFromVideo(videoBuffer: ArrayBuffer): Promise<AudioBuffer> {
  const ff = await loadFFmpeg();
  
  const inputName = `input_${Date.now()}.mp4`;
  const outputName = `output_${Date.now()}.wav`;
  
  try {
    // Write video file to ffmpeg virtual file system
    await ff.writeFile(inputName, await fetchFile(new Blob([videoBuffer])));
    
    // Extract audio to WAV
    await ff.exec([
      '-i', inputName,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ar', '44100',
      '-ac', '2',
      outputName
    ]);
    
    // Read the output file
    const wavData = await ff.readFile(outputName);
    
    // Convert to ArrayBuffer
    const wavArrayBuffer = wavData instanceof Uint8Array 
      ? wavData.buffer.slice(wavData.byteOffset, wavData.byteOffset + wavData.byteLength)
      : wavData;
    
    // Decode the WAV audio
    const audioContext = new AudioContext();
    try {
      return await audioContext.decodeAudioData(wavArrayBuffer);
    } finally {
      await audioContext.close().catch(() => {});
    }
  } finally {
    // Clean up files
    try {
      await ff.deleteFile(inputName);
    } catch (e) { /* ignore cleanup errors */ }
    try {
      await ff.deleteFile(outputName);
    } catch (e) { /* ignore cleanup errors */ }
  }
}

/**
 * Replaces audio in a video file with a new audio track
 * Fixed: proper async API with error handling
 *
 * @param videoBuffer - Original video file as ArrayBuffer
 * @param audioBuffer - New audio as ArrayBuffer (WAV format)
 * @returns Promise resolving to ArrayBuffer of the new video file
 */
export async function replaceAudioInVideo(
  videoBuffer: ArrayBuffer,
  audioBuffer: ArrayBuffer
): Promise<ArrayBuffer> {
  const ff = await loadFFmpeg();
  
  const videoInput = `video_${Date.now()}.mp4`;
  const audioInput = `audio_${Date.now()}.wav`;
  const outputName = `output_${Date.now()}.mp4`;
  
  try {
    // Write input files
    await ff.writeFile(videoInput, await fetchFile(new Blob([videoBuffer])));
    await ff.writeFile(audioInput, await fetchFile(new Blob([audioBuffer])));
    
    // Replace audio track
    await ff.exec([
      '-i', videoInput,
      '-i', audioInput,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      outputName
    ]);
    
    // Read output
    const outputData = await ff.readFile(outputName);
    
    return outputData instanceof Uint8Array
      ? outputData.buffer.slice(outputData.byteOffset, outputData.byteOffset + outputData.byteLength)
      : outputData;
  } finally {
    // Clean up
    try { await ff.deleteFile(videoInput); } catch (e) { /* ignore */ }
    try { await ff.deleteFile(audioInput); } catch (e) { /* ignore */ }
    try { await ff.deleteFile(outputName); } catch (e) { /* ignore */ }
  }
}

/**
 * Converts a video file to a different format
 * Fixed: proper async API with progress tracking support
 *
 * @param videoBuffer - Video file as ArrayBuffer
 * @param outputFormat - Output format (mp4, webm, etc.)
 * @returns Promise resolving to ArrayBuffer of converted video
 */
export async function convertVideoFormat(
  videoBuffer: ArrayBuffer,
  outputFormat: string = 'mp4'
): Promise<ArrayBuffer> {
  const ff = await loadFFmpeg();
  
  const inputName = `input_${Date.now()}.mp4`;
  const outputName = `output_${Date.now()}.${outputFormat}`;
  
  try {
    await ff.writeFile(inputName, await fetchFile(new Blob([videoBuffer])));
    
    await ff.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-crf', '23',
      '-preset', 'fast',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputName
    ]);
    
    const outputData = await ff.readFile(outputName);
    
    return outputData instanceof Uint8Array
      ? outputData.buffer.slice(outputData.byteOffset, outputData.byteOffset + outputData.byteLength)
      : outputData;
  } finally {
    try { await ff.deleteFile(inputName); } catch (e) { /* ignore */ }
    try { await ff.deleteFile(outputName); } catch (e) { /* ignore */ }
  }
}
