import { KeyFacts, Language, QuizQuestion } from "../types";

export interface SummarizeParams {
  title?: string;
  content?: string;
  url?: string;
  platform?: string;
  creator?: string;
  language?: Language;
}

export interface SummarizeResponse {
  quickSummary: string[];
  easySummary: string;
  detailedSummary: string;
  keyFacts: KeyFacts;
  estimatedReadingTime: number;
  examRelevance?: string;
  primaryCategory: string;
}

export const AiService = {
  async summarize(params: SummarizeParams): Promise<SummarizeResponse> {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate summary");
    }

    return res.json();
  },

  async chat(message: string, summaryContext: any, language: Language = "en"): Promise<string> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, summaryContext, language }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to communicate with AI");
    }

    const data = await res.json();
    return data.reply;
  },

  async generateQuiz(summaryContext: any, language: Language = "en"): Promise<QuizQuestion[]> {
    const res = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summaryContext, language }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate quiz");
    }

    const data = await res.json();
    return data.questions;
  },

  async generateDailyDigest(articles: any[], language: Language = "en"): Promise<any> {
    const res = await fetch("/api/generate-daily-digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articles, language }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate daily digest");
    }

    return res.json();
  },

  async fetchLiveNews(params: {
    category?: string;
    query?: string;
    language?: Language;
    existingTitles?: string[];
    count?: number;
  }): Promise<{ articles: any[]; source: string; total: number }> {
    const res = await fetch("/api/fetch-live-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: params.category || "All",
        query: params.query || "",
        language: params.language || "en",
        existingTitles: params.existingTitles || [],
        count: params.count || 4,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch live news");
    }

    return res.json();
  },

  async fetchLiveWorldHappenings(params?: {
    existingTitles?: string[];
    language?: Language;
  }): Promise<{
    breakingLiveStories: any[];
    pulseStatus: string;
    worldPulseTimestamp: string;
    liveSourcesCount: number;
    activeRegions: string[];
  }> {
    const res = await fetch("/api/live-world-happenings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        existingTitles: params?.existingTitles || [],
        language: params?.language || "en",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to connect to live world happenings");
    }

    return res.json();
  },

  async getNews(params?: {
    category?: string;
    sourceId?: string;
    query?: string;
    dateRange?: "all" | "today" | "7d" | "30d" | string;
    dateFrom?: string;
    dateTo?: string;
    onlyVerified?: boolean;
    sort?: "latest" | "updated" | "popular" | "oldest" | string;
    page?: number;
    limit?: number;
  }): Promise<{ articles: any[]; total: number; page: number; limit: number; hasMore: boolean; totalPages: number; sourcesCount: number }> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.sourceId && params.sourceId !== "All") searchParams.set("sourceId", params.sourceId);
    if (params?.query) searchParams.set("query", params.query);
    if (params?.dateRange && params.dateRange !== "all") searchParams.set("dateRange", params.dateRange);
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
    if (params?.onlyVerified) searchParams.set("onlyVerified", "true");
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const res = await fetch(`/api/news?${searchParams.toString()}`, {
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) {
      throw new Error("Failed to retrieve paginated news repository");
    }
    return res.json();
  },

  async getNewsSources(): Promise<{ sources: any[]; totalSources: number; activeSources: number; totalRepositoryArticles: number }> {
    const res = await fetch("/api/news/sources");
    if (!res.ok) {
      throw new Error("Failed to retrieve news sources");
    }
    return res.json();
  },

  async getNewsDiagnostics(): Promise<any> {
    const res = await fetch("/api/news/diagnostics");
    if (!res.ok) {
      throw new Error("Failed to retrieve news diagnostics");
    }
    return res.json();
  },

  async getIngestionStatus(): Promise<any> {
    const res = await fetch("/api/news/ingestion-status", {
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) {
      throw new Error("Failed to retrieve news ingestion status");
    }
    return res.json();
  },

  async triggerNewsSync(): Promise<{ success: boolean; message: string; result: any; telemetry: any }> {
    const res = await fetch("/api/news/trigger-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error("Failed to trigger live news sync");
    }
    return res.json();
  },

  async addNewsArticle(articleData: {
    title: string;
    content?: string;
    creatorName?: string;
    category?: string;
    currentAffairsCategory?: string;
    platform?: string;
    originalUrl?: string;
    language?: Language;
    autoSummarize?: boolean;
    thumbnailUrl?: string;
    quickSummary?: string[];
    easySummary?: string;
    detailedSummary?: string;
    keyFacts?: any;
    examRelevance?: string;
  }): Promise<any> {
    const res = await fetch("/api/add-news-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articleData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create news article");
    }

    const data = await res.json();
    return data.article;
  },

  async autoFetchVerifiedNews(
    categoryOrParams?: string | { category?: string; query?: string; language?: Language; existingTitles?: string[] },
    language?: Language,
    existingTitles?: string[]
  ): Promise<any[]> {
    let payload: { category?: string; query?: string; language?: Language; existingTitles?: string[] } = {};
    if (typeof categoryOrParams === "string") {
      payload = {
        category: categoryOrParams,
        language: language || "en",
        existingTitles: existingTitles || [],
      };
    } else if (categoryOrParams && typeof categoryOrParams === "object") {
      payload = {
        category: categoryOrParams.category || "All",
        query: categoryOrParams.query || "",
        language: categoryOrParams.language || language || "en",
        existingTitles: categoryOrParams.existingTitles || existingTitles || [],
      };
    } else {
      payload = {
        category: "All",
        language: language || "en",
        existingTitles: existingTitles || [],
      };
    }

    const res = await fetch("/api/auto-fetch-verified-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to auto-fetch verified news");
    }

    const data = await res.json();
    return data.articles || [];
  },

  async generateNewsImage(params: {
    articleId?: string;
    title: string;
    category?: string;
    subCategory?: string;
    description?: string;
    originalUrl?: string;
    publisherName?: string;
    forceAi?: boolean;
  }): Promise<{
    url: string;
    source: "publisher" | "provider" | "ai" | "fallback";
    imageType: "photo" | "illustration" | "fallback";
    caption: string;
    attribution: string;
    prompt?: string;
    status: string;
  }> {
    const res = await fetch("/api/generate-news-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate image");
    }

    return res.json();
  },

  // Audio Speech Reader using Web Speech Synthesis
  speak(text: string, lang: Language = "en", onEnd?: () => void, rate: number = 1.0): () => void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis not supported on this browser.");
      if (onEnd) onEnd();
      return () => {};
    }

    window.speechSynthesis.cancel(); // cancel any active utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    if (lang === "hi") {
      utterance.lang = "hi-IN";
    } else if (lang === "ur") {
      utterance.lang = "ur-PK";
    } else {
      utterance.lang = "en-US";
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  },

  stopSpeaking(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  },
};
