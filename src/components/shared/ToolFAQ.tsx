import React, { useState } from 'react';

type ToolFAQProps = {
  toolId: string;
  t: any;
};

const ToolFAQ = ({ toolId, t }: ToolFAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Define FAQs for each tool
  const toolFaqs: Record<string, { question: string; answer: string }[]> = {
    silenceRemover: [
      {
        question: t.landingPage?.faqs?.silenceRemoverQuestion1 || "How does the Silence Remover work?",
        answer: t.landingPage?.faqs?.silenceRemoverAnswer1 || "Our Silence Remover uses advanced audio analysis to detect silent portions in your videos. You can adjust the sensitivity and duration settings to customize which silences are removed."
      },
      {
        question: t.landingPage?.faqs?.silenceRemoverQuestion2 || "Does this tool work with all video formats?",
        answer: t.landingPage?.faqs?.silenceRemoverAnswer2 || "Yes, our tool supports all major video formats including MP4, MOV, AVI, and more. The processing happens entirely in your browser, so your files never leave your computer."
      },
      {
        question: t.landingPage?.faqs?.silenceRemoverQuestion3 || "Is my video uploaded to any server?",
        answer: t.landingPage?.faqs?.silenceRemoverAnswer3 || "No, all processing happens locally in your browser. Your videos are never uploaded to any server, ensuring complete privacy and security."
      }
    ],
    cpmCalculator: [
      {
        question: t.landingPage?.faqs?.cpmCalculatorQuestion1 || "How accurate is the CPM Calculator?",
        answer: t.landingPage?.faqs?.cpmCalculatorAnswer1 || "Our CPM Calculator provides industry-standard estimates based on niche and geographic data. While not 100% accurate, it gives you a solid baseline for earnings expectations."
      },
      {
        question: t.landingPage?.faqs?.cpmCalculatorQuestion2 || "What factors affect my actual CPM?",
        answer: t.landingPage?.faqs?.cpmCalculatorAnswer2 || "Several factors affect your CPM including content quality, audience engagement, ad performance, advertiser demand, and seasonal trends. Our calculator provides a baseline estimate."
      },
      {
        question: t.landingPage?.faqs?.cpmCalculatorQuestion3 || "How often should I check my CPM?",
        answer: t.landingPage?.faqs?.cpmCalculatorAnswer3 || "We recommend checking your CPM quarterly to track trends and adjust your content strategy accordingly. CPM can vary significantly based on seasonal factors and market changes."
      }
    ],
    hashtagGenerator: [
      {
        question: t.landingPage?.faqs?.hashtagGeneratorQuestion1 || "How does the Hashtag Generator create relevant hashtags?",
        answer: t.landingPage?.faqs?.hashtagGeneratorAnswer1 || "Our Hashtag Generator analyzes your content using natural language processing to identify key topics and themes. It then matches these with popular, relevant hashtags in your niche."
      },
      {
        question: t.landingPage?.faqs?.hashtagGeneratorQuestion2 || "Should I use all the suggested hashtags?",
        answer: t.landingPage?.faqs?.hashtagGeneratorAnswer2 || "We recommend using 5-10 of the most relevant hashtags rather than all suggestions. Quality and relevance matter more than quantity for hashtag performance."
      },
      {
        question: t.landingPage?.faqs?.hashtagGeneratorQuestion3 || "Can I save my favorite hashtags?",
        answer: t.landingPage?.faqs?.hashtagGeneratorAnswer3 || "Yes, you can copy and save your favorite hashtags for future use. We're also working on a feature to save hashtag sets for different content types."
      }
    ],
    thumbnailDownloader: [
      {
        question: t.landingPage?.faqs?.thumbnailDownloaderQuestion1 || "Is it legal to download YouTube thumbnails?",
        answer: t.landingPage?.faqs?.thumbnailDownloaderAnswer1 || "Downloading YouTube thumbnails for personal use or inspiration is generally acceptable. However, using them commercially without permission may violate copyright laws."
      },
      {
        question: t.landingPage?.faqs?.thumbnailDownloaderQuestion2 || "What resolutions are available?",
        answer: t.landingPage?.faqs?.thumbnailDownloaderAnswer2 || "YouTube provides thumbnails in multiple resolutions: 120x90, 320x180, 480x360, 640x480, and up to 1280x720 for maxresdefault."
      },
      {
        question: t.landingPage?.faqs?.thumbnailDownloaderQuestion3 || "Can I download thumbnails from private videos?",
        answer: t.landingPage?.faqs?.thumbnailDownloaderAnswer3 || "No, you can only download thumbnails from publicly accessible videos. Private or unlisted videos require proper authentication which our tool doesn't support."
      }
    ],
    titleGenerator: [
      {
        question: t.landingPage?.faqs?.titleGeneratorQuestion1 || "How does the Title Generator create effective titles?",
        answer: t.landingPage?.faqs?.titleGeneratorAnswer1 || "Our Title Generator uses AI trained on successful YouTube titles to create attention-grabbing headlines. It considers factors like keyword optimization, emotional triggers, and searchability."
      },
      {
        question: t.landingPage?.faqs?.titleGeneratorQuestion2 || "What title styles are available?",
        answer: t.landingPage?.faqs?.titleGeneratorAnswer2 || "We offer several title styles including clickbait, informative, curiosity-driven, how-to, and list-based formats. Each is optimized for different content types and audience preferences."
      },
      {
        question: t.landingPage?.faqs?.titleGeneratorQuestion3 || "Can I customize the generated titles?",
        answer: t.landingPage?.faqs?.titleGeneratorAnswer3 || "Absolutely! The generated titles are meant as starting points. Feel free to modify them to better match your content and personal style."
      }
    ]
    // Add more tools as needed
  };

  // Default FAQs if specific ones aren't defined
  const defaultFaqs = [
    {
      question: t.landingPage?.faqs?.toolQuestion1 || "Are these tools really free to use?",
      answer: t.landingPage?.faqs?.toolAnswer1 || "Yes, all our tools are completely free to use. We believe in helping creators grow their channels without financial barriers."
    },
    {
      question: t.landingPage?.faqs?.toolQuestion2 || "Do I need to create an account?",
      answer: t.landingPage?.faqs?.toolAnswer2 || "No account is needed. All tools work directly in your browser with no sign-up required."
    },
    {
      question: t.landingPage?.faqs?.toolQuestion3 || "Is my data safe when using these tools?",
      answer: t.landingPage?.faqs?.toolAnswer3 || "Absolutely. All processing happens locally in your browser. We never upload your videos, images, or text to any server."
    }
  ];

  const faqs = toolFaqs[toolId] || defaultFaqs;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mt-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          {t.landingPage?.frequentlyAsked || 'Frequently Asked Questions'}
        </h2>
        <p className="text-base-content/80 max-w-2xl mx-auto">
          {t.landingPage?.frequentlyAskedDesc || 'Everything you need to know about this tool.'}
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="glass-effect rounded-2xl overflow-hidden"
          >
            <button
              className="flex justify-between items-center w-full p-6 text-left"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-bold">{faq.question}</h3>
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-6 pt-2 border-t border-base-300/50">
                <p className="text-base-content/80">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ToolFAQ;