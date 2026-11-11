import React, { useState, useMemo } from "react";
import { 
  Clock, 
  Bookmark, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Sparkles, 
  Search, 
  ArrowRight, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Check, 
  FolderPlus,
  RefreshCw,
  SlidersHorizontal,
  BookmarkCheck,
  Plus,
  Flame,
  Info
} from "lucide-react";
import { SummaryItem, Language, ReadLaterItem, ReadLaterSettings } from "../types";
import { AiService } from "../services/aiService";
import { getTopicImageUrl } from "../utils/topicImageMatcher";
import { VerificationBadge } from "./VerificationBadge";

interface ReadLaterViewProps {
  summaries: SummaryItem[];
  readLaterItems: ReadLaterItem[];
  settings: ReadLaterSettings;
  onUpdateSettings: (settings: ReadLaterSettings) => void;
  currentLanguage: Language;
  onOpenSummary: (summary: SummaryItem, initialTab?: string) => void;
  onToggleReadStatus: (id: string) => void;
  onRemoveFromQueue: (id: string) => void;
  onMoveToSaved: (id: string) => void;
  onClearCompleted: () => void;
  onCleanExpiredNow: () => void;
  onMoveAllToSaved: () => void;
  onAddToQueue: (id: string) => void;
  savedIds: string[];
}

export const ReadLaterView: React.FC<ReadLaterViewProps> = ({
  summaries,
  readLaterItems,
  settings,
  onUpdateSettings,
  currentLanguage,
  onOpenSummary,
  onToggleReadStatus,
  onRemoveFromQueue,
  onMoveToSaved,
  onClearCompleted,
  onCleanExpiredNow,
  onMoveAllToSaved,
  onAddToQueue,
  savedIds,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "expiring" | "completed">("all");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Map read later items to full summaries with metadata
  const queueItemsWithSummaries = useMemo(() => {
    const summaryMap = new Map<string, SummaryItem>();
    summaries.forEach((s) => summaryMap.set(s.id, s));

    return readLaterItems
      .map((item) => {
        const summary = summaryMap.get(item.id);
        if (!summary) return null;

        const addedTime = new Date(item.addedAt).getTime();
        const now = Date.now();
        const diffMs = now - (isNaN(addedTime) ? now : addedTime);
        const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, settings.cleanupDays - daysElapsed);
        const isExpired = daysElapsed >= settings.cleanupDays;

        return {
          ...item,
          summary,
          daysElapsed,
          daysRemaining,
          isExpired,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [summaries, readLaterItems, settings.cleanupDays]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = queueItemsWithSummaries.length;
    const unread = queueItemsWithSummaries.filter((i) => !i.isRead).length;
    const completed = queueItemsWithSummaries.filter((i) => i.isRead).length;
    const expiringSoon = queueItemsWithSummaries.filter((i) => i.daysRemaining <= 2).length;
    const totalMinutes = queueItemsWithSummaries.reduce(
      (acc, curr) => acc + (curr.summary.readingTimeMinutes || 3),
      0
    );

    return { total, unread, completed, expiringSoon, totalMinutes };
  }, [queueItemsWithSummaries]);

  // Filtered queue items
  const filteredItems = useMemo(() => {
    const filtered = queueItemsWithSummaries.filter((item) => {
      // Tab filter
      if (filterTab === "unread" && item.isRead) return false;
      if (filterTab === "completed" && !item.isRead) return false;
      if (filterTab === "expiring" && item.daysRemaining > 2) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const titleMatch = item.summary.title.toLowerCase().includes(q);
        const creatorMatch = item.summary.creatorName.toLowerCase().includes(q);
        const bulletsMatch = item.summary.quickSummary.some((b) => b.toLowerCase().includes(q));
        if (!titleMatch && !creatorMatch && !bulletsMatch) return false;
      }

      return true;
    });
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.summary.publishDate).getTime();
      const timeB = new Date(b.summary.publishDate).getTime();
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [queueItemsWithSummaries, filterTab, searchTerm]);

  // Audio preview helper
  const handleToggleAudio = (summary: SummaryItem) => {
    if (playingAudioId === summary.id) {
      AiService.stopSpeaking();
      setPlayingAudioId(null);
    } else {
      AiService.stopSpeaking();
      setPlayingAudioId(summary.id);
      const text = `${summary.title}. Summary: ${summary.quickSummary.join(". ")}`;
      AiService.speak(text, currentLanguage, () => {
        setPlayingAudioId(null);
      });
    }
  };

  // Recommended items from feed that are not yet in the queue
  const queueIds = useMemo(() => new Set(readLaterItems.map((i) => i.id)), [readLaterItems]);
  const suggestedItems = useMemo(() => {
    return summaries
      .filter((s) => !queueIds.has(s.id))
      .slice(0, 3);
  }, [summaries, queueIds]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-600/25">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                  Read Later Queue
                </h1>
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
                  {stats.total} {stats.total === 1 ? "article" : "articles"}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                Your focused, temporary reading list. Separate from permanent bookmarks with automatic 7-day cleanup.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="read-later-settings-toggle-btn"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              showSettingsDrawer
                ? "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950/60 dark:text-violet-200"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Cleanup Settings</span>
          </button>

          {stats.completed > 0 && (
            <button
              id="clear-completed-queue-btn"
              onClick={onClearCompleted}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              <span>Clear Done ({stats.completed})</span>
            </button>
          )}

          {stats.total > 0 && (
            <button
              id="move-all-to-saved-btn"
              onClick={onMoveAllToSaved}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700 active:scale-95"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Move All to Saved</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto-Cleanup Settings Card / Drawer */}
      <div className={`overflow-hidden rounded-3xl border transition-all ${
        showSettingsDrawer 
          ? "border-violet-300 bg-violet-50/70 p-5 dark:border-violet-900/60 dark:bg-violet-950/30" 
          : "border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      }`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  7-Day Automatic Cleanup
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  settings.autoCleanupEnabled 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                    : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                }`}>
                  {settings.autoCleanupEnabled ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
                Summaries older than {settings.cleanupDays} days in this queue are purged automatically so you never get overwhelmed. To keep an item forever, click <span className="font-semibold text-neutral-700 dark:text-neutral-200">"Move to Saved"</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Toggle */}
            <button
              id="read-later-auto-cleanup-toggle"
              onClick={() => onUpdateSettings({ ...settings, autoCleanupEnabled: !settings.autoCleanupEnabled })}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                settings.autoCleanupEnabled
                  ? "bg-violet-600 text-white"
                  : "border border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              }`}
            >
              <span>{settings.autoCleanupEnabled ? "Auto-Cleanup On" : "Auto-Cleanup Off"}</span>
            </button>

            {/* Run Cleanup Now */}
            <button
              id="read-later-run-cleanup-now-btn"
              onClick={onCleanExpiredNow}
              title="Remove any items that have exceeded the 7-day retention period"
              className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Clean Now</span>
            </button>
          </div>
        </div>

        {/* Extended options when drawer is opened */}
        {showSettingsDrawer && (
          <div className="mt-4 border-t border-violet-200/60 pt-4 dark:border-violet-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Queue Retention Window:
                </span>
                <p className="text-[11px] text-neutral-500">Choose when articles are considered expired.</p>
              </div>
              <div className="flex items-center gap-1.5">
                {[3, 7, 14].map((days) => (
                  <button
                    key={days}
                    id={`retention-days-${days}`}
                    onClick={() => onUpdateSettings({ ...settings, cleanupDays: days })}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      settings.cleanupDays === days
                        ? "bg-violet-600 text-white shadow-2xs"
                        : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {days} Days {days === 7 && "(Default)"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-medium">In Queue</span>
            <Clock className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
            {stats.total}
          </p>
          <span className="text-[10px] text-neutral-400">Temporary reading list</span>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-medium">Est. Read Time</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
            {stats.totalMinutes} <span className="text-xs font-normal text-neutral-500">min</span>
          </p>
          <span className="text-[10px] text-neutral-400">Total listening/reading</span>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-medium">Expiring Soon</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400 sm:text-2xl">
            {stats.expiringSoon}
          </p>
          <span className="text-[10px] text-neutral-400">≤ 2 days before cleanup</span>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-medium">Finished</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl">
            {stats.completed}
          </p>
          <span className="text-[10px] text-neutral-400">Ready to move or clear</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Items", count: stats.total },
            { id: "unread", label: "To Read", count: stats.unread },
            { id: "expiring", label: "Expiring Soon", count: stats.expiringSoon },
            { id: "completed", label: "Completed", count: stats.completed },
          ].map((tab) => {
            const isSelected = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`queue-filter-${tab.id}`}
                onClick={() => setFilterTab(tab.id as any)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-violet-600 text-white shadow-2xs"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? "bg-violet-700/60 text-white" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            id="read-later-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search queue..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-violet-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          />
        </div>
      </div>

      {/* Main Queue Item List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3.5">
          {filteredItems.map((item) => {
            const summary = item.summary;
            const itemImg = summary.thumbnailUrl?.trim() || getTopicImageUrl(summary);
            const isAudioPlaying = playingAudioId === summary.id;
            const isPermanentlySaved = savedIds.includes(summary.id);

            // Expiry urgency styles
            let expiryBadgeColor = "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
            let expiryLabel = `${item.daysRemaining} days left`;
            if (item.daysRemaining === 0) {
              expiryBadgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold animate-pulse";
              expiryLabel = "Expires Today!";
            } else if (item.daysRemaining === 1) {
              expiryBadgeColor = "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 font-semibold";
              expiryLabel = "Expires Tomorrow";
            } else if (item.daysRemaining <= 2) {
              expiryBadgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold";
              expiryLabel = `${item.daysRemaining} days remaining`;
            }

            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl border transition-all ${
                  item.isRead
                    ? "border-neutral-200 bg-neutral-50/80 opacity-80 dark:border-neutral-800 dark:bg-neutral-900/40"
                    : "border-neutral-200 bg-white shadow-2xs hover:border-violet-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-violet-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  {/* Left: Thumbnail & Reading Toggle */}
                  <div className="relative aspect-video w-full sm:w-44 sm:aspect-[4/3] shrink-0 overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                    <img
                      src={itemImg}
                      alt={summary.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80";
                      }}
                    />
                    
                    {/* Read / Unread pill on top of image */}
                    <button
                      id={`queue-item-toggle-read-${item.id}`}
                      onClick={() => onToggleReadStatus(item.id)}
                      className={`absolute left-2 top-2 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold backdrop-blur-md transition ${
                        item.isRead
                          ? "bg-emerald-600/90 text-white"
                          : "bg-black/60 text-white hover:bg-black/80"
                      }`}
                      title={item.isRead ? "Mark as unread" : "Mark as completed"}
                    >
                      {item.isRead ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      <span>{item.isRead ? "Finished" : "To Read"}</span>
                    </button>

                    {/* Expiry Pill */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] shadow-sm backdrop-blur-sm ${expiryBadgeColor}`}>
                        <Clock className="h-2.5 w-2.5" />
                        <span>{expiryLabel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Center & Right: Content details */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mb-1.5">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {summary.creatorName}
                        </span>
                        <span>•</span>
                        <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {summary.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-neutral-400" />
                          {summary.readingTimeMinutes} min
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-neutral-400">
                          Added {item.daysElapsed === 0 ? "today" : `${item.daysElapsed}d ago`}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => onOpenSummary(summary)}
                        className={`cursor-pointer text-sm font-bold sm:text-base transition hover:text-violet-600 dark:hover:text-violet-400 line-clamp-2 ${
                          item.isRead 
                            ? "text-neutral-500 line-through dark:text-neutral-400" 
                            : "text-neutral-900 dark:text-white"
                        }`}
                      >
                        {summary.title}
                      </h3>

                      {/* Quick Summary Preview */}
                      <ul className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                        {summary.quickSummary.slice(0, 2).map((b: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-violet-500 font-bold shrink-0">•</span>
                            <span className="truncate">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
                      {/* Left: Open Summary & Listen */}
                      <div className="flex items-center gap-2">
                        <button
                          id={`queue-read-btn-${item.id}`}
                          onClick={() => onOpenSummary(summary)}
                          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700 active:scale-95"
                        >
                          <span>Read Summary</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`queue-audio-btn-${item.id}`}
                          onClick={() => handleToggleAudio(summary)}
                          className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                            isAudioPlaying
                              ? "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
                              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                          }`}
                        >
                          {isAudioPlaying ? <VolumeX className="h-3.5 w-3.5 text-amber-600" /> : <Volume2 className="h-3.5 w-3.5" />}
                          <span className="hidden sm:inline">{isAudioPlaying ? "Stop" : "Listen"}</span>
                        </button>
                      </div>

                      {/* Right: Move to Saved, Remove */}
                      <div className="flex items-center gap-1.5">
                        {/* Move to Permanent Saved Bookmarks */}
                        <button
                          id={`queue-move-to-saved-${item.id}`}
                          onClick={() => onMoveToSaved(item.id)}
                          className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                            isPermanentlySaved
                              ? "border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
                              : "border border-neutral-200 bg-white text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-indigo-950/40"
                          }`}
                          title="Move to permanent Saved Bookmarks (will never be auto-cleaned up)"
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isPermanentlySaved ? "fill-indigo-600 text-indigo-600" : ""}`} />
                          <span className="hidden sm:inline">Move to Saved</span>
                        </button>

                        {/* Remove from Queue */}
                        <button
                          id={`queue-remove-btn-${item.id}`}
                          onClick={() => onRemoveFromQueue(item.id)}
                          className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-rose-400 transition"
                          title="Remove from queue"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        {/* Source link */}
                        <a
                          href={summary.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                          title="Original source"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/80 dark:text-violet-400 mb-3">
            <Clock className="h-7 w-7" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white sm:text-lg">
            {searchTerm ? "No matching summaries in queue" : "Your Read Later queue is empty"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
            {searchTerm
              ? "Try adjusting your search keywords or clear the filter."
              : "Whenever you come across an article or video you want to catch up on this week, click 'Read Later' on any card. Items automatically expire after 7 days to keep your backlog fresh!"}
          </p>

          {/* Quick Recommendations to add to queue */}
          {suggestedItems.length > 0 && !searchTerm && (
            <div className="mt-8 text-left max-w-xl mx-auto border-t border-neutral-100 pt-6 dark:border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                <span>Recommended to queue right now:</span>
              </div>
              <div className="space-y-2">
                {suggestedItems.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/60 dark:hover:bg-neutral-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                        {s.title}
                      </p>
                      <span className="text-[10px] text-neutral-500">
                        {s.creatorName} • {s.readingTimeMinutes} min
                      </span>
                    </div>
                    <button
                      id={`empty-add-suggested-${s.id}`}
                      onClick={() => onAddToQueue(s.id)}
                      className="flex items-center gap-1 shrink-0 rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-violet-700"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add to Queue</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
