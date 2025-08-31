import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ApiKeyInput from '../../components/ApiKeyInput';

const DescriptionGenerator = ({ t }: { t?: any }) => {
  const [apiKey, setApiKey] = useState('');
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('engaging');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDescription = async () => {
    if (!apiKey || !title) {
      alert('Please provide an API key and a video title.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedDescription('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Create prompt based on user inputs
      let prompt = `Write a compelling YouTube video description for a video titled "${title}".`;
      
      if (keywords) {
        prompt += ` Include these keywords naturally: ${keywords}.`;
      }
      
      prompt += ` Use a ${tone} tone. The description should include:
1. An engaging opening that hooks the viewer
2. A summary of what the video covers
3. Timestamps for key sections (if applicable)
4. Links to relevant resources
5. A call-to-action to like, comment, and subscribe
6. Relevant hashtags at the end`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });

      const description = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      setGeneratedDescription(description);
    } catch (e: any) {
      console.error(e);
      const msg = (e && e.message) || 'Failed to generate description. Please check your API key and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Description Generator</h2>
      <div className="flex flex-col gap-4">
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Video Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your video title"
            className="input input-bordered"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Keywords (comma separated)</span>
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Enter keywords (e.g., tutorial, how-to, tips)"
            className="input input-bordered"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Tone</span>
          </label>
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            className="select select-bordered"
          >
            <option value="engaging">Engaging</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="entertaining">Entertaining</option>
          </select>
        </div>
        
        <button
          onClick={handleGenerateDescription}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Generating...' : 'Generate Description'}
        </button>
        
        {error && <div className="text-red-500 mt-2">{error}</div>}
        
        {generatedDescription && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Generated Description</h3>
            <div className="bg-base-10 p-4 rounded-lg border border-base-300">
              <textarea
                value={generatedDescription}
                readOnly
                className="w-full h-96 textarea textarea-bordered"
                placeholder="Your generated description will appear here..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionGenerator;