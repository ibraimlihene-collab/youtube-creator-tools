import React, { useState } from 'react';

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
    <div>
      <textarea
        className="textarea textarea-bordered w-full"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text here..."
      ></textarea>
      <button className="btn btn-primary mt-4" onClick={generateHashtags}>
        Generate Hashtags
      </button>
      {hashtags.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Generated Hashtags:</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigator.clipboard.writeText(hashtags.join(' '))}
            >
              Copy
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {hashtags.map((tag, index) => (
              <span key={index} className="badge badge-lg badge-outline">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagGenerator;