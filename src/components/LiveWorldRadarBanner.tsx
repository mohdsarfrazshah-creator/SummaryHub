import React, { useState } from "react";
import { 
  Globe2, 
  Radio, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  Flame,
  Zap,
  Newspaper
} from "lucide-react";
import { SummaryItem, Language } from "../types";

interface LiveWorldRadarBannerProps {
  isAutoConnecting: boolean;
  onToggleAutoConnect: () => void;
  onManualWorldSync: () => void;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  recentLiveDispatches: SummaryItem[];
  onOpenSummary: (summary: SummaryItem, initialTab?: string) => void;
  onOpenAddNewsModal: () => void;
  currentLanguage: Language;
}

export const LiveWorldRadarBanner: React.FC<LiveWorldRadarBannerProps> = ({
  isAutoConnecting,
  onToggleAutoConnect,
  onManualWorldSync,
  isSyncing,
  lastSyncTime,
  recentLiveDispatches,
  onOpenSummary,
  onOpenAddNewsModal,
  currentLanguage,
}) => {
  const [selectedRegion, setSelectedRegion] = useState("Global");

  const regions = ["Global", "National", "Geopolitics", "Economy", "Sci-Tech", "Climate"];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-indigo-500/10 p-4 sm:p-5 shadow-xs transition-all dark:border-rose-900/40 dark:from-rose-950/30 dark:via-neutral-900/40 dark:to-indigo-950/20">
      
      {/* Background Decorative Radar Grid Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl dark:bg-rose-500/15" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/15" />

      {/* Top Status Bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        
        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] sm:text-xs font-extrabold tracking-wider text-rose-700 uppercase dark:text-rose-400">
              Live World Monitor
            </span>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
              {isAutoConnecting ? "CONNECTED TO WIRES" : "MANUAL MODE"}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Auto-Connect Toggle Button */}
          <button
            id="toggle-live-world-autoconnect-btn"
            onClick={onToggleAutoConnect}
            className={`flex items-center gap-1 rounded-lg sm:rounded-xl border px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition ${
              isAutoConnecting 
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
            title="Automatically poll and stream breaking world developments in real time"
          >
            <Radio className={`h-3 w-3 shrink-0 ${isAutoConnecting ? "animate-pulse text-emerald-600 dark:text-emerald-400" : "text-neutral-400"}`} />
            <span className="hidden xs:inline">{isAutoConnecting ? "Auto-Stream: ON" : "Auto-Stream: OFF"}</span>
            <span className="xs:hidden">{isAutoConnecting ? "Live" : "Off"}</span>
          </button>

          {/* Sync World News Now Button */}
          <button
            id="manual-world-sync-btn"
            onClick={onManualWorldSync}
            disabled={isSyncing}
            className="flex items-center gap-1 rounded-lg sm:rounded-xl bg-neutral-900 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-white shadow-2xs transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            title="Poll Reuters, PIB, BBC, and wire feeds right now"
          >
            <RefreshCw className={`h-3 w-3 shrink-0 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden xs:inline">{isSyncing ? "Polling..." : "Update World News"}</span>
            <span className="xs:hidden">{isSyncing ? "Polling" : "Sync"}</span>
          </button>

          {/* Add News Article Button */}
          <button
            id="radar-add-news-modal-btn"
            onClick={onOpenAddNewsModal}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-indigo-700"
            title="Submit news or search live breaking topics"
          >
            <Newspaper className="h-3 w-3 shrink-0" />
            <span>+ Add News</span>
          </button>
        </div>
      </div>

      {/* Main Headline & Context */}
      <div className="relative mt-3">
        <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
          Automatically Connecting to Live Happenings in the World
        </h3>
        <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-300">
          Tracking breaking geopolitics, central bank dispatches, scientific milestones, and government gazettes in real time.
          {lastSyncTime && (
            <span className="ml-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              (Last world pulse: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          )}
        </p>
      </div>

      {/* Live Breaking Ticker / Carousel of Recent Dispatches */}
      {recentLiveDispatches && recentLiveDispatches.length > 0 && (
        <div className="relative mt-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Breaking World Dispatches (Click to Read Summary):
            </span>
            <span className="text-[10px] text-neutral-400">
              {recentLiveDispatches.length} Live Items
            </span>
          </div>

          <div className="relative -mx-1 px-1">
            <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar smooth-touch-scroll">
              {recentLiveDispatches.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenSummary(item, "quick")}
                  className="group shrink-0 w-60 sm:w-72 cursor-pointer rounded-2xl border border-white/70 bg-white/90 p-3 shadow-2xs transition-all hover:border-rose-300 hover:shadow-xs hover:-translate-y-0.5 dark:border-neutral-800 dark:bg-neutral-850/90 dark:hover:border-rose-700"
                >
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="truncate max-w-[120px] rounded-md bg-neutral-100 px-1.5 py-0.5 font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {item.creatorName}
                    </span>
                    <span className="flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{item.verification?.verificationScore || 98}% Verified</span>
                    </span>
                  </div>

                  <h4 className="mt-1.5 text-xs font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors line-clamp-2 dark:text-white dark:group-hover:text-indigo-400">
                    {item.title}
                  </h4>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                    <span>{new Date(item.publishDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform dark:text-indigo-400">
                      <span>2 min summary</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Subtle right gradient fade scroll cue */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-1.5 w-8 bg-gradient-to-l from-rose-50/80 via-rose-50/30 to-transparent dark:from-neutral-950/80 dark:via-neutral-950/30 dark:to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
};
