import { useState } from 'react';

const HashtagGenerator = ({ lang }: { lang: 'ar' | 'en' }) => {
  const [text, setText] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);

  const generateHashtags = () => {
    const commonWordsEn = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how']);
    const commonWordsAr = new Set(['من', 'في', 'على', 'إلى', 'عن', 'و', 'أو', 'لكن', 'ب', 'ل', 'ك', 'هو', 'هي', 'هم', 'هن', 'أنا', 'أنت', 'أنتم', 'أنتن', 'نحن', 'هذا', 'هذه', 'هؤلاء', 'ذلك', 'تلك', 'أولئك', 'كان', 'يكون', 'سوف', 'قد', 'لقد', 'ما', 'ماذا', 'من', 'كيف', 'أين', 'متى', 'لماذا', 'هل', 'لا', 'نعم']);

    const commonWords = lang === 'ar' ? commonWordsAr : commonWordsEn;
    const regex = lang === 'ar' ? /[^a-zA-Z0-9\u0600-\u06FF\s]/g : /[^a-z\s]/g;
    const words = text.toLowerCase().replace(regex, '').split(/\s+/);
    const wordCounts = words.reduce((acc, word) => {
      if (word && !commonWords.has(word)) {
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
    const topWords = sortedWords.slice(0, 10).map(entry => `#${entry[0]}`);
    setHashtags(topWords);
  };

  return (
    <div className="space-y-6">
      <div className="form-control">
        <label className="label label-text font-medium mb-2">
          Enter your text here
        </label>
        <textarea
          className="textarea textarea-bordered textarea-lg w-full resize-none"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your content here to generate relevant hashtags..."
        ></textarea>
        <div className="label justify-start">
          <span className="label-text-alt text-sm opacity-70">
            {text.length} characters
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <button
          className="btn btn-primary btn-lg"
          onClick={generateHashtags}
          disabled={!text.trim()}
        >
          Generate Hashtags
        </button>
        <button
          className="btn btn-outline btn-lg"
          onClick={() => {
            setText('');
            setHashtags([]);
          }}
          disabled={!text.trim()}
        >
          Clear
        </button>
      </div>

      {hashtags.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Generated Hashtags</h3>
              <p className="text-sm opacity-70">
                Found {hashtags.length} relevant hashtags
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigator.clipboard.writeText(hashtags.join(' '))}
              >
                Copy All
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigator.clipboard.writeText(hashtags.slice(0, 10).join(' '))}
              >
                Copy Top 10
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {hashtags.map((tag, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="badge badge-lg badge-outline cursor-pointer hover:badge-primary transition-all duration-200 transform hover:scale-105">
                  {tag}
                </div>
                <button
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 btn btn-ghost btn-xs btn-circle"
                  onClick={() => navigator.clipboard.writeText(tag)}
                  title="Copy hashtag"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="alert alert-info">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pro tip: Use a mix of popular and niche hashtags for better reach!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagGenerator;