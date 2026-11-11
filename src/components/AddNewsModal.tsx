import React, { useState, useMemo } from "react";
import { 
  X, 
  Sparkles, 
  Newspaper, 
  Globe, 
  Search, 
  Plus, 
  Check, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Send,
  Zap,
  Bookmark,
  Image as ImageIcon
} from "lucide-react";
import { SummaryItem, Language, Category, CurrentAffairsSubCategory } from "../types";
import { AiService } from "../services/aiService";
import { getTopicInfo } from "../utils/topicImageMatcher";

interface AddNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNews: (newArticle: SummaryItem) => void;
  onAddMultipleNews?: (articles: SummaryItem[]) => void;
  currentLanguage: Language;
  existingTitles: string[];
}

export const AddNewsModal: React.FC<AddNewsModalProps> = ({
  isOpen,
  onClose,
  onAddNews,
  onAddMultipleNews,
  currentLanguage,
  existingTitles,
}) => {
  const [activeTab, setActiveTab] = useState<"live" | "write">("live");

  // Tab 1: Live Ingestion State
  const [liveCategory, setLiveCategory] = useState<string>("National News");
  const [liveQuery, setLiveQuery] = useState<string>("");
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [liveResults, setLiveResults] = useState<SummaryItem[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [liveError, setLiveError] = useState<string | null>(null);

  // Tab 2: Write / Submit Custom News State
  const [title, setTitle] = useState("");
  const [sourceName, setSourceName] = useState("Press Information Bureau (PIB)");
  const [category, setCategory] = useState<Category>("Current Affairs");
  const [subCategory, setSubCategory] = useState<CurrentAffairsSubCategory>("National News");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [language, setLanguage] = useState<Language>(currentLanguage);
  const [autoSummarize, setAutoSummarize] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categoriesList: CurrentAffairsSubCategory[] = [
    "National News",
    "International News",
    "Economy",
    "Science & Technology",
    "Environment",
    "Sports",
    "Education",
  ];

  // Fetch Live Breaking News
  const handleFetchLiveNews = async (cat = liveCategory, query = liveQuery) => {
    setIsFetchingLive(true);
    setLiveError(null);
    try {
      const res = await AiService.fetchLiveNews({
        category: cat,
        query: query,
        language: currentLanguage,
        existingTitles: [...existingTitles, ...liveResults.map((r) => r.title)],
        count: 5,
      });

      if (res.articles && res.articles.length > 0) {
        setLiveResults(res.articles);
      } else {
        setLiveError("No new articles found for this topic right now. Try another query or category.");
      }
    } catch (err: any) {
      setLiveError(err.message || "Failed to fetch live news. Please try again.");
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Add a single live item to feed
  const handleAddLiveItem = (item: SummaryItem) => {
    onAddNews(item);
    setAddedIds((prev) => new Set(prev).add(item.id));
  };

  // Add all live items to feed
  const handleAddAllLiveItems = () => {
    const unadded = liveResults.filter((item) => !addedIds.has(item.id));
    if (unadded.length > 0) {
      if (onAddMultipleNews) {
        onAddMultipleNews(unadded);
      } else {
        unadded.forEach((item) => onAddNews(item));
      }
      setAddedIds(new Set(liveResults.map((r) => r.id)));
    }
  };

  // Submit custom written news article
  const handleSubmitCustomNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitError("Please enter a news headline.");
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const article = await AiService.addNewsArticle({
        title: title.trim(),
        content: content.trim() || title.trim(),
        creatorName: sourceName.trim() || "Verified News Desk",
        category,
        currentAffairsCategory: subCategory,
        platform: "news",
        originalUrl: sourceUrl.trim() || "#",
        language,
        autoSummarize,
      });

      onAddNews(article);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to publish news article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Add News & Verified Articles
                </h2>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Ingest real-time breaking wires or publish custom syllabus news
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-200 px-6 pt-2 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "live"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Ingest Breaking News (Live RSS & Wires)</span>
          </button>

          <button
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "write"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Write & Post News Article</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 scrollbar-none">
          
          {/* TAB 1: LIVE INGESTION */}
          {activeTab === "live" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs dark:border-indigo-950 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
                  <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Real-Time Wire Dispatch Engine</span>
                </div>
                <p className="mt-1 text-neutral-600 dark:text-neutral-300">
                  Select a category or search any topic to fetch real-world articles from Reuters, PIB, The Hindu, and global wires. Each story is verified and summarized into high-yield takeaways.
                </p>
              </div>

              {/* Category selector */}
              <div>
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                  Select Category:
                </label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setLiveCategory(cat);
                        handleFetchLiveNews(cat, liveQuery);
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        liveCategory === cat
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search query input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={liveQuery}
                    onChange={(e) => setLiveQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFetchLiveNews(liveCategory, liveQuery);
                      }
                    }}
                    placeholder="Search specific topic (e.g. ISRO, Reserve Bank, AI policy, Climate)..."
                    className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => handleFetchLiveNews(liveCategory, liveQuery)}
                  disabled={isFetchingLive}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLive ? "animate-spin" : ""}`} />
                  <span>{isFetchingLive ? "Fetching..." : "Fetch News"}</span>
                </button>
              </div>

              {/* Error Notice */}
              {liveError && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>{liveError}</span>
                </div>
              )}

              {/* Initial Fetch Action if Empty */}
              {liveResults.length === 0 && !isFetchingLive && (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                  <Globe className="mx-auto h-8 w-8 text-neutral-400" />
                  <h4 className="mt-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    No articles loaded yet
                  </h4>
                  <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Click below to fetch the latest breaking dispatches for {liveCategory}.
                  </p>
                  <button
                    onClick={() => handleFetchLiveNews(liveCategory, liveQuery)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Fetch {liveCategory} Live</span>
                  </button>
                </div>
              )}

              {/* Results List */}
              {liveResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Dispatches Found ({liveResults.length})
                    </span>
                    <button
                      onClick={handleAddAllLiveItems}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      + Add All to Feed
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {liveResults.map((item) => {
                      const isAdded = addedIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3 transition hover:border-indigo-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-850 dark:hover:border-indigo-800"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-neutral-200/80 px-1.5 py-0.5 text-[10px] font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                                {item.creatorName}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                {new Date(item.publishDate).toLocaleDateString()}
                              </span>
                              {item.verification?.isVerified && (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <ShieldCheck className="h-3 w-3" />
                                  <span>{item.verification.verificationScore}% Verified</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-neutral-900 line-clamp-2 dark:text-white">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-neutral-600 line-clamp-1 dark:text-neutral-400">
                              {item.quickSummary?.[0] || item.easySummary}
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddLiveItem(item)}
                            disabled={isAdded}
                            className={`shrink-0 flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                              isAdded
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add to Feed</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WRITE & POST NEWS ARTICLE */}
          {activeTab === "write" && (
            <form onSubmit={handleSubmitCustomNews} className="space-y-4">
              {submitError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  News Headline / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Government Announces National Semiconductor Assembly Cluster in Gujarat"
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              {/* Source & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Source Agency / Creator
                  </label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="e.g. Press Information Bureau (PIB)"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Current Affairs Category
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => {
                      const val = e.target.value as CurrentAffairsSubCategory;
                      setSubCategory(val);
                      if (val === "Economy") setCategory("Finance");
                      else setCategory("Current Affairs");
                    }}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Article Content / Details */}
              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Article Body / Press Statement
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste or write the news report details, statements, numbers, and decisions here..."
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              {/* Source URL & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Official Reference URL (optional)
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://pib.gov.in/..."
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="ur">Urdu (اردو)</option>
                  </select>
                </div>
              </div>

              {/* AI Auto Summarize Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-850">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      AI 4-Tier Synthesis & Verification
                    </span>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Generates bullet points, exam notes, key facts, and wire verification audit
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSummarize}
                  onChange={(e) => setAutoSummarize(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing & Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Publish to News Feed</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
