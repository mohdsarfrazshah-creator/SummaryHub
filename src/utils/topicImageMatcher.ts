// The World Ledger Topic Image Engine
// High-performance client-side image resolver with instant zero-latency SVG fallbacks

import { buildCleanDesignFallback, generateArticleSpecificAiPrompt } from "../services/smartImageEngine";

export interface TopicImageMatchParams {
  title?: string;
  category?: string;
  currentAffairsCategory?: string;
  content?: string;
  id?: string;
  thumbnailUrl?: string;
}

/**
 * Returns an instant, article-specific image URL.
 * Prefers validated publisher photos, and immediately returns
 * an instant 0ms inline SVG vector card if no thumbnail is present,
 * preventing slow external API calls from blocking page rendering.
 */
export function getTopicImageUrl(params: TopicImageMatchParams): string {
  // If the article already has a valid thumbnail from publisher, preserve it
  if (
    params.thumbnailUrl &&
    params.thumbnailUrl.trim().startsWith("http") &&
    !params.thumbnailUrl.includes("pollinations.ai")
  ) {
    return params.thumbnailUrl.trim();
  }

  const title = params.title || "News Dispatch";
  const category = params.category || "Current Affairs";
  const subCategory = params.currentAffairsCategory || "";

  // Instant zero-latency SVG vector card with dark editorial luxury styling
  return buildCleanDesignFallback(title, subCategory || category);
}

/**
 * Returns recognized topic info and editorial vector variants for the article.
 */
export function getTopicInfo(params: TopicImageMatchParams): {
  topicKey: string;
  topicLabel: string;
  aiPrompt: string;
  candidates: string[];
} {
  const title = params.title || "Current Affairs";
  const category = params.category || "Current Affairs";
  const subCategory = params.currentAffairsCategory || "";
  const content = params.content || "";

  const basePrompt = generateArticleSpecificAiPrompt(title, category, subCategory, content);

  // Return clean editorial variants
  const candidates = [
    buildCleanDesignFallback(title, subCategory || category),
    buildCleanDesignFallback(title, category),
    buildCleanDesignFallback(`${title} • In Depth`, subCategory || category),
  ];

  return {
    topicKey: subCategory.toLowerCase().replace(/[^a-z0-9]/g, "_") || category.toLowerCase(),
    topicLabel: subCategory ? `${category} • ${subCategory}` : category,
    aiPrompt: basePrompt,
    candidates,
  };
}

export function getTopicGallery(params: TopicImageMatchParams): { url: string; caption?: string }[] {
  const info = getTopicInfo(params);
  const labels = [
    "Editorial Vector Card",
    "Category Overview Card",
    "Special Briefing Edition",
  ];

  return info.candidates.map((url, i) => ({
    url,
    caption: labels[i] || "Editorial Vector Edition",
  }));
}
