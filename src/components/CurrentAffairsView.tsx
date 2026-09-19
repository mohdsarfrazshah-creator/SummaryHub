import React, { useState, useMemo } from "react";
import { 
  GraduationCap, 
  Calendar, 
  Download, 
  Copy, 
  Check, 
  Filter, 
  Search, 
  BookOpen, 
  ExternalLink, 
  Sparkles,
  Award,
  Layers,
  ShieldCheck,
  RefreshCw,
  Zap
} from "lucide-react";
import { SummaryItem, CurrentAffairsSubCategory, TimeFilter, Language } from "../types";
import { FeedCard } from "./FeedCard";

interface CurrentAffairsViewProps {
  summaries: SummaryItem[];
  currentLanguage: Language;
  onOpenSummary: (summary: SummaryItem, initialTab?: string) => void;
  onToggleSave: (id: string) => void;
  savedIds: string[];
  onOpenAudit?: (summary: SummaryItem) => void;
  onTriggerAutoFetch?: (category?: string) => void;
  isFetchingVerified?: boolean;
}

export const CurrentAffairsView: React.FC<CurrentAffairsViewProps> = ({
  summaries,
  currentLanguage,
  onOpenSummary,
  onToggleSave,
  savedIds,
  onOpenAudit,
  onTriggerAutoFetch,
  isFetchingVerified = false,
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCompendium, setCopiedCompendium] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);

  const subCategories: (CurrentAffairsSubCategory | "All")[] = [
    "All",
    "National News",
    "International News",
    "Economy",
    "Science & Technology",
    "Environment",
    "Sports",
    "Education",
  ];

  // Filter current affairs items
  const filteredSummaries = useMemo(() => {
    return summaries.filter((item) => {
      // Must be Current Affairs or News or have currentAffairsCategory
      const isCA = item.category === "Current Affairs" || item.category === "News" || Boolean(item.currentAffairsCategory);
      if (!isCA) return false;

      // SubCategory filter
      if (selectedSubCategory !== "All" && item.currentAffairsCategory !== selectedSubCategory) {
        return false;
      }

      // Verified filter
      if (onlyVerified && item.verification?.isVerified === false) {
        return false;
      }

      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesRelevance = item.examRelevance?.toLowerCase().includes(query) || false;
        const matchesQuick = item.quickSummary.some((q) => q.toLowerCase().includes(query));
        if (!matchesTitle && !matchesRelevance && !matchesQuick) return false;
      }

      return true;
    });
  }, [summaries, selectedSubCategory, searchTerm, onlyVerified]);

  // Export / Copy Exam Compendium
  const handleCopyCompendium = () => {
    let compendiumText = `# SummaryHub Exam Compendium — ${timeFilter.toUpperCase()} DIGEST\n`;
    compendiumText += `Generated on: ${new Date().toLocaleDateString()}\n`;
    compendiumText += `Target Categories: National, International, Economy, Sci-Tech, Environment, Sports, Education\n\n`;

    filteredSummaries.forEach((item, idx) => {
      compendiumText += `## ${idx + 1}. [${item.currentAffairsCategory || item.category}] ${item.title}\n`;
      compendiumText += `Source: ${item.creatorName} | Link: ${item.originalUrl}\n`;
      compendiumText += `### Key Facts:\n`;
      compendiumText += `- Names: ${item.keyFacts.names.join(", ")}\n`;
      compendiumText += `- Dates: ${item.keyFacts.dates.join(", ")}\n`;
      compendiumText += `- Statistics: ${item.keyFacts.statistics.join(", ")}\n`;
      compendiumText += `- Decisions: ${item.keyFacts.decisions.join(", ")}\n`;
      compendiumText += `### Core Takeaways:\n`;
      item.quickSummary.forEach((q) => {
        compendiumText += `- ${q}\n`;
      });
      if (item.examRelevance) {
        compendiumText += `### Exam Syllabus Note:\n${item.examRelevance}\n`;
      }
      compendiumText += `\n---\n\n`;
    });

    navigator.clipboard.writeText(compendiumText);
    setCopiedCompendium(true);
    setTimeout(() => setCopiedCompendium(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-indigo-500/10 p-6 shadow-xs dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/20 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              Current Affairs Mode
            </span>
            <span className="rounded-full bg-neutral-200/60 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              UPSC • Banking • Civil Services • GRE
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onTriggerAutoFetch && (
              <button
                id="ca-auto-fetch-btn"
                onClick={() => onTriggerAutoFetch(selectedSubCategory)}
                disabled={isFetchingVerified}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white/95 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-xs transition hover:bg-emerald-50 dark:border-emerald-700 dark:bg-neutral-850 dark:text-emerald-300 dark:hover:bg-neutral-800 disabled:opacity-60"
                title="Automatically fetch breaking verified news from official wire feeds"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${isFetchingVerified ? "animate-spin" : ""}`} />
                <span>{isFetchingVerified ? "Verifying Official Wires..." : "⚡ Ingest & Verify Fresh News"}</span>
              </button>
            )}

            {/* Export / Copy Compendium Button */}
            <button
              id="copy-exam-compendium-btn"
              onClick={handleCopyCompendium}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
            >
              {copiedCompendium ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedCompendium ? "Copied Markdown!" : "Export Exam Notes (MD)"}</span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white sm:text-3xl">
            Syllabus-Aligned Current Affairs Dossier
          </h1>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300 sm:text-sm">
            Distilled from verified global wire services and academic analysts. Never miss a policy change, international accord, or economic indicator.
          </p>
        </div>

        {/* Time Filter Pills: Daily, Weekly, Monthly */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/60 pt-4 dark:border-emerald-900/40">
          <div className="flex rounded-xl border border-neutral-300/80 bg-white/80 p-1 text-xs font-semibold shadow-2xs dark:border-neutral-700 dark:bg-neutral-850">
            {(["daily", "weekly", "monthly"] as TimeFilter[]).map((tf) => (
              <button
                key={tf}
                id={`time-filter-${tf}`}
                onClick={() => setTimeFilter(tf)}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 capitalize transition ${
                  timeFilter === tf
                    ? "bg-emerald-600 text-white shadow-2xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{tf} affairs</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="ca-verified-only-toggle"
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                onlyVerified
                  ? "border-emerald-500 bg-emerald-600 text-white shadow-2xs font-bold"
                  : "border-neutral-300/80 bg-white/80 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-850 dark:text-neutral-300"
              }`}
            >
              <ShieldCheck className={`h-3.5 w-3.5 ${onlyVerified ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
              <span>Verified Only (95%+)</span>
            </button>

            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Showing {filteredSummaries.length} verified topics
            </span>
          </div>
        </div>
      </div>

      {/* Subcategory Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {subCategories.map((sc) => {
          const isSelected = selectedSubCategory === sc;
          return (
            <button
              key={sc}
              id={`cat-filter-${sc.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setSelectedSubCategory(sc)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                isSelected
                  ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-900"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              {sc}
            </button>
          );
        })}
      </div>

      {/* Search Input for Current Affairs */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          id="ca-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by exam keyword, court ruling, ministry, or treaty..."
          className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        />
      </div>

      {/* Cards List */}
      {filteredSummaries.length > 0 ? (
        <div className="grid gap-5">
          {filteredSummaries.map((summary) => (
            <FeedCard
              key={summary.id}
              summary={summary}
              currentLanguage={currentLanguage}
              onOpenSummary={onOpenSummary}
              onToggleSave={onToggleSave}
              isSaved={savedIds.includes(summary.id)}
              onOpenAudit={onOpenAudit}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <BookOpen className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-600 mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            No current affairs items found in this filter
          </h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Try choosing a different category or clearing the search keyword.
          </p>
          <button
            onClick={() => {
              setSelectedSubCategory("All");
              setSearchTerm("");
            }}
            className="mt-4 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
