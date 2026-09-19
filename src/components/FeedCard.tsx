import React, { useState } from "react";
import { 
  Youtube, 
  Twitter, 
  Instagram, 
  Newspaper, 
  Clock, 
  ExternalLink, 
  Bookmark, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Share2, 
  Check, 
  Sparkles,
  HelpCircle,
  Flame
} from "lucide-react";
import { SummaryItem, Platform, Language } from "../types";
import { AiService } from "../services/aiService";
import { VerificationBadge } from "./VerificationBadge";

interface FeedCardProps {
  summary: SummaryItem;
  currentLanguage: Language;
  onOpenSummary: (summary: SummaryItem, initialTab?: string) => void;
  onToggleSave: (id: string) => void;
  isSaved: boolean;
  onOpenAudit?: (summary: SummaryItem) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  summary,
  currentLanguage,
  onOpenSummary,
  onToggleSave,
  isSaved,
  onOpenAudit,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  // Platform Icon & Styling
  const getPlatformInfo = (platform: Platform) => {
    switch (platform) {
      case "youtube":
        return {
          name: "YouTube",
          icon: Youtube,
          color: "text-red-600 dark:text-red-500",
          bg: "bg-red-50 dark:bg-red-950/40 border-red-200/60 dark:border-red-900/30",
        };
      case "x":
        return {
          name: "X (Twitter)",
          icon: Twitter,
          color: "text-neutral-900 dark:text-neutral-100",
          bg: "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
        };
      case "instagram":
        return {
          name: "Instagram",
          icon: Instagram,
          color: "text-pink-600 dark:text-pink-400",
          bg: "bg-pink-50 dark:bg-pink-950/40 border-pink-200/60 dark:border-pink-900/30",
        };
      case "news":
      default:
        return {
          name: "News Wire",
          icon: Newspaper,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/30",
        };
    }
  };

  const platformInfo = getPlatformInfo(summary.platform);
  const PlatformIcon = platformInfo.icon;

  // Language translated content if available
  const displayTitle = 
    (currentLanguage !== "en" && summary.translations?.[currentLanguage]?.title) 
      ? summary.translations[currentLanguage]!.title!
      : summary.title;

  const displayQuickBullets = 
    (currentLanguage !== "en" && summary.translations?.[currentLanguage]?.quickSummary)
      ? summary.translations[currentLanguage]!.quickSummary!
      : summary.quickSummary;

  // Audio Playback
  const handleToggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      AiService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak = `${displayTitle}. Summary: ${displayQuickBullets.join(". ")}`;
      AiService.speak(textToSpeak, currentLanguage, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  // Share link copy
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}?summary=${summary.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Human date calculation
  const getRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  return (
    <article 
      id={`feed-card-${summary.id}`}
      onClick={() => onOpenSummary(summary, "quick")}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
    >
      {/* Top Header: Creator & Platform */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={summary.creatorAvatar}
              alt={summary.creatorName}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {summary.creatorName}
                </span>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {summary.creatorHandle}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span>{getRelativeTime(summary.publishDate)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {summary.readingTimeMinutes} min read
                </span>
              </div>
            </div>
          </div>

          {/* Platform Badge, Verification & Category */}
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <VerificationBadge 
              summary={summary} 
              onOpenAudit={onOpenAudit} 
              size="sm" 
              showScore={true} 
            />

            <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold ${platformInfo.bg} ${platformInfo.color}`}>
              <PlatformIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{platformInfo.name}</span>
            </span>

            <span className="rounded-lg bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {summary.category}
            </span>
          </div>
        </div>

        {/* Content Title */}
        <h2 className="mt-3.5 text-base font-bold text-neutral-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 sm:text-lg">
          {displayTitle}
        </h2>

        {/* Content Thumbnail & Quick Summary Split */}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
          {summary.thumbnailUrl && (
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-neutral-100 dark:border-neutral-800 sm:w-48">
              <img
                src={summary.thumbnailUrl}
                alt={summary.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                AI Summary
              </div>
            </div>
          )}

          {/* Quick Summary Bullet Points Teaser */}
          <div className="flex-1 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
            {displayQuickBullets.slice(0, 3).map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <p className="line-clamp-2 leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Relevance Tag (if current affairs / education) */}
        {summary.examRelevance && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-emerald-50/70 px-2.5 py-1 text-[11px] text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span className="font-semibold">Exam Relevance:</span>
            <span className="truncate">{summary.examRelevance}</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/60 px-4 py-2.5 dark:border-neutral-800/80 dark:bg-neutral-800/30 sm:px-5">
        <div className="flex items-center gap-1.5">
          {/* Read Summary Modal Trigger */}
          <button
            id={`read-summary-btn-${summary.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenSummary(summary, "quick");
            }}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Read Summary</span>
          </button>

          {/* Ask AI Chat Trigger */}
          <button
            id={`chat-summary-btn-${summary.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenSummary(summary, "chat");
            }}
            className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Audio Reader Trigger */}
          <button
            id={`audio-summary-btn-${summary.id}`}
            onClick={handleToggleAudio}
            title={isPlayingAudio ? "Stop reading" : "Listen to audio summary"}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              isPlayingAudio
                ? "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            }`}
          >
            {isPlayingAudio ? <VolumeX className="h-3.5 w-3.5 text-amber-600" /> : <Volume2 className="h-3.5 w-3.5 text-neutral-500" />}
            <span className="hidden sm:inline">{isPlayingAudio ? "Stop" : "Listen"}</span>
          </button>
        </div>

        {/* Right Action Icons: Save, Share, Original Link */}
        <div className="flex items-center gap-1">
          <button
            id={`save-summary-btn-${summary.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(summary.id);
            }}
            title={isSaved ? "Saved" : "Save for later"}
            className={`rounded-lg p-1.5 transition ${
              isSaved
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </button>

          <button
            id={`share-summary-btn-${summary.id}`}
            onClick={handleShare}
            title="Copy share link"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
          </button>

          <a
            id={`source-link-${summary.id}`}
            href={summary.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Visit original content source"
            className="flex items-center gap-1 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
};
