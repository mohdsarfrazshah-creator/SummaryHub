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

  async autoFetchVerifiedNews(
    categoryOrParams?: string | { category?: string; language?: Language; existingTitles?: string[] },
    language?: Language,
    existingTitles?: string[]
  ): Promise<any[]> {
    let payload: { category?: string; language?: Language; existingTitles?: string[] } = {};
    if (typeof categoryOrParams === "string") {
      payload = {
        category: categoryOrParams,
        language: language || "en",
        existingTitles: existingTitles || [],
      };
    } else if (categoryOrParams && typeof categoryOrParams === "object") {
      payload = {
        category: categoryOrParams.category || "All",
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
