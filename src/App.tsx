import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Youtube, 
  Twitter, 
  Instagram, 
  Newspaper, 
  Filter, 
  Flame, 
  Clock, 
  GraduationCap, 
  ChevronRight,
  TrendingUp,
  Globe2,
  RefreshCw,
  Zap
} from "lucide-react";
import { 
  SummaryItem, 
  Creator, 
  DailyDigest, 
  UserProfile, 
  NotificationItem, 
  Language, 
  Platform, 
  Category 
} from "./types";
import { StorageUtils } from "./utils/storage";
import { AiService } from "./services/aiService";

// Sub-components
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { FeedCard } from "./components/FeedCard";
import { SummaryModal } from "./components/SummaryModal";
import { SummarizeUrlModal } from "./components/SummarizeUrlModal";
import { DailyDigestView } from "./components/DailyDigestView";
import { CurrentAffairsView } from "./components/CurrentAffairsView";
import { ExploreView } from "./components/ExploreView";
import { SavedView } from "./components/SavedView";
import { DashboardView } from "./components/DashboardView";
import { SettingsView } from "./components/SettingsView";
import { LandingView } from "./components/LandingView";
import { NotificationsModal } from "./components/NotificationsModal";
import { AuthModal } from "./components/AuthModal";
import { VerificationAuditModal } from "./components/VerificationAuditModal";
import { PlayStoreInstallModal } from "./components/PlayStoreInstallModal";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function App() {
  // Navigation & View
  const [currentView, setCurrentView] = useState<string>("feed");
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Global State
  const [user, setUser] = useState<UserProfile>(StorageUtils.getUser());
  const [summaries, setSummaries] = useState<SummaryItem[]>(StorageUtils.getSummaries());
  const [creators, setCreators] = useState<Creator[]>(StorageUtils.getCreators());
  const [categories, setCategories] = useState<Category[]>(StorageUtils.getCategories());
  const [savedIds, setSavedIds] = useState<string[]>(StorageUtils.getSavedSummaryIds());
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageUtils.getNotifications());
  const [dailyDigest, setDailyDigest] = useState<DailyDigest>(StorageUtils.getDailyDigest());

  // Search & Filters on Feed
  const [searchQuery, setSearchQuery] = useState("");
  const [feedPlatformFilter, setFeedPlatformFilter] = useState<string>("All");
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<string>("All");

  // Appearance & Language
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentLanguage, setCurrentLanguage] = useState<Language>(user.preferences?.language || "en");

  // Modals
  const [activeSummaryModal, setActiveSummaryModal] = useState<SummaryItem | null>(null);
  const [summaryModalInitialTab, setSummaryModalInitialTab] = useState<string>("quick");
  const [isSummarizeUrlModalOpen, setIsSummarizeUrlModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRefreshingDigest, setIsRefreshingDigest] = useState(false);

  // Verified Ingestion State
  const [auditModalSummary, setAuditModalSummary] = useState<SummaryItem | null>(null);
  const [isAutoFetchingVerified, setIsAutoFetchingVerified] = useState(false);
  const [onlyVerifiedFeedFilter, setOnlyVerifiedFeedFilter] = useState(false);
  const [syncStatusNotice, setSyncStatusNotice] = useState<string | null>(null);

  // Play Store & Android PWA Installation State
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === "accepted") {
        setDeferredInstallPrompt(null);
      }
    } else {
      setIsPlayStoreModalOpen(true);
    }
  };

  // Synchronize Theme to HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Sync Language change to User Preferences
  const handleLanguageChange = (newLang: Language) => {
    setCurrentLanguage(newLang);
    const updated = {
      ...user,
      preferences: {
        ...user.preferences,
        language: newLang,
      },
    };
    setUser(updated);
    StorageUtils.saveUser(updated);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Saved / Bookmark Toggle
  const handleToggleSave = (summaryId: string) => {
    const isSaved = savedIds.includes(summaryId);
    let newSavedIds: string[];
    if (isSaved) {
      newSavedIds = savedIds.filter((id) => id !== summaryId);
    } else {
      newSavedIds = [...savedIds, summaryId];
    }
    setSavedIds(newSavedIds);
    StorageUtils.saveSavedSummaryIds(newSavedIds);

    // Update isSaved on summaries
    const updated = summaries.map((s) => (s.id === summaryId ? { ...s, isSaved: !isSaved } : s));
    setSummaries(updated);
    StorageUtils.saveSummaries(updated);
  };

  // Follow Creator Toggle
  const handleToggleFollow = (creatorId: string) => {
    const updated = creators.map((c) => (c.id === creatorId ? { ...c, isFollowed: !c.isFollowed } : c));
    setCreators(updated);
    StorageUtils.saveCreators(updated);
  };

  // Add Custom Category
  const handleAddCategory = (newCat: string) => {
    if (!categories.includes(newCat as Category)) {
      const updated = [...categories, newCat as Category];
      setCategories(updated);
      StorageUtils.saveCategories(updated);
    }
  };

  // Add Custom Creator
  const handleAddCreator = (newCreator: Creator) => {
    const updated = [newCreator, ...creators];
    setCreators(updated);
    StorageUtils.saveCreators(updated);
  };

  // Add New Summary (from URL or text input)
  const handleAddSummary = (newSummary: SummaryItem) => {
    const updated = [newSummary, ...summaries];
    setSummaries(updated);
    StorageUtils.saveSummaries(updated);

    // Update user stats
    const updatedUser = {
      ...user,
      summariesReadCount: user.summariesReadCount + 1,
      hoursSavedEstimated: Number((user.hoursSavedEstimated + 0.5).toFixed(1)),
    };
    setUser(updatedUser);
    StorageUtils.saveUser(updatedUser);

    // Automatically open the new summary in the modal!
    setActiveSummaryModal(newSummary);
    setSummaryModalInitialTab("quick");
  };

  // Open Summary Modal
  const handleOpenSummary = (summary: SummaryItem, initialTab = "quick") => {
    setActiveSummaryModal(summary);
    setSummaryModalInitialTab(initialTab);

    // Mark as read
    if (!summary.isRead) {
      const updated = summaries.map((s) => (s.id === summary.id ? { ...s, isRead: true } : s));
      setSummaries(updated);
      StorageUtils.saveSummaries(updated);
    }
  };

  // Notifications Actions
  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    StorageUtils.saveNotifications(updated);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    StorageUtils.saveNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // mark this item as read
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n));
    setNotifications(updated);
    StorageUtils.saveNotifications(updated);
    setIsNotificationsModalOpen(false);

    if (item.targetSummaryId) {
      const found = summaries.find((s) => s.id === item.targetSummaryId);
      if (found) {
        handleOpenSummary(found, "quick");
      }
    } else if (item.type === "daily_digest") {
      setCurrentView("digest");
    } else if (item.type === "exam_alert") {
      setCurrentView("current-affairs");
    }
  };

  // Regenerate / Refresh Daily Digest
  const handleRefreshDailyDigest = async () => {
    setIsRefreshingDigest(true);
    try {
      const newDigest = await AiService.generateDailyDigest(summaries, currentLanguage);
      setDailyDigest(newDigest);
      StorageUtils.saveDailyDigest(newDigest);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingDigest(false);
    }
  };

  // Automated Ingestion & Verification Pipeline
  const handleAutoFetchVerified = async (targetCategory = "Current Affairs") => {
    if (isAutoFetchingVerified) return;
    setIsAutoFetchingVerified(true);
    try {
      const existingTitlesList = summaries.map((s) => s.title);
      const fetchedItems = await AiService.autoFetchVerifiedNews(targetCategory, currentLanguage, existingTitlesList);
      if (fetchedItems && fetchedItems.length > 0) {
        const existingTitles = new Set(summaries.map((s) => s.title.toLowerCase().trim()));
        const existingRefs = new Set(summaries.map((s) => s.verification?.sourceReferenceId).filter(Boolean));

        const freshItems = fetchedItems.filter((item) => {
          const titleMatch = existingTitles.has(item.title.toLowerCase().trim());
          const refMatch = item.verification?.sourceReferenceId && existingRefs.has(item.verification.sourceReferenceId);
          return !titleMatch && !refMatch;
        });

        if (freshItems.length > 0) {
          const updated = [...freshItems, ...summaries];
          setSummaries(updated);
          StorageUtils.saveSummaries(updated);

          const newNotif: NotificationItem = {
            id: `notif-verified-${Date.now()}`,
            title: `🛡️ Verified News Ingested (${freshItems.length} New)`,
            message: `Official dispatches verified against wire agencies: "${freshItems[0].title}". Authenticated truth score: ${freshItems[0].verification?.verificationScore || 98}%.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: "exam_alert",
            targetSummaryId: freshItems[0].id,
          };
          const updatedNotifs = [newNotif, ...notifications];
          setNotifications(updatedNotifs);
          StorageUtils.saveNotifications(updatedNotifs);

          setSyncStatusNotice(`Added ${freshItems.length} verified dispatches from official wire sources.`);
          setTimeout(() => setSyncStatusNotice(null), 6000);
        } else {
          setSyncStatusNotice("All news dispatches are up to date and verified.");
          setTimeout(() => setSyncStatusNotice(null), 4000);
        }
      }
    } catch (err) {
      console.warn("Auto-fetch verified news notice:", err);
    } finally {
      setIsAutoFetchingVerified(false);
    }
  };

  // Background auto-sync interval for continuous verification ingestion
  useEffect(() => {
    // Check after brief delay on startup
    const timer = setTimeout(() => {
      if (summaries.length <= 10) {
        handleAutoFetchVerified("Current Affairs");
      }
    }, 1200);

    const intervalSeconds = user.preferences?.autoSyncIntervalSeconds || 180;
    const interval = setInterval(() => {
      if (user.preferences?.autoSyncVerifiedNews !== false) {
        handleAutoFetchVerified("Current Affairs");
      }
    }, intervalSeconds * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user.preferences?.autoSyncVerifiedNews, user.preferences?.autoSyncIntervalSeconds]);

  // Filtered Summaries for Home Feed
  const filteredFeedSummaries = useMemo(() => {
    return summaries.filter((item) => {
      // Platform filter
      if (feedPlatformFilter !== "All" && item.platform !== feedPlatformFilter) {
        return false;
      }
      // Category filter
      if (feedCategoryFilter !== "All" && item.category !== feedCategoryFilter) {
        return false;
      }
      // Verified only filter
      if (onlyVerifiedFeedFilter && item.verification?.isVerified === false) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCreator = item.creatorName.toLowerCase().includes(q);
        const matchesQuick = item.quickSummary.some((x) => x.toLowerCase().includes(q));
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCreator && !matchesQuick && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [summaries, feedPlatformFilter, feedCategoryFilter, searchQuery, onlyVerifiedFeedFilter]);

  // Feed platform chips
  const platformTabs = [
    { id: "All", label: "All Feeds" },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "x", label: "X (Twitter)", icon: Twitter },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "news", label: "News Wire", icon: Newspaper },
  ];

  return (
    <div className={`min-h-screen bg-neutral-50 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100 ${currentLanguage === "ur" ? "lang-ur" : currentLanguage === "hi" ? "lang-hi" : ""}`}>
      
      {/* Universal Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSummarizeModal={() => setIsSummarizeUrlModalOpen(true)}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        user={user}
        onNavigate={(view) => setCurrentView(view)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        isSidebarOpen={isSidebarOpenMobile}
        onTriggerAutoFetch={() => handleAutoFetchVerified("Current Affairs")}
        isFetchingVerified={isAutoFetchingVerified}
        onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
      />

      {/* Main Layout: Sidebar + Viewport */}
      <div className="mx-auto flex max-w-7xl">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          user={user}
          savedCount={savedIds.length}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          onOpenSummarizeModal={() => setIsSummarizeUrlModalOpen(true)}
          onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
        />

        {/* Viewport Main Container */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          
          {/* VIEW 1: HOME FEED */}
          {currentView === "feed" && (
            <div className="mx-auto max-w-4xl space-y-6">
              
              {/* Daily Briefing Banner Widget */}
              <div 
                onClick={() => setCurrentView("digest")}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent p-4 transition-all hover:border-indigo-300 dark:border-indigo-900/40 dark:from-indigo-950/40 dark:via-violet-950/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                          TODAY'S DAILY DIGEST READY
                        </span>
                        <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          5 Min Read
                        </span>
                      </div>
                      <p className="line-clamp-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 sm:text-sm">
                        {dailyDigest.briefingHeadline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform dark:text-indigo-400">
                    <span className="hidden sm:inline">Open Digest</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Automated Verified News Sync Status Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isAutoFetchingVerified ? "animate-ping" : ""}`} />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-emerald-950 dark:text-emerald-200">
                    {syncStatusNotice || "Automated Verified Ingestion Active • Cross-checked with official wires"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="feed-toggle-verified-only-btn"
                    onClick={() => setOnlyVerifiedFeedFilter(!onlyVerifiedFeedFilter)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      onlyVerifiedFeedFilter
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 dark:bg-neutral-800 dark:border-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {onlyVerifiedFeedFilter ? "✓ Verified Only" : "Show Verified Only"}
                  </button>
                  <button
                    id="feed-manual-sync-btn"
                    onClick={() => handleAutoFetchVerified("Current Affairs")}
                    disabled={isAutoFetchingVerified}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 font-bold text-white shadow-2xs hover:bg-emerald-700 transition disabled:opacity-60"
                    title="Ingest fresh breaking news and authenticate claims"
                  >
                    <RefreshCw className={`h-3 w-3 ${isAutoFetchingVerified ? "animate-spin" : ""}`} />
                    <span>{isAutoFetchingVerified ? "Ingesting..." : "Sync Fresh News"}</span>
                  </button>
                </div>
              </div>

              {/* Feed Filters: Platform Buttons & Category Chips */}
              <div className="space-y-2.5">
                {/* Platform Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {platformTabs.map((p) => {
                    const Icon = p.icon;
                    const isSelected = feedPlatformFilter === p.id;
                    return (
                      <button
                        key={p.id}
                        id={`feed-platform-${p.id}`}
                        onClick={() => setFeedPlatformFilter(p.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          isSelected
                            ? "bg-neutral-900 text-white shadow-2xs dark:bg-white dark:text-neutral-900"
                            : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Categories Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {["All", ...categories].map((c) => {
                    const isSelected = feedCategoryFilter === c;
                    return (
                      <button
                        key={c}
                        id={`feed-cat-${c.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => setFeedCategoryFilter(c)}
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                          isSelected
                            ? "bg-indigo-600 text-white dark:bg-indigo-500"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summaries Stream */}
              {filteredFeedSummaries.length > 0 ? (
                <div className="space-y-4">
                  {filteredFeedSummaries.map((summary) => (
                    <FeedCard
                      key={summary.id}
                      summary={summary}
                      currentLanguage={currentLanguage}
                      onOpenSummary={handleOpenSummary}
                      onToggleSave={handleToggleSave}
                      isSaved={savedIds.includes(summary.id)}
                      onOpenAudit={(s) => setAuditModalSummary(s)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                  <Search className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-600 mb-2" />
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    No matching summaries found
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Try searching for another keyword or reset platform filters.
                  </p>
                  <button
                    onClick={() => {
                      setFeedPlatformFilter("All");
                      setFeedCategoryFilter("All");
                      setSearchQuery("");
                      setOnlyVerifiedFeedFilter(false);
                    }}
                    className="mt-3 rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: CURRENT AFFAIRS MODE */}
          {currentView === "current-affairs" && (
            <CurrentAffairsView
              summaries={summaries}
              currentLanguage={currentLanguage}
              onOpenSummary={handleOpenSummary}
              onToggleSave={handleToggleSave}
              savedIds={savedIds}
              onOpenAudit={(s) => setAuditModalSummary(s)}
              onTriggerAutoFetch={handleAutoFetchVerified}
              isFetchingVerified={isAutoFetchingVerified}
            />
          )}

          {/* VIEW 3: DAILY DIGEST VIEW */}
          {currentView === "digest" && (
            <DailyDigestView
              digest={dailyDigest}
              summaries={summaries}
              currentLanguage={currentLanguage}
              onOpenSummary={handleOpenSummary}
              onRefreshDigest={handleRefreshDailyDigest}
              isRefreshing={isRefreshingDigest}
            />
          )}

          {/* VIEW 4: EXPLORE CREATORS & CHANNELS */}
          {currentView === "explore" && (
            <ExploreView
              creators={creators}
              onToggleFollow={handleToggleFollow}
              categories={categories}
              onAddCategory={handleAddCategory}
              onAddCreator={handleAddCreator}
            />
          )}

          {/* VIEW 5: SAVED SUMMARIES & BOOKMARKS */}
          {currentView === "saved" && (
            <SavedView
              summaries={summaries}
              savedIds={savedIds}
              currentLanguage={currentLanguage}
              onOpenSummary={handleOpenSummary}
              onToggleSave={handleToggleSave}
              onOpenAudit={(s) => setAuditModalSummary(s)}
            />
          )}

          {/* VIEW 6: USER DASHBOARD & READING STATS */}
          {currentView === "dashboard" && (
            <DashboardView
              user={user}
              summaries={summaries}
              savedCount={savedIds.length}
              creators={creators}
              onNavigate={(view) => setCurrentView(view)}
              onOpenSummary={handleOpenSummary}
            />
          )}

          {/* VIEW 7: SETTINGS & PREFERENCES */}
          {currentView === "settings" && (
            <SettingsView
              user={user}
              onUpdateUser={(updated) => {
                const merged = { ...user, ...updated };
                setUser(merged);
                StorageUtils.saveUser(merged);
              }}
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
            />
          )}

          {/* VIEW 8: PRODUCT OVERVIEW / LANDING PAGE */}
          {currentView === "landing" && (
            <LandingView
              onGetStarted={() => {
                setIsAuthModalOpen(true);
              }}
              onExploreFeed={() => {
                setCurrentView("feed");
              }}
            />
          )}
        </main>
      </div>

      {/* POPUP MODALS */}

      {/* 1. Interactive Multi-Tier Summary Reader & AI Chat */}
      <SummaryModal
        summary={activeSummaryModal}
        isOpen={Boolean(activeSummaryModal)}
        onClose={() => setActiveSummaryModal(null)}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        isSaved={activeSummaryModal ? savedIds.includes(activeSummaryModal.id) : false}
        onToggleSave={handleToggleSave}
        initialTab={summaryModalInitialTab}
      />

      {/* 2. Summarize Custom URL or Text Modal */}
      <SummarizeUrlModal
        isOpen={isSummarizeUrlModalOpen}
        onClose={() => setIsSummarizeUrlModalOpen(false)}
        onAddSummary={handleAddSummary}
        currentLanguage={currentLanguage}
      />

      {/* 3. Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNotificationClick={handleNotificationClick}
        onClearNotifications={handleClearNotifications}
      />

      {/* 4. Auth / Sign In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onLogin={(updatedUser) => {
          setUser(updatedUser);
          StorageUtils.saveUser(updatedUser);
        }}
      />

      {/* 5. Verification Audit Certificate Modal */}
      <VerificationAuditModal
        summary={auditModalSummary}
        isOpen={Boolean(auditModalSummary)}
        onClose={() => setAuditModalSummary(null)}
      />

      {/* 6. Play Store & Android PWA Packaging Modal */}
      <PlayStoreInstallModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
        deferredPrompt={deferredInstallPrompt}
        onInstallApp={handleInstallApp}
      />
    </div>
  );
}
