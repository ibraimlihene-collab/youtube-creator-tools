/**
 * Compact, token-efficient prompts per tool.
 * Rules: short system-like instructions, structured output, language aware.
 */

function langLine(lang) {
  if (lang === 'ar') return 'Respond in Arabic. Use clear creator-friendly language.';
  return 'Respond in English. Clear, practical creator language.';
}

function limit(s, n = 4000) {
  return String(s || '').slice(0, n);
}

export function buildPrompt(toolId, input = {}, lang = 'en') {
  const L = langLine(lang);
  let topic = limit(input.topic || input.text || input.script || '', 3000);
  if (input.youtube?.title) {
    topic = limit(`${topic}\n\n[YouTube: ${input.youtube.title}${input.youtube.author ? ' by ' + input.youtube.author : ''}]`, 3000);
  }
  const extra = limit(input.extra || input.keywords || input.notes || '', 800);
  const tone = input.tone || 'professional';
  const niche = limit(input.niche || '', 200);
  const audience = limit(input.audience || '', 200);
  const count = Math.min(Number(input.count) || 8, 20);

  const base = {
    hashtagGenerator: `OUTPUT RULES (strict):
- Return ONLY hashtags
- Exactly one hashtag per line
- Each line MUST start with #
- No bullets, no numbering, no commentary, no markdown
Language: ${lang === 'ar' ? 'Arabic hashtags preferred' : 'English'}
Generate ${count} YouTube hashtags for:
"""${topic}"""
Mix broad + niche.`,

    titleGenerator: `OUTPUT RULES (strict):
- Return ONLY titles
- One title per line
- No numbering, bullets, or commentary
Language: ${lang === 'ar' ? 'Arabic' : 'English'}
Generate ${count} YouTube titles about "${topic}".
Keywords: ${extra || 'n/a'}. Tone: ${tone}.
Under ~70 characters when possible.`,

    descriptionGenerator: `${L}
Write an SEO YouTube description for: "${topic}".
Keywords: ${extra || 'n/a'}.
Include: hook (2 lines), value bullets, timestamps placeholder, CTA, 8-12 hashtags.
Plain text only.`,

    scriptWriter: `${L}
Write a YouTube script on "${topic}" for audience: ${audience || 'general'}.
Tone: ${tone}. Length: ${input.length || 'medium'} (~${input.length === 'short' ? '90s' : input.length === 'long' ? '12-15 min' : '6-8 min'} spoken).
Structure: HOOK, INTRO, 3-5 SECTIONS with spoken lines, CTA, OUTRO.
No stage directions clutter. Plain text.`,

    videoRephraser: `${L}
Rewrite this YouTube script to be original, clearer, and higher retention.
Keep meaning. Improve hooks and transitions.
---
${topic}
---
Return full rewritten script only.`,

    tagsFromTitle: `${L}
From this title, output 20 YouTube tags (comma-separated, no #):
"${topic}"`,

    hookGenerator: `${L}
Write ${count} cold-open hooks (1-2 sentences each) for a video about "${topic}". One per line.`,

    ctaGenerator: `${L}
Write ${count} YouTube CTAs (subscribe/like/comment/playlist) for "${topic}". One per line.`,

    pinCommentGenerator: `${L}
Write ${count} pin-comment ideas for a video about "${topic}". Engaging, question-led. One per line.`,

    endScreenIdeas: `${L}
Suggest ${count} end-screen layouts/ideas for "${topic}" (what to promote + why). Numbered list.`,

    chapterGenerator: `${L}
Create YouTube chapters (timestamp + title) for a video about "${topic}".
Assume ~${input.duration || '10'} minutes. Format: 0:00 Title`,

    seoKeywordExpander: `${L}
Expand SEO keywords for YouTube niche "${topic}".
Return 3 groups: Primary (5), Secondary (10), Long-tail (10). Bullet lists only.`,

    nicheIdeas: `${L}
Suggest ${count} profitable YouTube niche angles related to "${topic || niche}".
For each: niche name | audience | content format | why it works. Compact bullets.`,

    videoIdeas: `${L}
Generate ${count} video ideas for channel about "${topic}".
Each: Title | Format | Hook angle | Why it ranks. Numbered.`,

    seriesPlanner: `${L}
Plan a ${count}-episode YouTube series on "${topic}" for ${audience || 'general audience'}.
Each episode: title, goal, outline (3 bullets), CTA. Compact markdown.`,

    shortScript: `${L}
Write a YouTube Shorts/TikTok-style script (~45-60s) on "${topic}".
Format: HOOK (0-3s), BODY beats, CTA. Spoken lines only.`,

    longScriptOutline: `${L}
Create a detailed outline for a long-form video on "${topic}".
Include: promise, research notes placeholders, section beats, B-roll cues, CTA map.`,

    translateScript: `${L}
Translate this script to ${lang === 'ar' ? 'Arabic' : 'English'} for YouTube delivery. Keep timing/energy.
---
${topic}
---`,

    simplifyScript: `${L}
Simplify this script for spoken delivery (shorter sentences, clearer words):
---
${topic}
---`,

    toneRewriter: `${L}
Rewrite in a ${tone} tone for YouTube:
---
${topic}
---`,

    thumbnailTextIdeas: `${L}
Suggest ${count} short thumbnail text phrases (2-5 words) for "${topic}". High emotion/curiosity. One per line.`,

    abTitleTest: `${L}
Create 5 A/B title pairs for "${topic}".
Format: A: ... | B: ... | Hypothesis: ...`,

    abThumbnailCopy: `${L}
Create 5 A/B thumbnail text pairs for "${topic}".
Format: A: ... | B: ... | Emotion contrast: ...`,

    competitorTitleAnalysis: `${L}
Analyze these competitor titles and propose better alternatives:
${topic}
Return: patterns found, gaps, 8 improved titles.`,

    commentReplyIdeas: `${L}
Suggest ${count} creator replies to comments about "${topic}". Friendly, brand-safe. One per line.`,

    communityPostIdeas: `${L}
Write ${count} YouTube Community post ideas for "${topic}". Mix polls, images, questions. Numbered.`,

    pollIdeas: `${L}
Create ${count} Community poll questions with 3-4 options each about "${topic}".`,

    livestreamOutline: `${L}
Outline a live stream on "${topic}": schedule blocks, interaction prompts, mods notes, end CTA.`,

    podcastToYoutube: `${L}
Turn this podcast/notes into a YouTube video plan (title, chapters, cuts, shorts clips):
---
${topic}
---`,

    blogToYoutube: `${L}
Convert this blog/article into a YouTube script outline + title pack:
---
${topic}
---`,

    faqFromTopic: `${L}
List ${count} FAQs viewers ask about "${topic}" with short answers (2-3 sentences).`,

    mythBusterAngles: `${L}
List ${count} myth-busting video angles about "${topic}". Title + one-line promise each.`,

    controversySafeAngles: `${L}
Suggest ${count} high-curiosity but brand-safe angles on "${topic}". Avoid harm/misinfo. Title + framing notes.`,

    audiencePersona: `${L}
Build 3 audience personas for a channel about "${topic}".
Each: name, goals, pains, content they binge, objections, language tips.`,

    contentCalendar: `${L}
Build a 30-day YouTube content calendar for "${topic}".
3 posts/week max. Columns: Day | Type (long/short/community) | Title | Goal.`,

    uploadChecklist: `${L}
Produce a pre-upload checklist for a video about "${topic}" (SEO, assets, compliance, end screens). Checkbox markdown.`,

    retentionHooks: `${L}
Write ${count} mid-video retention hooks/pattern interrupts for "${topic}". One per line.`,

    coldOpenWriter: `${L}
Write 5 cold opens (15-25 seconds spoken) for "${topic}". Label 1-5.`,

    storyBeatSheet: `${L}
Create a story beat sheet (Save the Cat style, simplified) for a YouTube story video on "${topic}".`,

    productReviewStructure: `${L}
Structure a product review video for "${topic}": sections, tests, honesty rules, CTA, affiliate disclaimer text.`,

    tutorialStepWriter: `${L}
Write a step-by-step tutorial script for "${topic}". Numbered steps with spoken lines + tip callouts.`,

    listicleWriter: `${L}
Write a top-${count} listicle script about "${topic}". Countdown style with mini-hooks between items.`,

    newsReactionScript: `${L}
Write a responsible news-reaction script outline for: "${topic}". Facts first, opinion labeled, sources reminder.`,

    gamingCommentary: `${L}
Write gaming commentary beats for "${topic}" (highlight moments, jokes cadence, subscribe timing).`,

    vlogDayStructure: `${L}
Plan a day-in-the-life vlog structure themed "${topic}" with shot list and voiceover prompts.`,

    brandDealPitch: `${L}
Write a brand deal pitch email + one-pager bullets for a creator in "${topic}" niche. Audience: ${audience || 'n/a'}.`,

    mediaKitBio: `${L}
Write 3 channel bios (short/medium/long) + media kit blurb for "${topic}".`,

    channelAboutSeo: `${L}
Write an SEO-optimized YouTube About section for a channel about "${topic}". Include keywords naturally.`,

    playlistStrategy: `${L}
Design playlist strategy for "${topic}": 5 playlists, naming, order logic, SEO titles.`,

    shortFormHooks: `${L}
Write ${count} Shorts hooks (first line on screen + spoken) for "${topic}".`,

    captionImprover: `${L}
Improve these captions for clarity and accessibility (fix typos, punctuation):
---
${topic}
---`,

    srtCleaner: `${L}
Clean this transcript/SRT-like text into readable captions (merge fragments, fix casing):
---
${topic}
---`,

    multilingualTitlePack: `${L}
Create title packs (5 each) in English and Arabic for "${topic}". Label EN/AR.`,

    trendAngleAdapter: `${L}
Adapt trend "${extra || 'current trend'}" into ${count} video angles for niche "${topic}".`,

    evergreenRefresh: `${L}
Propose how to refresh an evergreen video on "${topic}": new title, intro, chapters, thumbnail text, update notes.`,

    ctaTimestampPlan: `${L}
Plan CTA timestamps for a ${input.duration || '10'} min video on "${topic}". List time → CTA type.`,

    sponsorshipRead: `${L}
Write a natural 20-30s sponsorship read integrated into a video about "${topic}". Brand: ${extra || 'BRAND'}.`,

    disclaimerGenerator: `${L}
Write platform-safe disclaimers for a video about "${topic}" (affiliate, advice, AI). Short variants.`,

    communityGuidelinesSafe: `${L}
Rewrite this idea to be Community Guidelines-safe while keeping curiosity:
---
${topic}
---`,

    thumbnailEmotionWords: `${L}
List ${count} high-emotion single words/short phrases for thumbnails about "${topic}".`,

    colorMoodBrief: `${L}
Create a thumbnail color/mood brief for "${topic}": palette hex suggestions, contrast tips, face/expression notes. Text only.`,

    voiceStyleGuide: `${L}
Create a spoken voice style guide for a channel on "${topic}" (pace, vocab, catchphrases, avoid list).`,

    pacingNotes: `${L}
Give pacing/editing notes for a video on "${topic}" to improve retention (cut density, pattern interrupts).`,

    brollShotList: `${L}
Create a B-roll shot list for "${topic}" (shot, duration, purpose). Table-like text.`,

    musicMoodBrief: `${L}
Suggest music moods/sections for a video on "${topic}" (intro/build/payoff/outro). No copyrighted track names required.`,

    collabOutreach: `${L}
Write a collab outreach message for creators in "${topic}". Short + longer version.`,

    milestoneCommunityPost: `${L}
Write community posts for milestones related to "${topic}" (1k, 10k, 100k templates).`,

    apologeticsCrisisPost: `${L}
Draft a calm, accountable community post template for a creator mistake scenario around "${topic}". Empathetic, no legal claims.`,

    // local/non-AI tools still can have helper text generation if called
    cpmExplainer: `${L}
Explain CPM factors for niche "${topic}" in region ${extra || 'global'} in simple bullets.`,
  };

  const prompt = base[toolId];
  if (!prompt) {
    return `${L}\nHelp a YouTube creator with tool "${toolId}".\nInput:\n${topic}\n${extra}\nBe concise and actionable.`;
  }
  return prompt;
}

export function parseByTool(toolId, text) {
  const clean = String(text || '').trim();
  const strip = (l) =>
    l
      .replace(/^[\d\-\*\.\)\s•]+/, '')
      .replace(/^#\*+\s*/, '')
      .trim();

  const lines = () =>
    clean
      .split('\n')
      .map(strip)
      .filter((l) => l && !/^output rules/i.test(l) && !/^language:/i.test(l) && !/^constraint/i.test(l) && !/^topic:/i.test(l));

  switch (toolId) {
    case 'hashtagGenerator':
    case 'tagsFromTitle': {
      // Prefer explicit #tokens anywhere in the text
      const hashTokens = clean.match(/#[\w\u0600-\u06FF]+/g) || [];
      let items = [...new Set(hashTokens.map((t) => t.trim()))];
      if (items.length < 3) {
        items = clean
          .replace(/,/g, '\n')
          .split('\n')
          .map(strip)
          .filter(Boolean)
          .filter((t) => !/^(broad|niche|specific|output|rules|quantity)/i.test(t))
          .map((t) => (t.startsWith('#') ? t : `#${t.replace(/^#/, '').replace(/\s+/g, '')}`))
          .filter((t) => t.length > 2 && t.length < 60);
        items = [...new Set(items)];
      }
      if (toolId === 'tagsFromTitle') {
        items = items.map((t) => t.replace(/^#/, ''));
      }
      return { type: 'list', items: items.slice(0, 30) };
    }
    case 'titleGenerator':
    case 'hookGenerator':
    case 'ctaGenerator':
    case 'pinCommentGenerator':
    case 'thumbnailTextIdeas':
    case 'shortFormHooks':
    case 'retentionHooks':
    case 'commentReplyIdeas':
    case 'thumbnailEmotionWords':
      return {
        type: 'list',
        items: lines()
          .filter((l) => l.length > 2 && l.length < 200)
          .filter((l) => !l.startsWith('http') && !/^the user/i.test(l))
          .slice(0, 30),
      };
    default:
      return { type: 'markdown', content: clean };
  }
}
