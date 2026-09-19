import React from "react";
import { 
  Rss, 
  Compass, 
  GraduationCap, 
  Clock, 
  Bookmark, 
  LayoutDashboard, 
  Settings, 
  Sparkles,
  Flame,
  Globe2,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Instagram,
  X
} from "lucide-react";
import { UserProfile } from "../types";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile;
  savedCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSummarizeModal: () => void;
  onOpenPlayStoreModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  savedCount,
  isOpenMobile,
  onCloseMobile,
  onOpenSummarizeModal,
  onOpenPlayStoreModal,
}) => {
  const navItems = [
    {
      id: "feed",
      label: "Home Feed",
      icon: Rss,
      badge: "Live",
    },
    {
      id: "current-affairs",
      label: "Current Affairs",
      icon: GraduationCap,
      badge: "Exam Mode",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    },
    {
      id: "digest",
      label: "Daily Digest",
      icon: Clock,
      badge: "5 Min",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    },
    {
      id: "explore",
      label: "Explore Creators",
      icon: Compass,
    },
    {
      id: "saved",
      label: "Saved Summaries",
      icon: Bookmark,
      count: savedCount,
    },
    {
      id: "dashboard",
      label: "My Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
    {
      id: "landing",
      label: "Product Overview",
      icon: Globe2,
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-in-out dark:border-neutral-800 dark:bg-neutral-900 md:static md:z-10 md:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800">
          <div 
            onClick={() => handleItemClick("feed")}
            className="flex cursor-pointer items-center gap-2.5"
          >
            <img
              src="/icon.svg"
              alt="SummaryHub Logo"
              className="h-8 w-8 rounded-xl object-contain shadow-xs shadow-indigo-500/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-neutral-900 dark:text-white">
                  Summary<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
                </span>
                <span className="rounded-full bg-indigo-50 px-1 py-0.2 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                create by Sarfaraz Shah
              </p>
            </div>
          </div>
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
            Navigation
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/80 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-400 group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-200"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${item.badgeColor || "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"}`}>
                      {item.badge}
                    </span>
                  )}

                  {item.count !== undefined && item.count > 0 && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick AI Action Card */}
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-violet-50/70 p-4 dark:border-indigo-900/30 dark:from-indigo-950/30 dark:to-violet-950/20">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold tracking-tight uppercase">AI Summarizer</span>
            </div>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Have a long YouTube video, X thread, or news article?
            </p>
            <button
              id="sidebar-quick-summarize-btn"
              onClick={() => {
                onOpenSummarizeModal();
                onCloseMobile();
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <span>Summarize Any URL</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Play Store & Mobile App Banner */}
          {onOpenPlayStoreModal && (
            <div className="mt-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-850/50">
              <button
                id="sidebar-playstore-btn"
                onClick={() => {
                  onOpenPlayStoreModal();
                  onCloseMobile();
                }}
                className="flex w-full items-center justify-between text-left text-xs font-semibold text-neutral-800 transition hover:text-indigo-600 dark:text-neutral-200 dark:hover:text-indigo-400"
              >
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Google Play & Android</span>
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Ready
                </span>
              </button>
              <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                Install directly on phone or package as .aab bundle.
              </p>
            </div>
          )}

          {/* Support or Report - Sarfaraz Shah Instagram */}
          <div className="mt-3 rounded-2xl border border-rose-200/80 bg-rose-50/60 p-3 dark:border-rose-900/50 dark:bg-rose-950/30">
            <a
              id="sidebar-support-report-link"
              href="https://www.instagram.com/horizonseer._?stkn=amlld3BudWdwa2l0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between text-left text-xs font-semibold text-rose-900 transition hover:text-rose-700 dark:text-rose-200 dark:hover:text-rose-300"
            >
              <span className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span>Support or Report</span>
              </span>
              <ExternalLink className="h-3 w-3 text-rose-400" />
            </a>
            <p className="mt-1 text-[11px] text-rose-700/80 dark:text-rose-300/80">
              Direct DM with Sarfaraz Shah on Instagram (@horizonseer._).
            </p>
          </div>

          {/* User Streak & Saved Time Badge */}
          <div className="mt-4 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" />
                Reading Streak
              </span>
              <span className="text-amber-600 dark:text-amber-400">{user.readingStreakDays} Days</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>Time Saved</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">~{user.hoursSavedEstimated} Hours</span>
            </div>
          </div>
        </div>

        {/* Bottom User Info */}
        <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
          <div 
            onClick={() => handleItemClick("dashboard")}
            className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">{user.name}</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 capitalize">{user.role} plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
