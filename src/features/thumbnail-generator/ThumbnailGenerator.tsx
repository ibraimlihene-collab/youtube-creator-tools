import { useState, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import ApiKeyInput from '../../components/ApiKeyInput';

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
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]); // Return only base64 data
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


type InlineImagePart = {
  inlineData: {
    mimeType: string;
    data: string; // base64 without data: prefix
  };
};
type TextPart = { text: string };
type ContentPart = InlineImagePart | TextPart;

const ThumbnailGenerator = ({ t }: { t?: any }) => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!apiKey || !prompt) {
      alert('Please provide an API key and a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      // Initialize new SDK with options object
      const ai = new GoogleGenAI({ apiKey });

      type InlineImagePart = {
        inlineData: { mimeType: string; data: string };
      };
      type TextPart = { text: string };
      type ContentPart = InlineImagePart | TextPart;

      const contentParts: ContentPart[] = [{ text: prompt }];

      if (referenceUrl) {
        const videoId = getYouTubeVideoId(referenceUrl);
        if (videoId) {
          const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          try {
            const base64ImageData = await fetchImageAsBase64(thumbnailUrl);
            const imagePart: InlineImagePart = {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64ImageData, // already base64 without prefix
                  },
                };
            contentParts.push(imagePart);
          } catch (imgError) {
            console.error("Could not fetch reference thumbnail:", imgError);
            setError("Could not fetch the reference thumbnail. The max resolution might not be available. Please check the YouTube URL.");
            setIsLoading(false);
            return;
          }
        } else {
          setError("Invalid YouTube URL provided.");
          setIsLoading(false);
          return;
        }
      }

      // Call image generation model per latest docs
      const genResp = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts: contentParts as any }],
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
        setError("The model did not return any images. Try a more explicit prompt like 'generate an image of ...'.");
      }

    } catch (e) {
      console.error(e);
      setError('Failed to generate images. Please check your API key and prompt, or see the console for more details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Thumbnail Generator</h2>
      <div className="flex flex-col gap-4">
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt (e.g., 'a futuristic city at night')"
          className="p-2 border rounded h-24"
        />
        <input
          type="text"
          value={referenceUrl}
          onChange={(e) => setReferenceUrl(e.target.value)}
          placeholder="Reference YouTube URL (optional)"
          className="p-2 border rounded"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-blue-50 text-white p-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate Thumbnails'}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {generatedImages.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Generated Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generatedImages.map((src, index) => (
                <img key={index} src={src} alt={`Generated thumbnail ${index + 1}`} className="rounded shadow-lg" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailGenerator;