import { useState, useCallback } from 'react';
import { useAI } from '../../lib/useAI';
import ApiKeyInput from '../../components/ApiKeyInput';
import ToolNavigation from '../../components/shared/ToolNavigation';

interface VideoRephraserProps {
  t?: Record<string, any>;
}

const isYouTubeUrl = (url: string) =>
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url);

const VideoRephraser = ({ t }: VideoRephraserProps) => {
  const [apiKey, setApiKey] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [originalScript, setOriginalScript] = useState('');
  const { data: rephrasedScript, isLoading, error, generate, reset } = useAI<string>();

  const handleProcessVideo = useCallback(async () => {
    if (!apiKey || !videoUrl) {
      alert(t?.videoRephraser?.missingFields || 'Please provide an API key and a YouTube video URL.');
      return;
    }
    if (!isYouTubeUrl(videoUrl)) {
      alert(t?.videoRephraser?.invalidUrl || 'Please provide a valid YouTube URL.');
      return;
    }

    setOriginalScript('');
    reset();

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      // Transcribe
      const transcribeResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [
            { fileData: { fileUri: videoUrl } },
            { text: 'Transcribe the speech in this YouTube video. Return only the transcript text.' }
          ]
        }]
      });

      const transcription = transcribeResp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      
      if (!transcription) {
        throw new Error('Failed to transcribe video. The video may not be publicly accessible.');
      }
      
      setOriginalScript(transcription);

      // Rephrase
      await generate(apiKey, 
        `Rephrase the following transcript. Keep the core meaning but change wording and structure.\n\n${transcription}`,
        'gemini-2.5-flash',
        (text) => text
      );
    } catch (e: any) {
      console.error(e);
      // Error handled by useAI hook
    }
  }, [apiKey, videoUrl, generate, reset, t]);

  return (
    <div className="p-4">
      <ToolNavigation currentTool="videoRephraser" t={t} />
      
      <h2 className="text-2xl font-bold mb-4">{t?.app?.tools?.videoRephraser?.title || 'Video Rephraser'}</h2>
      
      <div className="flex flex-col gap-4">
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.videoRephraser?.urlLabel || 'YouTube Video URL'}</span>
          </label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={t?.videoRephraser?.urlPlaceholder || 'Enter YouTube Video URL (public/unlisted)'}
            className="input input-bordered"
          />
        </div>
        
        <button
          className="btn btn-primary"
          onClick={handleProcessVideo}
          disabled={isLoading || !apiKey || !videoUrl}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              {t?.videoRephraser?.processing || 'Processing...'}
            </>
          ) : (
            t?.videoRephraser?.process || 'Process Video'
          )}
        </button>

        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error.message}</span>
          </div>
        )}
        
        {(originalScript || rephrasedScript) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">{t?.videoRephraser?.original || 'Original Script'}</h3>
                <textarea
                  value={originalScript}
                  readOnly
                  className="textarea textarea-bordered w-full min-h-[200px]"
                  placeholder="Original video script will appear here..."
                />
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h3 className="card-title text-lg">{t?.videoRephraser?.rephrased || 'Rephrased Script'}</h3>
                  {rephrasedScript && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigator.clipboard.writeText(rephrasedScript)}
                    >
                      Copy
                    </button>
                  )}
                </div>
                <textarea
                  value={rephrasedScript || ''}
                  readOnly
                  className="textarea textarea-bordered w-full min-h-[200px]"
                  placeholder="Rephrased script will appear here..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRephraser;
