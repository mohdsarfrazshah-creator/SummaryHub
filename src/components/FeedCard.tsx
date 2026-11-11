import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Archive,
  Copy,
  MoreVertical,
  Link2,
  CheckCircle2,
  Image as ImageIcon,
  Download,
  GraduationCap,
  Camera
} from "lucide-react";
import { SummaryItem, Platform, Language } from "../types";
import { AiService } from "../services/aiService";
import { VerificationBadge } from "./VerificationBadge";
import { getTopicImageUrl } from "../utils/topicImageMatcher";
import { buildCleanDesignFallback } from "../services/smartImageEngine";
import { generatePlainTextSummary, downloadFile } from "../utils/exportUtils";

interface FeedCardProps {
  summary: SummaryItem;
  currentLanguage: Language;
  onOpenSummary: (summary: SummaryItem, initialTab?: string) => void;
  onToggleSave: (id: string) => void;
  isSaved: boolean;
  isReadLater?: boolean;
  onToggleReadLater?: (id: string) => void;
  onMoveToReadLater?: (id: string) => void;
  onMoveToSaved?: (id: string) => void;
  onOpenAudit?: (summary: SummaryItem) => void;
  onArchive?: (id: string) => void;
  isArchived?: boolean;
  onNotify?: (message: string) => void;
  onOpenImagePicker?: (summary: SummaryItem) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  summary,
  currentLanguage,
  onOpenSummary,
  onToggleSave,
  isSaved,
  isReadLater = false,
  onToggleReadLater,
  onMoveToReadLater,
  onMoveToSaved,
  onOpenAudit,
  onArchive,
  isArchived = false,
  onNotify,
  onOpenImagePicker,
  selectable = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  // Dedicated topic image resolution with instant fast-path
  const resolvedThumbnail = useMemo(() => {
    const raw = summary.thumbnailUrl?.trim();
    if (raw && (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:image/svg"))) {
      return raw;
    }
    return getTopicImageUrl({
      title: summary.title,
      category: summary.category,
      currentAffairsCategory: summary.currentAffairsCategory,
      id: summary.id,
    });
  }, [summary.thumbnailUrl, summary.title, summary.category, summary.currentAffairsCategory, summary.id]);

  const [currentImage, setCurrentImage] = useState<string>(resolvedThumbnail);
  const [imageLoaded, setImageLoaded] = useState<boolean>(() => resolvedThumbnail.startsWith("data:image/svg"));
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const hasSourcePhoto = Boolean(summary.thumbnailUrl && summary.thumbnailUrl.trim());

  useEffect(() => {
    setCurrentImage(resolvedThumbnail);
    setImageLoaded(resolvedThumbnail.startsWith("data:image/svg"));
    setImageLoadFailed(false);
  }, [resolvedThumbnail]);

  // Long-press and touch management
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

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
  const handleToggleAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  // Trigger tactile confirmation vibration
  const triggerTactileFeedback = (pattern: number | number[] = 40) => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback if vibration is not supported or permitted
      }
    }
  };

  // Open Context Menu at specified viewport coordinates
  const openContextMenu = (clientX: number, clientY: number) => {
    triggerTactileFeedback(40);

    const menuWidth = 240;
    const menuHeight = 280;
    const safeX = Math.max(12, Math.min(clientX, window.innerWidth - menuWidth - 12));
    const safeY = Math.max(12, Math.min(clientY, window.innerHeight - menuHeight - 12));

    setContextMenu({
      isOpen: true,
      x: safeX,
      y: safeY,
    });
  };

  // Close context menu on Escape key
  useEffect(() => {
    if (!contextMenu.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu({ isOpen: false, x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contextMenu.isOpen]);

  // Context Menu Actions
  const handleShareAction = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setContextMenu({ isOpen: false, x: 0, y: 0 });
    const shareUrl = `${window.location.origin}?summary=${summary.id}`;
    
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: summary.title,
          text: summary.quickSummary?.[0] || summary.title,
          url: shareUrl,
        });
        onNotify?.(`Shared "${summary.title.slice(0, 30)}..."`);
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onNotify?.("Share link copied to clipboard");
    } catch {
      // ignore
    }
  };

  const handleCopyLinkAction = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setContextMenu({ isOpen: false, x: 0, y: 0 });
    const linkToCopy = summary.originalUrl || `${window.location.origin}?summary=${summary.id}`;
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onNotify?.("Link copied to clipboard");
    } catch {
      // ignore
    }
  };

  const handleArchiveAction = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setContextMenu({ isOpen: false, x: 0, y: 0 });
    if (onArchive) {
      onArchive(summary.id);
    }
  };

  // Long-press detection helpers
  const startLongPress = (clientX: number, clientY: number) => {
    touchStartRef.current = { x: clientX, y: clientY };
    isLongPressTriggeredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      triggerTactileFeedback([35, 25, 35]);
      openContextMenu(clientX, clientY);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
  };

  const checkMoveThreshold = (clientX: number, clientY: number) => {
    if (!touchStartRef.current || isLongPressTriggeredRef.current) return;
    const dx = Math.abs(clientX - touchStartRef.current.x);
    const dy = Math.abs(clientY - touchStartRef.current.y);
    // Cancel if finger moved more than 10px (user is scrolling)
    if (dx > 10 || dy > 10) {
      cancelLongPress();
    }
  };

  // Right-click context menu event
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cancelLongPress();
    triggerTactileFeedback(45);
    openContextMenu(e.clientX, e.clientY);
  };

  // Human date calculation with accurate minute granularity and user timezone localization
  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Recent";
    try {
      const date = new Date(dateStr);
      const ms = date.getTime();
      if (isNaN(ms)) return "Recent";
      const now = Date.now();
      const diffMs = now - ms;
      if (diffMs < 0) return "Just now"; // handles slight client-server clock drift
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const getFullTimestampTooltip = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return `Published: ${d.toLocaleString()} (${d.toUTCString()})`;
    } catch {
      return "";
    }
  };

  return (
    <>
      <article 
        id={`feed-card-${summary.id}`}
        onContextMenu={handleContextMenu}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            startLongPress(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) {
            checkMoveThreshold(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchEnd={cancelLongPress}
        onTouchCancel={cancelLongPress}
        onMouseDown={(e) => {
          if (e.button === 0) {
            startLongPress(e.clientX, e.clientY);
          }
        }}
        onMouseMove={(e) => {
          checkMoveThreshold(e.clientX, e.clientY);
        }}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onClick={(e) => {
          if (isLongPressTriggeredRef.current) {
            e.preventDefault();
            e.stopPropagation();
            isLongPressTriggeredRef.current = false;
            return;
          }
          onOpenSummary(summary, "quick");
        }}
        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer select-none active:scale-[0.995] ${
          isSelected
            ? "border-indigo-500 bg-indigo-50/25 ring-2 ring-indigo-500/30 dark:border-indigo-500 dark:bg-indigo-950/25 dark:ring-indigo-500/40"
            : "border-neutral-200/90 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
        }`}
      >
        {/* Top Header: Creator & Platform */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {selectable && (
                <button
                  type="button"
                  id={`select-card-${summary.id}`}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={isSelected ? `Deselect "${summary.title}"` : `Select "${summary.title}"`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSelect?.(summary.id);
                  }}
                  className={`group/cb flex h-5 w-5 sm:h-5.5 sm:w-5.5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-xs dark:border-indigo-500 dark:bg-indigo-600"
                      : "border-neutral-300 bg-white hover:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-indigo-400"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </button>
              )}
              <img
                src={summary.creatorAvatar}
                alt={summary.creatorName}
                loading="lazy"
                decoding="async"
                className="h-9 w-9 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[150px] sm:max-w-none">
                    {summary.creatorName}
                  </span>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate max-w-[120px] sm:max-w-none">
                    {summary.creatorHandle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 flex-wrap">
                  <span 
                    title={getFullTimestampTooltip(summary.publishedAt || summary.publishDate)}
                    className="cursor-help hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    {getRelativeTime(summary.publishedAt || summary.publishDate)}
                  </span>
                  {summary.updatedAt && summary.updatedAt !== (summary.publishedAt || summary.publishDate) && (
                    <span 
                      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
                      title={`Original source update: ${new Date(summary.updatedAt).toLocaleString()}`}
                    >
                      Updated {getRelativeTime(summary.updatedAt)}
                    </span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {summary.readingTimeMinutes} min read
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Badge, Verification, Category & Context Menu Trigger */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start sm:self-center">
              <VerificationBadge 
                summary={summary} 
                onOpenAudit={onOpenAudit} 
                size="sm" 
                showScore={true} 
              />

              <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold ${platformInfo.bg} ${platformInfo.color}`}>
                <PlatformIcon className="h-3.5 w-3.5" />
                <span className="inline">{platformInfo.name}</span>
              </span>

              <span className="rounded-lg bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {summary.category}
              </span>

              {/* Quick Actions 3-Dots Button */}
              <button
                id={`card-options-btn-${summary.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerTactileFeedback(35);
                  const rect = e.currentTarget.getBoundingClientRect();
                  openContextMenu(rect.left - 180, rect.bottom + 8);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="Options (or right-click / hold)"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h2 className="mt-3 text-base font-bold leading-snug text-neutral-900 group-hover:text-indigo-600 dark:text-neutral-100 dark:group-hover:text-indigo-400 transition-colors">
            {displayTitle}
          </h2>

          {/* Thumbnail & Key Bullets Preview */}
          <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 sm:w-44">
              {!imageLoaded && !imageLoadFailed && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-750 dark:to-neutral-800" />
              )}
              {imageLoadFailed ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-850 p-2 text-center select-none">
                  <ImageIcon className="h-6 w-6 text-neutral-400 dark:text-neutral-500 mb-1" />
                  <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 truncate max-w-full">
                    {summary.currentAffairsCategory || summary.category || "Verified Dispatch"}
                  </span>
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-serif-title uppercase tracking-wider">The World Ledger</span>
                </div>
              ) : (
                <img
                  src={currentImage}
                  alt={hasSourcePhoto ? `Source photo: ${summary.title}` : `Topic contextual illustration: ${summary.title}`}
                  referrerPolicy="no-referrer"
                  decoding="async"
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  className={`h-full w-full object-cover transition-opacity duration-300 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  onError={() => {
                    const fallback = buildCleanDesignFallback(summary.title, summary.currentAffairsCategory || summary.category);
                    if (currentImage !== fallback) {
                      setCurrentImage(fallback);
                      setImageLoaded(true);
                    } else {
                      setImageLoadFailed(true);
                    }
                  }}
                />
              )}
              {(() => {
                const isPublisherPhoto = summary.imageSource === "publisher" || (Boolean(summary.thumbnailUrl && summary.thumbnailUrl.startsWith("http")) && summary.imageType === "photo");
                return (
                  <div 
                    className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs border border-white/10"
                    title={isPublisherPhoto ? `Verified photo from ${summary.creatorName}` : "Official Editorial Briefing Card"}
                  >
                    {isPublisherPhoto ? (
                      <>
                        <Camera className="h-3 w-3 text-emerald-400" />
                        <span>Photo</span>
                      </>
                    ) : (
                      <>
                        <Newspaper className="h-3 w-3 text-indigo-400" />
                        <span>Editorial Card</span>
                      </>
                    )}
                  </div>
                );
              })()}
              {onOpenImagePicker && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenImagePicker(summary);
                  }}
                  className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/85 backdrop-blur-xs shadow-xs"
                  title="Change / customize article image"
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Change</span>
                </button>
              )}
            </div>

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

          {/* Exam Relevance Tag (stacks vertically on small screens, no truncation) */}
          {summary.examRelevance && (
            <div className="mt-3.5 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-2.5 sm:px-3 sm:py-2 text-xs text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200 transition-all">
              <div className="flex items-center gap-1.5 shrink-0 font-bold text-emerald-800 dark:text-emerald-300">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                <span>Exam Relevance:</span>
              </div>
              <p className="leading-relaxed text-[11px] sm:text-xs text-emerald-900/90 dark:text-emerald-200/90 break-words">
                {summary.examRelevance}
              </p>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 bg-neutral-50/60 px-3.5 py-2.5 dark:border-neutral-800/80 dark:bg-neutral-800/30 sm:px-5">
          {/* Left Action Buttons: Read Summary, Ask AI, Listen */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Primary Action: Read Summary */}
            <button
              id={`read-summary-btn-${summary.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSummary(summary, "quick");
              }}
              aria-label={`Read AI summary of ${summary.title}`}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 min-h-[38px]"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Read Summary</span>
            </button>

            {/* Ask AI / Comments Chat Trigger */}
            <button
              id={`chat-summary-btn-${summary.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSummary(summary, "chat");
              }}
              aria-label={`Ask AI questions or discuss ${summary.title}`}
              className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-2.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[38px]"
            >
              <MessageSquare className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="hidden xs:inline sm:inline">Ask AI</span>
            </button>

            {/* Audio Reader Trigger */}
            <button
              id={`audio-summary-btn-${summary.id}`}
              onClick={handleToggleAudio}
              title={isPlayingAudio ? "Stop reading" : "Listen to audio summary"}
              aria-label={isPlayingAudio ? "Stop audio reading" : "Listen to audio summary"}
              className={`flex items-center gap-1 rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[38px] ${
                isPlayingAudio
                  ? "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200 shadow-2xs"
                  : "border-neutral-200 bg-white text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              }`}
            >
              {isPlayingAudio ? <VolumeX className="h-3.5 w-3.5 text-amber-600 shrink-0" /> : <Volume2 className="h-3.5 w-3.5 text-neutral-500 shrink-0" />}
              <span className="hidden xs:inline sm:inline">{isPlayingAudio ? "Stop" : "Listen"}</span>
            </button>
          </div>

          {/* Right Action Icons: Read Later, Save, Copy Link, Share, Original Source */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
            {/* Read Later Queue Button */}
            {onToggleReadLater && (
              <button
                id={`read-later-btn-${summary.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerTactileFeedback(35);
                  onToggleReadLater(summary.id);
                }}
                title={isReadLater ? "In Read Later Queue (7-day list)" : "Add to Read Later Queue"}
                aria-label={isReadLater ? "Remove from Read Later Queue" : "Save to Read Later Queue"}
                className={`flex h-9 w-9 items-center justify-center rounded-xl p-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isReadLater
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 shadow-2xs"
                    : "text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                }`}
              >
                <Clock className={`h-4 w-4 ${isReadLater ? "fill-violet-600/20 text-violet-600 dark:text-violet-400" : ""}`} />
              </button>
            )}

            {/* Permanent Save Bookmark */}
            <button
              id={`save-summary-btn-${summary.id}`}
              onClick={(e) => {
                e.stopPropagation();
                triggerTactileFeedback(35);
                onToggleSave(summary.id);
              }}
              title={isSaved ? "Saved permanently in library" : "Save permanently to bookmarks"}
              aria-label={isSaved ? "Remove from bookmarks" : "Bookmark this article"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl p-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSaved
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-2xs"
                  : "text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>

            {/* Copy Original URL Link Button */}
            <button
              id={`copy-link-btn-${summary.id}`}
              onClick={handleCopyLinkAction}
              title={copied ? "Link copied to clipboard!" : "Copy original article link"}
              aria-label={`Copy link to ${summary.title}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl p-2 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>

            {/* Share Button */}
            <button
              id={`share-summary-btn-${summary.id}`}
              onClick={handleShareAction}
              title="Share story (or long press for quick export)"
              aria-label={`Share ${summary.title}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl p-2 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>

            {/* Original External Link */}
            <a
              id={`source-link-${summary.id}`}
              href={summary.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Visit original publisher source"
              aria-label={`Visit original source for ${summary.title}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl p-2 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>

      {/* Floating Context Menu (triggered by Right-Click or Long-Press) */}
      {contextMenu.isOpen && (
        <div className="relative z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] dark:bg-black/50 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu({ isOpen: false, x: 0, y: 0 });
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ isOpen: false, x: 0, y: 0 });
            }}
          />

          {/* Context Menu Panel */}
          <div
            role="menu"
            aria-label="FeedCard Quick Actions"
            className="fixed z-50 w-64 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                <PlatformIcon className={`h-3 w-3 ${platformInfo.color}`} />
                <span className="truncate">{platformInfo.name}</span>
                <span>•</span>
                <span>Quick Actions</span>
              </div>
              <p className="line-clamp-1 mt-0.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {displayTitle}
              </p>
            </div>

            {/* Menu Options */}
            <div className="space-y-0.5 py-1">
              {/* Option 1: Share */}
              <button
                id={`context-share-${summary.id}`}
                onClick={handleShareAction}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Share2 className="h-4 w-4 text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">Share Story</div>
                  <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">Send via apps or social channels</div>
                </div>
              </button>

              {/* Option 2: Copy Link */}
              <button
                id={`context-copy-link-${summary.id}`}
                onClick={handleCopyLinkAction}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="h-4 w-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{copied ? "Link Copied!" : "Copy Link"}</div>
                  <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">Direct link to summary</div>
                </div>
              </button>

              {/* Option 3: Archive */}
              <button
                id={`context-archive-${summary.id}`}
                onClick={handleArchiveAction}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-amber-50 hover:text-amber-800 dark:text-neutral-200 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
              >
                <Archive className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{isArchived ? "Unarchive Story" : "Archive Story"}</div>
                  <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">
                    {isArchived ? "Restore to active feed" : "Remove from home feed"}
                  </div>
                </div>
              </button>

              <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

              {/* Option 4: Read Later Queue */}
              {onToggleReadLater && (
                <button
                  id={`context-read-later-${summary.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleReadLater(summary.id);
                    setContextMenu({ isOpen: false, x: 0, y: 0 });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-violet-50 hover:text-violet-800 dark:text-neutral-200 dark:hover:bg-violet-950/40 dark:hover:text-violet-300"
                >
                  <Clock className={`h-4 w-4 shrink-0 ${isReadLater ? "fill-violet-600 text-violet-600 dark:fill-violet-400 dark:text-violet-400" : "text-neutral-500 dark:text-neutral-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{isReadLater ? "Remove from Read Later" : "Add to Read Later"}</div>
                    <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">Dedicated 7-day reading queue</div>
                  </div>
                </button>
              )}

              {/* Option 4b: Move between Saved and Read Later if applicable */}
              {isSaved && onMoveToReadLater && (
                <button
                  id={`context-move-to-read-later-${summary.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToReadLater(summary.id);
                    setContextMenu({ isOpen: false, x: 0, y: 0 });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-violet-50 hover:text-violet-800 dark:text-neutral-200 dark:hover:bg-violet-950/40 dark:hover:text-violet-300"
                >
                  <Clock className="h-4 w-4 shrink-0 text-violet-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">Move to Read Later Queue</div>
                    <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">Remove from saved & put in 7d queue</div>
                  </div>
                </button>
              )}

              {isReadLater && onMoveToSaved && (
                <button
                  id={`context-move-to-saved-${summary.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToSaved(summary.id);
                    setContextMenu({ isOpen: false, x: 0, y: 0 });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-indigo-50 hover:text-indigo-800 dark:text-neutral-200 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                >
                  <Bookmark className="h-4 w-4 shrink-0 text-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">Move to Permanent Bookmarks</div>
                    <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">Save permanently without auto-cleanup</div>
                  </div>
                </button>
              )}

              {/* Option 5: Permanent Bookmark / Save */}
              <button
                id={`context-save-${summary.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(summary.id);
                  setContextMenu({ isOpen: false, x: 0, y: 0 });
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Bookmark className={`h-4 w-4 shrink-0 ${isSaved ? "fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" : "text-neutral-500 dark:text-neutral-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{isSaved ? "Remove from Library" : "Permanent Bookmark"}</div>
                  <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">Store permanently in your saved library</div>
                </div>
              </button>

              {/* Option 6: Download Offline Text Summary */}
              <button
                id={`context-download-txt-${summary.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu({ isOpen: false, x: 0, y: 0 });
                  const txt = generatePlainTextSummary([summary]);
                  const cleanTitle = summary.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_");
                  downloadFile(txt, `WorldLedger-${cleanTitle}-offline.txt`, "text/plain");
                  onNotify?.(`Downloaded offline summary for "${summary.title.slice(0, 25)}..."`);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Download className="h-4 w-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">Download Text File (.txt)</div>
                  <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">Offline readable summary file</div>
                </div>
              </button>

              {/* Option 7: Listen to Audio */}
              <button
                id={`context-audio-${summary.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleAudio(e);
                  setContextMenu({ isOpen: false, x: 0, y: 0 });
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Volume2 className="h-4 w-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{isPlayingAudio ? "Stop Audio" : "Listen to Audio"}</div>
                  <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">Listen to AI spoken summary</div>
                </div>
              </button>

              {/* Option 6: Visit Original Source */}
              {summary.originalUrl && (
                <a
                  href={summary.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenu({ isOpen: false, x: 0, y: 0 });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <ExternalLink className="h-4 w-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">Visit Source</div>
                    <div className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">Open full original link</div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { FeedCardSkeleton, FeedCardSkeletonList } from "./FeedCardSkeleton";

