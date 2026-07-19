/**
 * Cost-first model routing.
 * Prefer cheapest model that still quality-fits the task.
 *
 * Primary: gemini-3.1-flash-lite (high volume / cheap)
 * Alt light: gemini-2.5-flash-lite
 * Reasoning-ish: gemini-3-flash-preview or gemini-2.5-flash
 * Ultra-light open: gemma-4-31b-it / gemma-4-26b-a4b-it
 */

export const MODELS = {
  lite: 'gemini-3.1-flash-lite',
  liteFallback: 'gemini-2.5-flash-lite',
  flash: 'gemini-3-flash-preview',
  flashFallback: 'gemini-2.5-flash',
  gemma: 'gemma-4-31b-it',
  gemmaSmall: 'gemma-4-26b-a4b-it',
};

/** toolId → model tier */
export const TOOL_MODEL_TIER = {
  // simple / high volume → lite or gemma
  hashtagGenerator: 'lite',
  titleGenerator: 'lite',
  descriptionGenerator: 'lite',
  tagsFromTitle: 'gemma',
  hookGenerator: 'lite',
  ctaGenerator: 'gemma',
  pinCommentGenerator: 'gemma',
  endScreenIdeas: 'gemma',
  chapterGenerator: 'lite',
  seoKeywordExpander: 'lite',
  nicheIdeas: 'lite',
  videoIdeas: 'lite',
  seriesPlanner: 'flash',
  scriptWriter: 'flash',
  shortScript: 'lite',
  longScriptOutline: 'flash',
  videoRephraser: 'flash',
  translateScript: 'lite',
  simplifyScript: 'gemma',
  toneRewriter: 'lite',
  thumbnailTextIdeas: 'lite',
  abTitleTest: 'lite',
  abThumbnailCopy: 'lite',
  competitorTitleAnalysis: 'flash',
  commentReplyIdeas: 'gemma',
  communityPostIdeas: 'lite',
  pollIdeas: 'gemma',
  livestreamOutline: 'lite',
  podcastToYoutube: 'flash',
  blogToYoutube: 'flash',
  faqFromTopic: 'lite',
  mythBusterAngles: 'lite',
  controversySafeAngles: 'flash',
  audiencePersona: 'flash',
  contentCalendar: 'flash',
  uploadChecklist: 'gemma',
  retentionHooks: 'lite',
  coldOpenWriter: 'lite',
  storyBeatSheet: 'flash',
  productReviewStructure: 'lite',
  tutorialStepWriter: 'lite',
  listicleWriter: 'lite',
  newsReactionScript: 'lite',
  gamingCommentary: 'lite',
  vlogDayStructure: 'gemma',
  brandDealPitch: 'flash',
  mediaKitBio: 'lite',
  channelAboutSeo: 'lite',
  playlistStrategy: 'lite',
  shortFormHooks: 'lite',
  captionImprover: 'lite',
  srtCleaner: 'gemma',
  multilingualTitlePack: 'lite',
  trendAngleAdapter: 'flash',
  evergreenRefresh: 'lite',
  ctaTimestampPlan: 'gemma',
  sponsorshipRead: 'lite',
  disclaimerGenerator: 'gemma',
  communityGuidelinesSafe: 'gemma',
  thumbnailEmotionWords: 'gemma',
  colorMoodBrief: 'gemma',
  voiceStyleGuide: 'lite',
  pacingNotes: 'gemma',
  brollShotList: 'lite',
  musicMoodBrief: 'gemma',
  collabOutreach: 'lite',
  milestoneCommunityPost: 'gemma',
  apologeticsCrisisPost: 'flash',
};

export function resolveModel(toolId, preferred) {
  if (preferred && typeof preferred === 'string') return preferred;
  const tier = TOOL_MODEL_TIER[toolId] || 'lite';
  if (tier === 'flash') return MODELS.flash;
  if (tier === 'gemma') return MODELS.gemma;
  return MODELS.lite;
}

export function modelFallbacks(primary) {
  const chain = [primary];
  if (primary === MODELS.lite) chain.push(MODELS.liteFallback, MODELS.gemma, MODELS.flashFallback);
  else if (primary === MODELS.flash) chain.push(MODELS.flashFallback, MODELS.lite);
  else if (primary === MODELS.gemma) chain.push(MODELS.gemmaSmall, MODELS.lite);
  else chain.push(MODELS.lite, MODELS.flashFallback);
  return [...new Set(chain)];
}
