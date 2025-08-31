import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ApiKeyInput from '../../components/ApiKeyInput';

const ScriptWriter = ({ t }: { t?: any }) => {
  const [apiKey, setApiKey] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [length, setLength] = useState('medium');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScript = async () => {
    if (!apiKey || !topic) {
      alert('Please provide an API key and a topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedScript('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Create prompt based on user inputs
      let prompt = `Write a YouTube video script about "${topic}" in a ${tone} tone.`;
      
      switch (length) {
        case 'short':
          prompt += ' Keep it concise, around 1-2 minutes when read aloud.';
          break;
        case 'medium':
          prompt += ' Make it detailed enough for a 3-5 minute video.';
          break;
        case 'long':
          prompt += ' Make it comprehensive, suitable for a 10+ minute video.';
          break;
      }
      
      prompt += ' Include an engaging introduction, main content with clear sections, and a compelling conclusion. Format it clearly with headings for different sections.';

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });

      const script = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      setGeneratedScript(script);
    } catch (e: any) {
      console.error(e);
      const msg = (e && e.message) || 'Failed to generate script. Please check your API key and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Script Writer</h2>
      <div className="flex flex-col gap-4">
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Video Topic</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your video topic (e.g., 'How to bake a cake')"
            className="input input-bordered"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Tone</span>
            </label>
            <select 
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
              className="select select-bordered"
            >
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="educational">Educational</option>
              <option value="entertaining">Entertaining</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Length</span>
            </label>
            <select 
              value={length} 
              onChange={(e) => setLength(e.target.value)}
              className="select select-bordered"
            >
              <option value="short">Short (1-2 min)</option>
              <option value="medium">Medium (3-5 min)</option>
              <option value="long">Long (10+ min)</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleGenerateScript}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Generating...' : 'Generate Script'}
        </button>
        
        {error && <div className="text-red-500 mt-2">{error}</div>}
        
        {generatedScript && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Generated Script</h3>
            <div className="bg-base-10 p-4 rounded-lg border border-base-300">
              <textarea
                value={generatedScript}
                readOnly
                className="w-full h-96 textarea textarea-bordered"
                placeholder="Your generated script will appear here..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptWriter;