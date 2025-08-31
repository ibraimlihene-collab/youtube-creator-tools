import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ApiKeyInput from '../../components/ApiKeyInput';

const TitleGenerator = ({ t }: { t?: any }) => {
  const [apiKey, setApiKey] = useState('');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('clickbait');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTitles = async () => {
    if (!apiKey || !topic) {
      alert('Please provide an API key and a topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedTitles([]);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Create prompt based on user inputs
      let prompt = `Generate 5 catchy YouTube video titles for a video about "${topic}".`;
      
      if (keywords) {
        prompt += ` Incorporate these keywords naturally: ${keywords}.`;
      }
      
      prompt += ` Use a ${tone} style. Make them attention-grabbing and optimized for search.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });

      const titlesText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      
      // Split the response into individual titles
      // Assuming titles are separated by newlines or numbered
      const titles = titlesText
        .split(/\n+/)
        .map(title => title.trim())
        .filter(title => title.length > 0)
        .map(title => title.replace(/^\d+\.\s*/, '')); // Remove numbering if present
      
      setGeneratedTitles(titles.slice(0, 5)); // Limit to 5 titles
    } catch (e: any) {
      console.error(e);
      const msg = (e && e.message) || 'Failed to generate titles. Please check your API key and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Title Generator</h2>
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
            placeholder="Enter your video topic"
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
            <span className="label-text font-medium">Style</span>
          </label>
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            className="select select-bordered"
          >
            <option value="clickbait">Clickbait</option>
            <option value="informative">Informative</option>
            <option value="curiosity">Curiosity</option>
            <option value="howto">How-to</option>
            <option value="list">List-based</option>
          </select>
        </div>
        
        <button
          onClick={handleGenerateTitles}
          disabled={isLoading}
          className="btn btn-red-600"
        >
          {isLoading ? 'Generating...' : 'Generate Titles'}
        </button>
        
        {error && <div className="text-red-500 mt-2">{error}</div>}
        
        {generatedTitles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Generated Titles</h3>
            <div className="space-y-3">
              {generatedTitles.map((title, index) => (
                <div key={index} className="p-3 bg-base-10 rounded-lg border border-base-300">
                  <p className="font-medium">{title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleGenerator;