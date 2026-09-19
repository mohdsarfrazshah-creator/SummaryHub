import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Link as LinkIcon, 
  Youtube, 
  Twitter, 
  Instagram, 
  Newspaper, 
  FileText, 
  Globe, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Platform, Category, Language, SummaryItem } from "../types";
import { AiService } from "../services/aiService";

interface SummarizeUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSummary: (newSummary: SummaryItem) => void;
  currentLanguage: Language;
}

export const SummarizeUrlModal: React.FC<SummarizeUrlModalProps> = ({
  isOpen,
  onClose,
  onAddSummary,
  currentLanguage,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<"url" | "text">("url");
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [creatorInput, setCreatorInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [category, setCategory] = useState<Category>("Current Affairs");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto detect platform from URL
  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    const lower = url.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      setPlatform("youtube");
      if (!titleInput) setTitleInput("YouTube Video Breakdown");
      if (!creatorInput) setCreatorInput("YouTube Creator");
    } else if (lower.includes("twitter.com") || lower.includes("x.com")) {
      setPlatform("x");
      if (!titleInput) setTitleInput("X Thread Analysis");
      if (!creatorInput) setCreatorInput("X Analyst");
    } else if (lower.includes("instagram.com")) {
      setPlatform("instagram");
      if (!titleInput) setTitleInput("Instagram Visual Briefing");
      if (!creatorInput) setCreatorInput("Instagram Channel");
    } else if (lower.startsWith("http")) {
      setPlatform("news");
      if (!titleInput) setTitleInput("Global News Investigation");
      if (!creatorInput) setCreatorInput("News Editorial");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "url" && !urlInput.trim()) {
      setError("Please provide a valid content link.");
      return;
    }
    if (mode === "text" && !contentInput.trim()) {
      setError("Please paste or type the content to summarize.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await AiService.summarize({
        title: titleInput || (mode === "url" ? "Content Update" : "Pasted Article"),
        content: contentInput || urlInput,
        url: urlInput || "https://summaryhub.internal/custom-text",
        platform,
        creator: creatorInput || "Verified Source",
        language: selectedLanguage,
      });

      const newSummaryItem: SummaryItem = {
        id: `sum-custom-${Date.now()}`,
        title: titleInput || "AI Curated Analysis",
        creatorId: `custom-${Date.now()}`,
        creatorName: creatorInput || "Independent Creator",
        creatorHandle: `@${(creatorInput || "creator").toLowerCase().replace(/\s+/g, "_")}`,
        creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        platform,
        category,
        publishDate: new Date().toISOString(),
        readingTimeMinutes: result.estimatedReadingTime || 2,
        originalUrl: urlInput || "#",
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
        quickSummary: result.quickSummary,
        easySummary: result.easySummary,
        detailedSummary: result.detailedSummary,
        keyFacts: result.keyFacts,
        examRelevance: result.examRelevance,
        isSaved: false,
        isRead: false,
        viewsCount: 1,
        likesCount: 1,
      };

      onAddSummary(newSummaryItem);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to generate AI summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Summarize with AI
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Paste any YouTube video, X thread, or article
              </p>
            </div>
          </div>

          <button
            id="summarize-modal-close-btn"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Tabs: URL vs Raw Text */}
          <div className="flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 text-xs font-semibold dark:border-neutral-700 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                mode === "url" 
                  ? "bg-white text-indigo-600 shadow-2xs dark:bg-neutral-900 dark:text-indigo-400" 
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Paste URL Link</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                mode === "text" 
                  ? "bg-white text-indigo-600 shadow-2xs dark:bg-neutral-900 dark:text-indigo-400" 
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Paste Raw Text / Transcript</span>
            </button>
          </div>

          {mode === "url" ? (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Content URL
              </label>
              <div className="mt-1 relative">
                <input
                  id="summarize-url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="e.g. https://youtube.com/watch?v=... or https://x.com/..."
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Content / Transcript Text
              </label>
              <textarea
                id="summarize-text-input"
                rows={4}
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder="Paste news text, transcript snippet, or notes..."
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          )}

          {/* Title & Creator Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Title (optional)
              </label>
              <input
                id="summarize-title-input"
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Global Tech Policy Summit"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Creator / Channel Name
              </label>
              <input
                id="summarize-creator-input"
                type="text"
                value={creatorInput}
                onChange={(e) => setCreatorInput(e.target.value)}
                placeholder="e.g. Cleo Abram / Reuters"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          {/* Platform & Category & Language Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Platform
              </label>
              <select
                id="summarize-platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="youtube">YouTube</option>
                <option value="x">X (Twitter)</option>
                <option value="instagram">Instagram</option>
                <option value="news">News Website</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Category
              </label>
              <select
                id="summarize-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="Current Affairs">Current Affairs</option>
                <option value="News">News</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Sports">Sports</option>
                <option value="Health">Health</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Summary Language
              </label>
              <select
                id="summarize-lang-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="ur">Urdu (اردو)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="generate-summary-submit-btn"
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting Multi-Tier Summary with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate AI Summary (4 Tiers)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
