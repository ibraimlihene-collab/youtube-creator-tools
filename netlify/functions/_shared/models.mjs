/**
 * Models verified working with this project's API key (Jul 2026):
 * - gemini-3.1-flash-lite          ✅ cheapest high-volume (preferred default)
 * - gemini-3.1-flash-lite-preview  ✅
 * - gemini-flash-lite-latest       ✅ alias
 * - gemma-4-26b-a4b-it / gemma-4-31b-it ✅ free-tier friendly light tasks
 * - gemini-3-flash-preview         ✅ when more quality needed
 *
 * Avoid gemini-2.5-flash-lite for NEW keys (404 "no longer available to new users").
 */

export const MODELS = {
  cheapest: 'gemini-3.1-flash-lite',
  lite: 'gemini-3.1-flash-lite',
  liteAlt: 'gemini-flash-lite-latest',
  litePreview: 'gemini-3.1-flash-lite-preview',
  gemma: 'gemma-4-26b-a4b-it',
  gemmaBig: 'gemma-4-31b-it',
  quality: 'gemini-3-flash-preview',
  flashAlt: 'gemini-flash-latest',
};

/** toolId → tier */
export const TOOL_MODEL_TIER = {
  // ultra-cheap / short → gemma first then lite
  hashtagGenerator: 'cheapest',
  tagsFromTitle: 'cheapest',
  ctaGenerator: 'gemma',
  pinCommentGenerator: 'gemma',
  thumbnailTextIdeas: 'gemma',
  thumbnailEmotionWords: 'gemma',
  commentReplyIdeas: 'gemma',
  pollIdeas: 'gemma',
  disclaimerGenerator: 'gemma',
  uploadChecklist: 'gemma',
  // default volume → 3.1 flash lite
  titleGenerator: 'cheapest',
  descriptionGenerator: 'cheapest',
  hookGenerator: 'cheapest',
  endScreenIdeas: 'cheapest',
  chapterGenerator: 'cheapest',
  seoKeywordExpander: 'cheapest',
  nicheIdeas: 'cheapest',
  videoIdeas: 'cheapest',
  shortScript: 'cheapest',
  abTitleTest: 'cheapest',
  abThumbnailCopy: 'cheapest',
  communityPostIdeas: 'cheapest',
  faqFromTopic: 'cheapest',
  mythBusterAngles: 'cheapest',
  retentionHooks: 'cheapest',
  coldOpenWriter: 'cheapest',
  shortFormHooks: 'cheapest',
  captionImprover: 'cheapest',
  srtCleaner: 'cheapest',
  multilingualTitlePack: 'cheapest',
  translateScript: 'cheapest',
  simplifyScript: 'cheapest',
  toneRewriter: 'cheapest',
  colorMoodBrief: 'cheapest',
  musicMoodBrief: 'cheapest',
  ctaTimestampPlan: 'cheapest',
  sponsorshipRead: 'cheapest',
  mediaKitBio: 'cheapest',
  channelAboutSeo: 'cheapest',
  milestoneCommunityPost: 'cheapest',
  playlistStrategy: 'cheapest',
  tutorialStepWriter: 'cheapest',
  listicleWriter: 'cheapest',
  productReviewStructure: 'cheapest',
  gamingCommentary: 'cheapest',
  vlogDayStructure: 'cheapest',
  brollShotList: 'cheapest',
  pacingNotes: 'cheapest',
  collabOutreach: 'cheapest',
  // longer / multi-step
  seriesPlanner: 'quality',
  scriptWriter: 'quality',
  longScriptOutline: 'quality',
  videoRephraser: 'quality',
  competitorTitleAnalysis: 'quality',
  audiencePersona: 'quality',
  contentCalendar: 'quality',
  storyBeatSheet: 'quality',
  podcastToYoutube: 'quality',
  blogToYoutube: 'quality',
  livestreamOutline: 'quality',
  brandDealPitch: 'quality',
  controversySafeAngles: 'quality',
  trendAngleAdapter: 'quality',
  evergreenRefresh: 'quality',
  communityGuidelinesSafe: 'quality',
  apologeticsCrisisPost: 'quality',
  newsReactionScript: 'quality',
  voiceStyleGuide: 'quality',
};

export function resolveModel(toolId, preferred) {
  if (preferred && typeof preferred === 'string') return preferred;
  const tier = TOOL_MODEL_TIER[toolId] || 'cheapest';
  if (tier === 'quality') return MODELS.quality;
  if (tier === 'gemma') return MODELS.gemma;
  return MODELS.cheapest;
}

export function modelFallbacks(primary) {
  const chain = [primary];
  const pool = [
    MODELS.cheapest,
    MODELS.liteAlt,
    MODELS.litePreview,
    MODELS.gemma,
    MODELS.gemmaBig,
    MODELS.quality,
    MODELS.flashAlt,
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
  ];
  for (const m of pool) if (!chain.includes(m)) chain.push(m);
  return chain;
}
