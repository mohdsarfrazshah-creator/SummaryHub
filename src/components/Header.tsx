import React, { useState } from "react";
import { 
  Sparkles, 
  Search, 
  Globe, 
  Sun, 
  Moon, 
  Bell, 
  PlusCircle, 
  Menu, 
  X,
  Check,
  Bookmark,
  User,
  Settings,
  LogOut,
  Flame,
  ShieldCheck,
  RefreshCw,
  Smartphone
} from "lucide-react";
import { Language, UserProfile, NotificationItem } from "../types";

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSummarizeModal: () => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  user: UserProfile;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onTriggerAutoFetch?: () => void;
  isFetchingVerified?: boolean;
  onOpenPlayStoreModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  onOpenSummarizeModal,
  notifications,
  onOpenNotifications,
  user,
  onNavigate,
  onOpenAuth,
  onToggleSidebar,
  isSidebarOpen,
  onTriggerAutoFetch,
  isFetchingVerified = false,
  onOpenPlayStoreModal,
}) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const languages: { code: Language; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "ur", label: "Urdu", native: "اردو" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-neutral-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            id="header-brand-logo-btn"
            onClick={() => onNavigate("feed")}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-sm shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  Summary<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
                </span>
                <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  AI
                </span>
              </div>
              <p className="hidden text-[11px] text-neutral-500 dark:text-neutral-400 sm:block">
                Signal Over Noise
              </p>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="mx-4 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search topics, creators, keywords, or exam affairs..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-10 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-white dark:placeholder-neutral-500 dark:focus:border-indigo-400 dark:focus:bg-neutral-800"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Play Store & Android App Modal Trigger */}
          {onOpenPlayStoreModal && (
            <button
              id="header-playstore-btn"
              onClick={onOpenPlayStoreModal}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 sm:px-3 sm:py-2"
              title="Publish to Google Play Store & Install on Android"
            >
              <Smartphone className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Play Store / App</span>
              <span className="sm:hidden">App</span>
            </button>
          )}

          {/* Quick Verified News Ingest Trigger */}
          {onTriggerAutoFetch && (
            <button
              id="header-verified-sync-btn"
              onClick={onTriggerAutoFetch}
              disabled={isFetchingVerified}
              className="hidden items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 md:flex"
              title="Automatically poll and verify fresh news wires"
            >
              <ShieldCheck className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${isFetchingVerified ? "animate-pulse" : ""}`} />
              <span>{isFetchingVerified ? "Verifying..." : "Verified Sync"}</span>
            </button>
          )}

          {/* Quick Summarize URL button */}
          <button
            id="header-summarize-url-btn"
            onClick={onOpenSummarizeModal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-95 sm:px-3.5 sm:py-2 sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Summarize Link</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Reading Streak Indicator */}
          <div 
            onClick={() => onNavigate("dashboard")}
            title={`${user.readingStreakDays} Day Reading Streak`}
            className="hidden cursor-pointer items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 lg:flex"
          >
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>{user.readingStreakDays}d streak</span>
          </div>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              id="header-language-dropdown-btn"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1 rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
              title="Change Language (English, Hindi, Urdu)"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">{currentLanguage}</span>
            </button>

            {isLangDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-44 rounded-xl border border-neutral-200 bg-white py-1.5 shadow-xl transition dark:border-neutral-700 dark:bg-neutral-800"
                onMouseLeave={() => setIsLangDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                  Select Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    id={`lang-btn-${l.code}`}
                    onClick={() => {
                      onLanguageChange(l.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition ${
                      currentLanguage === l.code
                        ? "bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700/60"
                    }`}
                  >
                    <span>
                      {l.label} <span className="text-xs text-neutral-400">({l.native})</span>
                    </span>
                    {currentLanguage === l.code && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            id="header-theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Trigger */}
          <button
            id="header-notifications-btn"
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar / Menu */}
          <div className="relative">
            <button
              id="header-user-avatar-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-full ring-2 ring-transparent transition hover:ring-indigo-500/30 focus:outline-none"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
              />
            </button>

            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-1.5 shadow-xl transition dark:border-neutral-700 dark:bg-neutral-800"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="border-b border-neutral-100 px-4 py-2.5 dark:border-neutral-700/60">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{user.name}</p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                  <span className="mt-1 inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 capitalize">
                    {user.role} plan
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigate("dashboard");
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700/50"
                  >
                    <User className="h-4 w-4 text-neutral-400" />
                    <span>My Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("saved");
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700/50"
                  >
                    <Bookmark className="h-4 w-4 text-neutral-400" />
                    <span>Saved Summaries</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("settings");
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700/50"
                  >
                    <Settings className="h-4 w-4 text-neutral-400" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="border-t border-neutral-100 pt-1 dark:border-neutral-700/60">
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Switch Account / Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="border-t border-neutral-100 px-4 py-2 dark:border-neutral-800 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search topics, creators, news..."
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 pl-9 pr-8 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
      </div>
    </header>
  );
};
