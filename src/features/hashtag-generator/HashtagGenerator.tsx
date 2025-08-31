import { useState } from 'react';

const HashtagGenerator = ({ lang, t }: { lang: 'ar' | 'en'; t: any }) => {
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
          {t.hashtagGenerator.label}
        </label>
        <textarea
          className="textarea textarea-bordered textarea-lg w-full resize-none"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.hashtagGenerator.placeholder}
        ></textarea>
        <div className="label justify-start">
          <span className="label-text-alt text-sm opacity-70">
            {t.hashtagGenerator.characters.replace('{count}', text.length.toString())}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <button
          className="btn btn-red-600 btn-lg"
          onClick={generateHashtags}
          disabled={!text.trim()}
        >
          {t.hashtagGenerator.generate}
        </button>
        <button
          className="btn btn-outline btn-lg"
          onClick={() => {
            setText('');
            setHashtags([]);
          }}
          disabled={!text.trim()}
        >
          {t.hashtagGenerator.clear}
        </button>
      </div>

      {hashtags.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{t.hashtagGenerator.generatedTitle}</h3>
              <p className="text-sm opacity-70">
                {t.hashtagGenerator.found.replace('{count}', hashtags.length.toString())}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-red-600 btn-sm"
                onClick={() => navigator.clipboard.writeText(hashtags.join(' '))}
              >
                {t.hashtagGenerator.copyAll}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigator.clipboard.writeText(hashtags.slice(0, 10).join(' '))}
              >
                {t.hashtagGenerator.copyTop10}
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <span 
                key={index} 
                className="badge badge-primary badge-lg"
                onClick={() => navigator.clipboard.writeText(tag)}
              >
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