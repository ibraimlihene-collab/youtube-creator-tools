import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

type FileDataPart = {
  fileData: {
    fileUri: string;
    mimeType?: string;
  };
};
type TextPart = { text: string };
type ContentPart = FileDataPart | TextPart;

const isYouTubeUrl = (url: string) =>
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url);

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
    if (!isYouTubeUrl(videoUrl)) {
      setError('Please provide a valid public/unlisted YouTube URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOriginalScript('');
    setRephrasedScript('');

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Per docs: pass YouTube URL as a fileData part (preview feature)
      const youtubePart: FileDataPart = {
        fileData: {
          fileUri: videoUrl,
        },
      };

      // 1) Transcribe with explicit, clear instruction and short response to reduce failures
      const transcribeResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              youtubePart,
              {
                text:
                  'Transcribe the speech in this YouTube video in the original language. ' +
                  'Return only the transcript text without extra commentary.',
              } as TextPart,
            ],
          },
        ],
      });

      // Access the response text correctly
      const transcription = transcribeResp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      
      if (!transcription) {
        // Fallback: ask for a 3-sentence summary if full transcript fails
        const summaryResp = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                youtubePart,
                { text: 'Summarize this video in 3-5 sentences.' } as TextPart,
              ],
            },
          ],
        });
        
        const summary = summaryResp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (!summary) {
          throw new Error(
            'Empty response from transcription and summary fallback.'
          );
        }
        setOriginalScript(summary);
        // Rephrase the summary instead
        const rephraseSummaryResp = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text:
                    'Rephrase the following text. Keep the meaning, ' +
                    'change wording and structure. Return only the rephrased text.',
                },
                { text: summary },
              ],
            },
          ],
        });
        setRephrasedScript(rephraseSummaryResp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '');
        setIsLoading(false);
        return;
      }

      setOriginalScript(transcription);

      // 2) Rephrase transcript with strict instruction
      const rephraseResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text:
                  'Rephrase the following transcript. Keep the core meaning ' +
                  'and technical accuracy, but change wording and sentence structure. ' +
                  'Return only the rephrased transcript text.',
              },
              { text: transcription },
            ],
          },
        ],
      });

      const rephrased = rephraseResp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      setRephrasedScript(rephrased);
    } catch (e: any) {
      console.error(e);
      const msg =
        (e && e.message) ||
        'Failed to process the video. Ensure the API key is valid and the URL is public.';
      setError(msg);
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
              className="w-full h-48 p-2 border rounded"
              placeholder="Original video script will appear here..."
            />
          </div>
          <div>
            <h3 className="font-bold mb-2">Rephrased Script</h3>
            <textarea
              value={rephrasedScript}
              readOnly
              className="w-full h-48 p-2 border rounded"
              placeholder="Rephrased script will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRephraser;