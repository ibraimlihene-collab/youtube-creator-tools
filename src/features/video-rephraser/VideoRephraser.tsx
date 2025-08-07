import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

type FileDataPart = {
  fileData: {
    fileUri: string;
    mimeType?: string;
  };
};
type TextPart = { text: string };

const VideoRephraser = () => {
  const [apiKey, setApiKey] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [originalScript, setOriginalScript] = useState('');
  const [rephrasedScript, setRephrasedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessVideo = async () => {
    if (!apiKey || !videoUrl) {
      alert('Please provide an API key and a YouTube video URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOriginalScript('');
    setRephrasedScript('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      // YouTube URL is passed as fileData part per docs (preview feature)
      const youtubePart: FileDataPart = {
        fileData: {
          fileUri: videoUrl, // e.g., https://www.youtube.com/watch?v=XXXX
        },
      };

      // 1) Transcribe
      const transcribeResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [youtubePart as any, { text: 'Transcribe this video.' } as TextPart] },
        ],
      });
      const transcription = String(transcribeResp.text ?? '');
      setOriginalScript(transcription);

      // 2) Rephrase
      const rephraseResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Rephrase the following video script. Keep meaning, change wording and structure. Return the rephrased script only.' },
              { text: transcription },
            ],
          },
        ],
      });
      const rephrased = String(rephraseResp.text ?? '');
      setRephrasedScript(rephrased);
    } catch (e) {
      console.error(e);
      setError('Failed to process the video. Ensure API key is valid and video URL is public/allowed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Video Rephraser</h2>
      <div className="flex flex-col gap-4">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Google AI Studio API Key"
          className="p-2 border rounded"
        />
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube Video URL (public/unlisted)"
          className="p-2 border rounded"
        />
        <button
          onClick={handleProcessVideo}
          disabled={isLoading}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Processing...' : 'Process Video'}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-bold mb-2">Original Script</h3>
            <textarea
              value={originalScript}
              readOnly
              className="w-full h-48 p-2 border rounded bg-gray-100"
              placeholder="Original video script will appear here..."
            />
          </div>
          <div>
            <h3 className="font-bold mb-2">Rephrased Script</h3>
            <textarea
              value={rephrasedScript}
              readOnly
              className="w-full h-48 p-2 border rounded bg-gray-100"
              placeholder="Rephrased script will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRephraser;