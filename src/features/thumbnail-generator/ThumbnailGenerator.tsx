import { useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import ApiKeyInput from '../../components/ApiKeyInput';
import ToolNavigation from '../../components/shared/ToolNavigation';

interface ThumbnailGeneratorProps {
  t?: Record<string, any>;
}

// Helper function to get video ID from YouTube URL
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper function to fetch image as base64
const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const ThumbnailGenerator = ({ t }: ThumbnailGeneratorProps) => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!apiKey || !prompt) {
      alert(t?.thumbnailGenerator?.missingFields || 'Please provide an API key and a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const ai = new GoogleGenAI({ apiKey });

      const contentParts: any[] = [{ text: prompt }];

      if (referenceUrl) {
        const videoId = getYouTubeVideoId(referenceUrl);
        if (videoId) {
          const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          try {
            const base64ImageData = await fetchImageAsBase64(thumbnailUrl);
            contentParts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
              },
            });
          } catch (imgError) {
            console.error("Could not fetch reference thumbnail:", imgError);
            setError("Could not fetch the reference thumbnail. The max resolution might not be available.");
            setIsLoading(false);
            return;
          }
        } else {
          setError("Invalid YouTube URL provided.");
          setIsLoading(false);
          return;
        }
      }

      const genResp = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts: contentParts }],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const candidates = genResp.candidates ?? [];
      const images: string[] = [];
      for (const cand of candidates) {
        const parts = (cand as any)?.content?.parts ?? [];
        for (const part of parts) {
          if (part?.inlineData?.data && part?.inlineData?.mimeType) {
            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          }
        }
      }

      if (images.length > 0) {
        setGeneratedImages(images);
      } else {
        setError("The model did not return any images. Try a more explicit prompt.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to generate images. Please check your API key and prompt.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, prompt, referenceUrl, t]);

  return (
    <div className="p-4">
      <ToolNavigation currentTool="thumbnailGenerator" t={t} />
      
      <h2 className="text-2xl font-bold mb-4">{t?.app?.tools?.thumbnailGenerator?.title || 'Thumbnail Generator'}</h2>
      
      <div className="flex flex-col gap-4">
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.thumbnailGenerator?.promptLabel || 'Prompt'}</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t?.thumbnailGenerator?.promptPlaceholder || "Describe your thumbnail (e.g., 'a futuristic city at night')"}
            className="textarea textarea-bordered min-h-[100px]"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.thumbnailGenerator?.referenceLabel || 'Reference YouTube URL (optional)'}</span>
          </label>
          <input
            type="text"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder={t?.thumbnailGenerator?.referencePlaceholder || "Enter a YouTube URL for style reference"}
            className="input input-bordered"
          />
        </div>
        
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={isLoading || !apiKey || !prompt}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              {t?.thumbnailGenerator?.generating || 'Generating...'}
            </>
          ) : (
            t?.thumbnailGenerator?.generate || 'Generate Thumbnails'
          )}
        </button>

        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {generatedImages.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">{t?.thumbnailGenerator?.generatedTitle || 'Generated Images'}</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setGeneratedImages([])}
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((src, index) => (
                <div key={index} className="card bg-base-200 shadow-lg">
                  <figure className="px-4 pt-4">
                    <img src={src} alt={`Generated thumbnail ${index + 1}`} className="rounded-lg w-full" />
                  </figure>
                  <div className="card-body p-4">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = src;
                        link.download = `thumbnail-${index + 1}.png`;
                        link.click();
                      }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailGenerator;
