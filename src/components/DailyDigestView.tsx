import React, { useState } from "react";
import { 
  Clock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Quote, 
  Flame, 
  Calendar, 
  Share2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2
} from "lucide-react";
import { DailyDigest, SummaryItem, Language } from "../types";
import { AiService } from "../services/aiService";

interface DailyDigestViewProps {
  digest: DailyDigest;
  summaries: SummaryItem[];
  currentLanguage: Language;
  onOpenSummary: (summary: SummaryItem, initialTab?: string) => void;
  onRefreshDigest: () => void;
  isRefreshing?: boolean;
}

export const DailyDigestView: React.FC<DailyDigestViewProps> = ({
  digest,
  summaries,
  currentLanguage,
  onOpenSummary,
  onRefreshDigest,
  isRefreshing = false,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);

  // Filter top summaries matching digest.topSummaryIds or fallbacks
  const topSummaries = summaries
    .filter((s) => digest.topSummaryIds.includes(s.id) || summaries.indexOf(s) < 10)
    .slice(0, 10);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      AiService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak = `SummaryHub Daily Digest for ${new Date(digest.date).toLocaleDateString()}. ${digest.briefingHeadline}. Executive Overview: ${digest.executiveOverview}. Key Takeaways: ${digest.keyTakeaways.join(". ")}`;
      AiService.speak(textToSpeak, currentLanguage, () => setIsPlayingAudio(false));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-violet-500/10 p-6 shadow-sm dark:border-amber-900/40 dark:from-amber-950/40 dark:via-indigo-950/30 dark:to-violet-950/30 sm:p-8">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              Daily Digest
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(digest.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-daily-digest-btn"
              onClick={onRefreshDigest}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs backdrop-blur-xs transition hover:bg-white dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span>{isRefreshing ? "Synthesizing..." : "Refresh Digest"}</span>
            </button>

            <button
              id="listen-daily-digest-btn"
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition ${
                isPlayingAudio ? "bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span>{isPlayingAudio ? "Stop Audio" : "Listen in 5 Mins"}</span>
            </button>
          </div>
        </div>

        {/* Big Catchphrase */}
        <div className="mt-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            {digest.briefingHeadline}
          </h1>
          <p className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            "Everything important from today in 5 minutes."
          </p>
        </div>

        {/* Micro Stats Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200/80 bg-white/70 p-3 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/60">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Content Analyzed</span>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{digest.totalContentToday} items</p>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white/70 p-3 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/60">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Reading Time</span>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{digest.estimatedReadingTimeMinutes} mins</p>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white/70 p-3 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/60">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Top Stories</span>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{topSummaries.length} summaries</p>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white/70 p-3 backdrop-blur-xs dark:border-neutral-800 dark:bg-neutral-900/60">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Time Saved vs Video</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">~2.5 Hours</p>
          </div>
        </div>
      </div>

      {/* Executive Overview */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>Executive Synthesis</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 sm:text-base">
          {digest.executiveOverview}
        </p>

        {/* Key Takeaways */}
        <div className="mt-6 border-t border-neutral-100 pt-5 dark:border-neutral-800">
          <h3 className="text-xs font-bold tracking-wider text-neutral-900 uppercase dark:text-white">
            Top 5 Macro Takeaways
          </h3>
          <ul className="mt-3 space-y-2.5">
            {digest.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quote of the Day */}
        {digest.quoteOfTheDay && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
            <Quote className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-xs italic text-neutral-600 dark:text-neutral-300">
              {digest.quoteOfTheDay}
            </p>
          </div>
        )}
      </div>

      {/* Top 10 Summaries Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white sm:text-lg">
            Top 10 Summaries of the Day
          </h2>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Ranked by editorial importance
          </span>
        </div>

        <div className="space-y-3">
          {topSummaries.map((item, index) => {
            const isExpanded = expandedSummaryId === item.id;
            return (
              <div
                key={item.id}
                id={`digest-item-${item.id}`}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div 
                  onClick={() => setExpandedSummaryId(isExpanded ? null : item.id)}
                  className="flex cursor-pointer items-center justify-between p-4 transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      #{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {item.creatorName}
                        </span>
                        <span className="text-[10px] text-neutral-400 uppercase">
                          • {item.category}
                        </span>
                      </div>
                      <h3 className="truncate text-xs font-bold text-neutral-900 dark:text-white sm:text-sm">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    <span className="hidden text-xs text-neutral-400 sm:inline">
                      {item.readingTimeMinutes} min
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                  </div>
                </div>

                {/* Accordion Expanded Preview */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-850">
                    <div className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                      {item.quickSummary.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <p>{b}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                      <button
                        onClick={() => onOpenSummary(item, "quick")}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                      >
                        Read Full Analysis
                      </button>

                      <a
                        href={item.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                      >
                        <span>Original Source</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
