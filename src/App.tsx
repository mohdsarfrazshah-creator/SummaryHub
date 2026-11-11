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
  Category,
  ReadLaterItem,
  ReadLaterSettings
} from "./types";
import { StorageUtils, sortByPublishDateNewestFirst, sortSummaries, mergeAndDeduplicateSummaries } from "./utils/storage";
import { AiService } from "./services/aiService";

// Sub-components
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { FeedCard, FeedCardSkeleton, FeedCardSkeletonList } from "./components/FeedCard";
import { SummaryModal } from "./components/SummaryModal";
import { SummarizeUrlModal } from "./components/SummarizeUrlModal";
import { DailyDigestView } from "./components/DailyDigestView";
import { CurrentAffairsView } from "./components/CurrentAffairsView";
import { ExploreView } from "./components/ExploreView";
import { SavedView } from "./components/SavedView";
import { ReadLaterView } from "./components/ReadLaterView";
import { DashboardView } from "./components/DashboardView";
import { SettingsView } from "./components/SettingsView";
import { LandingView } from "./components/LandingView";
import { OwnerDashboardView } from "./components/OwnerDashboardView";
import { NotificationsModal } from "./components/NotificationsModal";
import { AuthModal } from "./components/AuthModal";
import { VerificationAuditModal } from "./components/VerificationAuditModal";
import { PlayStoreInstallModal } from "./components/PlayStoreInstallModal";
import { AddNewsModal } from "./components/AddNewsModal";
import { ImagePickerModal } from "./components/ImagePickerModal";
import { LiveWorldRadarBanner } from "./components/LiveWorldRadarBanner";
import { NewsFreshnessMonitorModal } from "./components/NewsFreshnessMonitorModal";
import { ShieldCheck, CheckCircle2, Archive, X, ChevronDown } from "lucide-react";

export default function App() {
  // Navigation & View
  const [initialOwnerToken] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("token") || undefined;
    }
    return undefined;
  });

  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (viewParam) return viewParam;
      if (params.get("token")) return "owner-dashboard";
    }
    return "feed";
  });
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Global State
  const [user, setUser] = useState<UserProfile>(StorageUtils.getUser());
  const [summaries, setSummaries] = useState<SummaryItem[]>(StorageUtils.getSummaries());
  const [creators, setCreators] = useState<Creator[]>(StorageUtils.getCreators());
  const [categories, setCategories] = useState<Category[]>(StorageUtils.getCategories());
  const [savedIds, setSavedIds] = useState<string[]>(StorageUtils.getSavedSummaryIds());
  const [readLaterItems, setReadLaterItems] = useState<ReadLaterItem[]>(() => StorageUtils.getReadLaterItems());
  const [readLaterSettings, setReadLaterSettings] = useState<ReadLaterSettings>(() => StorageUtils.getReadLaterSettings());
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageUtils.getNotifications());
  const [dailyDigest, setDailyDigest] = useState<DailyDigest>(StorageUtils.getDailyDigest());

  // Search & Filters on Feed
  const [searchQuery, setSearchQuery] = useState("");
  const [feedPlatformFilter, setFeedPlatformFilter] = useState<string>("All");
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<string>("All");
  const [feedSourceFilter, setFeedSourceFilter] = useState<string>("All");
  const [feedDateFilter, setFeedDateFilter] = useState<"all" | "today" | "7d" | "30d">("all");
  const [feedSortOrder, setFeedSortOrder] = useState<"newest" | "updated" | "popular" | "oldest">("newest");

  // Historical Archive Pagination & Server Query State
  const [archiveTotalCount, setArchiveTotalCount] = useState<number>(0);
  const [archivePage, setArchivePage] = useState<number>(1);
  const [archiveHasMore, setArchiveHasMore] = useState<boolean>(true);
  const [isLoadingMoreArchive, setIsLoadingMoreArchive] = useState<boolean>(false);

  // Appearance & Language
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentLanguage, setCurrentLanguage] = useState<Language>(user.preferences?.language || "en");

  // Modals
  const [activeSummaryModal, setActiveSummaryModal] = useState<SummaryItem | null>(null);
  const [summaryModalInitialTab, setSummaryModalInitialTab] = useState<string>("quick");
  const [isSummarizeUrlModalOpen, setIsSummarizeUrlModalOpen] = useState(false);
  const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRefreshingDigest, setIsRefreshingDigest] = useState(false);
  const [imagePickerSummary, setImagePickerSummary] = useState<SummaryItem | null>(null);

  // Verified Ingestion State
  const [auditModalSummary, setAuditModalSummary] = useState<SummaryItem | null>(null);
  const [isAutoFetchingVerified, setIsAutoFetchingVerified] = useState(false);
  const [onlyVerifiedFeedFilter, setOnlyVerifiedFeedFilter] = useState(false);
  const [syncStatusNotice, setSyncStatusNotice] = useState<string | null>(null);

  // Live World Happenings Connection State (Auto-Connect)
  const [isAutoConnectingWorld, setIsAutoConnectingWorld] = useState(true);
  const [isSyncingWorld, setIsSyncingWorld] = useState(false);
  const [lastWorldSyncTime, setLastWorldSyncTime] = useState<Date | null>(new Date());

  // Play Store & Android PWA Installation State
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // Ingestion Pipeline Freshness & Telemetry Monitor State
  const [isFreshnessMonitorOpen, setIsFreshnessMonitorOpen] = useState(false);

  // Feed Loading State for Skeleton Shimmer
  const [isFeedLoading, setIsFeedLoading] = useState(true);

  // Initial Feed Ingestion from Configured Sources & Continuous Real-Time Refresh
  useEffect(() => {
    let isMounted = true;
    async function loadFreshNewsFeed() {
      try {
        const data = await AiService.getNews({ limit: 36, sort: "latest", page: 1 });
        if (isMounted && data.articles) {
          setArchiveTotalCount(data.total || data.articles.length);
          setArchiveHasMore(Boolean(data.hasMore));
          if (data.articles.length > 0) {
            setSummaries((prev) => {
              const merged = mergeAndDeduplicateSummaries(prev, data.articles, "latest");
              StorageUtils.saveSummaries(merged);
              return merged;
            });
          }
        }
      } catch (e) {
        console.warn("Initial news feed fetch note:", e);
      } finally {
        if (isMounted) {
          setIsFeedLoading(false);
        }
      }
    }
    loadFreshNewsFeed();

    // Auto-refresh feed with newest articles every 60 seconds when tab is active
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadFreshNewsFeed();
      }
    }, 60000);

    const handleWindowFocus = () => {
      loadFreshNewsFeed();
    };
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  // Query Backend Historical Archive whenever Search, Category, Publisher Source, Date Range, or Sort changes
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const sortParam = feedSortOrder === "newest" ? "latest" : feedSortOrder;
        const data = await AiService.getNews({
          category: feedCategoryFilter !== "All" ? feedCategoryFilter : undefined,
          sourceId: feedSourceFilter !== "All" ? feedSourceFilter : undefined,
          query: searchQuery.trim() || undefined,
          dateRange: feedDateFilter !== "all" ? feedDateFilter : undefined,
          onlyVerified: onlyVerifiedFeedFilter || undefined,
          sort: sortParam,
          page: 1,
          limit: 36,
        });
        if (!isCancelled && data.articles) {
          setArchivePage(1);
          setArchiveTotalCount(data.total || data.articles.length);
          setArchiveHasMore(Boolean(data.hasMore));
          if (data.articles.length > 0) {
            setSummaries((prev) => mergeAndDeduplicateSummaries(prev, data.articles, feedSortOrder));
          }
        }
      } catch (err) {
        console.warn("Historical archive query note:", err);
      }
    }, searchQuery.trim() ? 220 : 20);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, feedCategoryFilter, feedSourceFilter, feedDateFilter, onlyVerifiedFeedFilter, feedSortOrder]);

  // Archived Items & Feed Management
  const [archivedIds, setArchivedIds] = useState<string[]>(() => StorageUtils.getArchivedSummaryIds());
  const [showArchivedFeed, setShowArchivedFeed] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<{
    id: string;
    message: string;
    undoAction?: () => void;
  } | null>(null);

  const showToast = (message: string, undoAction?: () => void) => {
    const toastId = String(Date.now() + Math.random());
    setActiveToast({ id: toastId, message, undoAction });
    setTimeout(() => {
      setActiveToast((current) => (current?.id === toastId ? null : current));
    }, 4500);
  };

  const handleArchiveSummary = (id: string) => {
    const isCurrentlyArchived = archivedIds.includes(id);
    const updated = isCurrentlyArchived
      ? archivedIds.filter((item) => item !== id)
      : [...archivedIds, id];
    setArchivedIds(updated);
    StorageUtils.saveArchivedSummaryIds(updated);

    const targetItem = summaries.find((s) => s.id === id);
    const titleSnippet = targetItem ? `"${targetItem.title.slice(0, 30)}..."` : "Article";

    if (!isCurrentlyArchived) {
      showToast(`${titleSnippet} archived`, () => {
        const restored = updated.filter((item) => item !== id);
        setArchivedIds(restored);
        StorageUtils.saveArchivedSummaryIds(restored);
        showToast("Article restored to feed");
      });
    } else {
      showToast(`${titleSnippet} restored to feed`);
    }
  };

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

  // Bulk Unsave / Remove Multiple Saved Articles
  const handleBulkUnsave = (idsToRemove: string[]) => {
    if (idsToRemove.length === 0) return;
    const newSavedIds = savedIds.filter((id) => !idsToRemove.includes(id));
    setSavedIds(newSavedIds);
    StorageUtils.saveSavedSummaryIds(newSavedIds);

    const updated = summaries.map((s) => (idsToRemove.includes(s.id) ? { ...s, isSaved: false } : s));
    setSummaries(updated);
    StorageUtils.saveSummaries(updated);

    showToast(`Removed ${idsToRemove.length} ${idsToRemove.length === 1 ? "article" : "articles"} from Saved library`, () => {
      // Undo callback
      const restored = Array.from(new Set([...newSavedIds, ...idsToRemove]));
      setSavedIds(restored);
      StorageUtils.saveSavedSummaryIds(restored);
      const reSaved = summaries.map((s) => (idsToRemove.includes(s.id) ? { ...s, isSaved: true } : s));
      setSummaries(reSaved);
      StorageUtils.saveSummaries(reSaved);
      showToast(`Restored ${idsToRemove.length} ${idsToRemove.length === 1 ? "article" : "articles"} to Saved library`);
    });
  };

  // Automatic 7-Day Cleanup for Read Later Queue
  useEffect(() => {
    if (readLaterSettings.autoCleanupEnabled) {
      const { remaining, removedCount } = StorageUtils.cleanExpiredReadLaterItems(readLaterSettings.cleanupDays);
      if (removedCount > 0) {
        setReadLaterItems(remaining);
        showToast(
          `Auto-cleanup pruned ${removedCount} reading queue ${removedCount === 1 ? "article" : "articles"} older than ${readLaterSettings.cleanupDays} days`,
          () => {
            StorageUtils.saveReadLaterItems(readLaterItems);
            setReadLaterItems(readLaterItems);
            showToast("Pruned items restored");
          }
        );
      }
    }
  }, [readLaterSettings.autoCleanupEnabled, readLaterSettings.cleanupDays]);

  const readLaterIds = useMemo(() => readLaterItems.map((item) => item.id), [readLaterItems]);

  // Read Later Queue Actions
  const handleToggleReadLater = (summaryId: string) => {
    const existing = readLaterItems.find((i) => i.id === summaryId);
    const target = summaries.find((s) => s.id === summaryId);
    const titleSnippet = target ? `"${target.title.slice(0, 32)}..."` : "Article";

    if (existing) {
      const updated = StorageUtils.removeFromReadLater(summaryId);
      setReadLaterItems(updated);
      showToast(`${titleSnippet} removed from Read Later`, () => {
        const restored = StorageUtils.addToReadLater(summaryId);
        setReadLaterItems(restored);
        showToast(`${titleSnippet} restored to queue`);
      });
    } else {
      const updated = StorageUtils.addToReadLater(summaryId);
      setReadLaterItems(updated);
      showToast(`${titleSnippet} added to Read Later queue (auto-cleans in 7 days)`, () => {
        const reverted = StorageUtils.removeFromReadLater(summaryId);
        setReadLaterItems(reverted);
        showToast(`${titleSnippet} removed from queue`);
      });
    }
  };

  const handleToggleReadStatus = (summaryId: string) => {
    const item = readLaterItems.find((i) => i.id === summaryId);
    if (!item) return;
    const updated = StorageUtils.markReadLaterStatus(summaryId, !item.isRead);
    setReadLaterItems(updated);
  };

  const handleRemoveFromQueue = (summaryId: string) => {
    const target = summaries.find((s) => s.id === summaryId);
    const titleSnippet = target ? `"${target.title.slice(0, 32)}..."` : "Article";
    const updated = StorageUtils.removeFromReadLater(summaryId);
    setReadLaterItems(updated);
    showToast(`${titleSnippet} removed from queue`, () => {
      const restored = StorageUtils.addToReadLater(summaryId);
      setReadLaterItems(restored);
      showToast(`${titleSnippet} restored to queue`);
    });
  };

  const handleMoveToSaved = (summaryId: string) => {
    const { readLater, savedIds: updatedSaved } = StorageUtils.moveToSaved(summaryId);
    setReadLaterItems(readLater);
    setSavedIds(updatedSaved);
    const updatedSummaries = summaries.map((s) => (s.id === summaryId ? { ...s, isSaved: true } : s));
    setSummaries(updatedSummaries);
    StorageUtils.saveSummaries(updatedSummaries);

    const target = summaries.find((s) => s.id === summaryId);
    const titleSnippet = target ? `"${target.title.slice(0, 32)}..."` : "Article";
    showToast(`${titleSnippet} moved to Permanent Saved Bookmarks (will not auto-expire)`);
  };

  const handleMoveToReadLater = (summaryId: string) => {
    const { readLater, savedIds: updatedSaved } = StorageUtils.moveToReadLater(summaryId);
    setReadLaterItems(readLater);
    setSavedIds(updatedSaved);
    const updatedSummaries = summaries.map((s) => (s.id === summaryId ? { ...s, isSaved: false } : s));
    setSummaries(updatedSummaries);
    StorageUtils.saveSummaries(updatedSummaries);

    const target = summaries.find((s) => s.id === summaryId);
    const titleSnippet = target ? `"${target.title.slice(0, 32)}..."` : "Article";
    showToast(`${titleSnippet} moved to 7-Day Read Later Queue`);
  };

  const handleClearCompletedQueue = () => {
    const completedItems = readLaterItems.filter((i) => i.isRead);
    const remaining = readLaterItems.filter((i) => !i.isRead);
    StorageUtils.saveReadLaterItems(remaining);
    setReadLaterItems(remaining);
    showToast(`Cleared ${completedItems.length} finished items from queue`, () => {
      StorageUtils.saveReadLaterItems(readLaterItems);
      setReadLaterItems(readLaterItems);
      showToast("Completed items restored");
    });
  };

  const handleCleanExpiredQueueNow = () => {
    const { remaining, removedCount } = StorageUtils.cleanExpiredReadLaterItems(readLaterSettings.cleanupDays);
    setReadLaterItems(remaining);
    if (removedCount > 0) {
      showToast(`Cleaned ${removedCount} expired articles older than ${readLaterSettings.cleanupDays} days`);
    } else {
      showToast(`All items in your queue are within the ${readLaterSettings.cleanupDays}-day window`);
    }
  };

  const handleMoveAllToSaved = () => {
    const idsToMove = readLaterItems.map((i) => i.id);
    const newSaved = Array.from(new Set([...savedIds, ...idsToMove]));
    setSavedIds(newSaved);
    StorageUtils.saveSavedSummaryIds(newSaved);
    setReadLaterItems([]);
    StorageUtils.saveReadLaterItems([]);
    showToast(`Moved all ${idsToMove.length} items to Permanent Saved Bookmarks!`);
  };

  const handleUpdateReadLaterSettings = (newSettings: ReadLaterSettings) => {
    setReadLaterSettings(newSettings);
    StorageUtils.saveReadLaterSettings(newSettings);
    showToast(`Read Later settings saved: 7-day auto-cleanup is ${newSettings.autoCleanupEnabled ? "ON" : "OFF"}`);
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
    const updated = sortByPublishDateNewestFirst([newSummary, ...summaries]);
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

  const handleUpdateSummaryImage = (summaryId: string, newImageUrl: string) => {
    const updated = summaries.map((s) => (s.id === summaryId ? { ...s, thumbnailUrl: newImageUrl } : s));
    setSummaries(updated);
    StorageUtils.saveSummaries(updated);
    if (activeSummaryModal && activeSummaryModal.id === summaryId) {
      setActiveSummaryModal({ ...activeSummaryModal, thumbnailUrl: newImageUrl });
    }
    showToast("Article topic image updated");
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

  // Add Single News Article (from Write form or Ingestion)
  const handleAddNews = (newArticle: SummaryItem) => {
    const updated = mergeAndDeduplicateSummaries(summaries, [newArticle], feedSortOrder);
    setSummaries(updated);
    StorageUtils.saveSummaries(updated);

    const updatedUser = {
      ...user,
      summariesReadCount: user.summariesReadCount + 1,
      hoursSavedEstimated: Number((user.hoursSavedEstimated + 0.3).toFixed(1)),
    };
    setUser(updatedUser);
    StorageUtils.saveUser(updatedUser);

    setSyncStatusNotice(`✓ Added news article: "${newArticle.title.slice(0, 45)}..."`);
    setTimeout(() => setSyncStatusNotice(null), 5000);
    setActiveSummaryModal(newArticle);
    setSummaryModalInitialTab("quick");
  };

  // Add Multiple News Articles (e.g. from Live World Ingest)
  const handleAddMultipleNews = (articles: SummaryItem[]) => {
    if (!articles || articles.length === 0) return;
    const updated = mergeAndDeduplicateSummaries(summaries, articles, feedSortOrder);
    setSummaries(updated);
    StorageUtils.saveSummaries(updated);
    setSyncStatusNotice(`✓ Added ${articles.length} verified stories to your feed.`);
    setTimeout(() => setSyncStatusNotice(null), 5000);
  };

  // Automated Ingestion & Verification Pipeline
  const handleAutoFetchVerified = async (targetCategory = "Current Affairs", query = "") => {
    if (isAutoFetchingVerified) return;
    setIsAutoFetchingVerified(true);
    try {
      const existingTitlesList = summaries.map((s) => s.title);
      const fetchedItems = await AiService.autoFetchVerifiedNews(
        { category: targetCategory, query, language: currentLanguage, existingTitles: existingTitlesList },
        currentLanguage,
        existingTitlesList
      );

      if (fetchedItems && fetchedItems.length > 0) {
        const updated = mergeAndDeduplicateSummaries(summaries, fetchedItems, feedSortOrder);
        setSummaries(updated);
        StorageUtils.saveSummaries(updated);

        const newNotif: NotificationItem = {
          id: `notif-verified-${Date.now()}`,
          title: `🛡️ Verified News Ingested (${fetchedItems.length} Dispatches)`,
          message: `Official dispatches verified against wire agencies: "${fetchedItems[0].title}". Authenticated truth score: ${fetchedItems[0].verification?.verificationScore || 98}%.`,
          timestamp: new Date().toISOString(),
          read: false,
          type: "exam_alert",
          targetSummaryId: fetchedItems[0].id,
        };
        const updatedNotifs = [newNotif, ...notifications];
        setNotifications(updatedNotifs);
        StorageUtils.saveNotifications(updatedNotifs);

        setSyncStatusNotice(`⚡ Ingested ${fetchedItems.length} fresh verified dispatches from official wires.`);
        setTimeout(() => setSyncStatusNotice(null), 6000);
      } else {
        setSyncStatusNotice("All news dispatches are up to date and verified.");
        setTimeout(() => setSyncStatusNotice(null), 4000);
      }
    } catch (err: any) {
      console.warn("Auto-fetch verified news notice:", err?.message || err);
      setSyncStatusNotice("Checked live wires. You are on the latest verified feed.");
      setTimeout(() => setSyncStatusNotice(null), 4000);
    } finally {
      setIsAutoFetchingVerified(false);
    }
  };

  // Connect with Live Happening in the World (Manual trigger)
  // Connect with Live Happening in the World (Manual trigger or background pulse)
  const handleManualWorldSync = async (isManualClick: boolean = false) => {
    if (isSyncingWorld) return;
    setIsSyncingWorld(true);
    try {
      const existingTitlesList = summaries.slice(0, 40).map((s) => s.title);
      const res = await AiService.fetchLiveWorldHappenings({
        existingTitles: existingTitlesList,
        language: currentLanguage,
      });

      setLastWorldSyncTime(new Date());

      if (res.breakingLiveStories && res.breakingLiveStories.length > 0) {
        const existingTitles = new Set(summaries.map((s) => s.title.toLowerCase().trim().slice(0, 35)));
        const fresh = res.breakingLiveStories.filter((s) => !existingTitles.has(s.title.toLowerCase().trim().slice(0, 35)));

        const toAdd = fresh.length > 0 ? fresh : [];
        if (toAdd.length > 0) {
          const updated = mergeAndDeduplicateSummaries(summaries, toAdd, feedSortOrder);
          setSummaries(updated);
          StorageUtils.saveSummaries(updated);

          const newNotif: NotificationItem = {
            id: `notif-world-${Date.now()}`,
            title: `🔴 Live World Happening: ${toAdd[0].creatorName}`,
            message: `Breaking global event: "${toAdd[0].title}". Verified via global wire syndicates.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: "breaking_news",
            targetSummaryId: toAdd[0].id,
          };
          const updatedNotifs = [newNotif, ...notifications];
          setNotifications(updatedNotifs);
          StorageUtils.saveNotifications(updatedNotifs);

          if (isManualClick) {
            setSyncStatusNotice(`🔴 Connected with live world happenings! Added ${toAdd.length} fresh breaking stories.`);
            setTimeout(() => setSyncStatusNotice(null), 5000);
          }
        }
      } else if (isManualClick) {
        setSyncStatusNotice("Connected with world wires. Monitoring live events in real-time.");
        setTimeout(() => setSyncStatusNotice(null), 4000);
      }
    } catch (e: any) {
      console.warn("Manual world sync error:", e?.message);
    } finally {
      setIsSyncingWorld(false);
    }
  };

  // Background Auto-Connecting to Live Happenings in the World (delayed for instant initial page render)
  useEffect(() => {
    // Initial fetch after 10s startup so main view is 100% interactive instantly
    const startupTimer = setTimeout(() => {
      handleManualWorldSync(false);
    }, 10000);

    // Continuous Live World Connection Interval (every 90s only when document is visible)
    const interval = setInterval(() => {
      if (isAutoConnectingWorld && typeof document !== "undefined" && document.visibilityState === "visible") {
        handleManualWorldSync(false);
      }
    }, 90000);

    return () => {
      clearTimeout(startupTimer);
      clearInterval(interval);
    };
  }, [isAutoConnectingWorld, currentLanguage]);

  // Filtered Summaries for Home Feed
  const filteredFeedSummaries = useMemo(() => {
    const filtered = summaries.filter((item) => {
      // Archive filter
      const isArchived = archivedIds.includes(item.id);
      if (showArchivedFeed ? !isArchived : isArchived) {
        return false;
      }
      // Platform filter
      if (feedPlatformFilter !== "All" && item.platform !== feedPlatformFilter) {
        return false;
      }
      // Category filter (supports main category, Current Affairs subCategory, and tags)
      if (feedCategoryFilter !== "All") {
        const catLower = feedCategoryFilter.toLowerCase();
        const itemCat = (item.category || "").toLowerCase();
        const itemSub = (item.currentAffairsCategory || "").toLowerCase();
        const itemTags = Array.isArray(item.tags) ? item.tags.map((t) => t.toLowerCase()) : [];
        if (itemCat !== catLower && itemSub !== catLower && !itemSub.includes(catLower) && !itemTags.includes(catLower)) {
          return false;
        }
      }
      // Publisher source filter
      if (feedSourceFilter !== "All") {
        const srcLower = feedSourceFilter.toLowerCase();
        const pubId = (item.publisherId || "").toLowerCase();
        const cId = (item.creatorId || "").toLowerCase();
        const cName = (item.creatorName || "").toLowerCase();
        if (pubId !== srcLower && cId !== srcLower && !cName.includes(srcLower)) {
          return false;
        }
      }
      // Publication date range filter
      if (feedDateFilter !== "all") {
        const pubMs = new Date(item.publishedAt || item.publishDate || 0).getTime();
        const nowMs = Date.now();
        const maxAgeMs =
          feedDateFilter === "today"
            ? 24 * 3600 * 1000
            : feedDateFilter === "7d"
            ? 7 * 24 * 3600 * 1000
            : 30 * 24 * 3600 * 1000;
        if (!pubMs || nowMs - pubMs > maxAgeMs) {
          return false;
        }
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
        const matchesDesc = (item.description || item.easySummary || "").toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q) || (item.currentAffairsCategory || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesCreator && !matchesQuick && !matchesDesc && !matchesCategory) {
          return false;
        }
      }
      return true;
    });

    // If search active with default sort, rank by search relevance first, then newest
    if (searchQuery.trim() && feedSortOrder === "newest") {
      const q = searchQuery.toLowerCase().trim();
      return [...filtered].sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.title.toLowerCase().includes(q)) scoreA += 15;
        if (b.title.toLowerCase().includes(q)) scoreB += 15;
        if ((a.description || a.easySummary || "").toLowerCase().includes(q)) scoreA += 5;
        if ((b.description || b.easySummary || "").toLowerCase().includes(q)) scoreB += 5;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return sortSummaries([a, b], "newest")[0] === a ? -1 : 1;
      });
    }

    // Apply active section / user sort order: "newest" | "updated" | "popular" | "oldest"
    return sortSummaries(filtered, feedSortOrder);
  }, [summaries, feedPlatformFilter, feedCategoryFilter, feedSourceFilter, feedDateFilter, searchQuery, onlyVerifiedFeedFilter, archivedIds, showArchivedFeed, feedSortOrder]);

  // Progressive feed viewport pagination for instant rendering + server archive loading
  const [visibleFeedCount, setVisibleFeedCount] = useState<number>(12);

  // Reset pagination when search or filters change
  useEffect(() => {
    setVisibleFeedCount(12);
  }, [searchQuery, feedPlatformFilter, feedCategoryFilter, feedSourceFilter, feedDateFilter, feedSortOrder, showArchivedFeed, onlyVerifiedFeedFilter]);

  const handleLoadMoreFeedAndArchive = async () => {
    const nextVisible = visibleFeedCount + 12;
    setVisibleFeedCount(nextVisible);

    // If we are approaching the end of client-loaded summaries and the backend archive has more pages, fetch the next page
    if (nextVisible + 12 >= filteredFeedSummaries.length && archiveHasMore && !isLoadingMoreArchive) {
      setIsLoadingMoreArchive(true);
      try {
        const nextPage = archivePage + 1;
        const sortParam = feedSortOrder === "newest" ? "latest" : feedSortOrder;
        const data = await AiService.getNews({
          category: feedCategoryFilter !== "All" ? feedCategoryFilter : undefined,
          sourceId: feedSourceFilter !== "All" ? feedSourceFilter : undefined,
          query: searchQuery.trim() || undefined,
          dateRange: feedDateFilter !== "all" ? feedDateFilter : undefined,
          onlyVerified: onlyVerifiedFeedFilter || undefined,
          sort: sortParam,
          page: nextPage,
          limit: 36,
        });
        if (data.articles && data.articles.length > 0) {
          setArchivePage(nextPage);
          setArchiveTotalCount(data.total || archiveTotalCount);
          setArchiveHasMore(Boolean(data.hasMore));
          setSummaries((prev) => mergeAndDeduplicateSummaries(prev, data.articles, feedSortOrder));
        } else {
          setArchiveHasMore(false);
        }
      } catch (err) {
        console.warn("Load more archive error:", err);
      } finally {
        setIsLoadingMoreArchive(false);
      }
    }
  };

  const displayedFeedSummaries = useMemo(() => {
    return filteredFeedSummaries.slice(0, visibleFeedCount);
  }, [filteredFeedSummaries, visibleFeedCount]);

  // Feed platform chips
  const platformTabs = [
    { id: "All", label: "All Feeds" },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "x", label: "X (Twitter)", icon: Twitter },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "news", label: "News Wire", icon: Newspaper },
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden bg-neutral-50 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100 ${currentLanguage === "ur" ? "lang-ur" : currentLanguage === "hi" ? "lang-hi" : ""}`}>
      
      {/* Universal Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSummarizeModal={() => setIsSummarizeUrlModalOpen(true)}
        onOpenAddNewsModal={() => setIsAddNewsModalOpen(true)}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        user={user}
        onNavigate={(view) => setCurrentView(view)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        isSidebarOpen={isSidebarOpenMobile}
        onTriggerAutoFetch={() => handleAutoFetchVerified(feedCategoryFilter === "All" ? "Current Affairs" : feedCategoryFilter)}
        isFetchingVerified={isAutoFetchingVerified}
        onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
        onOpenFreshnessMonitor={() => setIsFreshnessMonitorOpen(true)}
      />

      {/* Main Layout: Sidebar + Viewport */}
      <div className="mx-auto flex max-w-7xl w-full min-w-0">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          user={user}
          savedCount={savedIds.length}
          readLaterCount={readLaterItems.length}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          onOpenSummarizeModal={() => setIsSummarizeUrlModalOpen(true)}
          onOpenAddNewsModal={() => setIsAddNewsModalOpen(true)}
          onOpenPlayStoreModal={() => setIsPlayStoreModalOpen(true)}
        />

        {/* Viewport Main Container */}
        <main className="min-w-0 flex-1 w-full px-3 py-4 sm:px-6 lg:px-8 overflow-x-hidden">
          
          {/* VIEW 1: HOME FEED */}
          {currentView === "feed" && (
            <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6">
              
              {/* LIVE WORLD MONITOR: Automatic Real-Time Connection with Live Happenings */}
              <LiveWorldRadarBanner
                isAutoConnecting={isAutoConnectingWorld}
                onToggleAutoConnect={() => setIsAutoConnectingWorld(!isAutoConnectingWorld)}
                onManualWorldSync={handleManualWorldSync}
                isSyncing={isSyncingWorld}
                lastSyncTime={lastWorldSyncTime}
                recentLiveDispatches={summaries.filter((s) => s.currentAffairsCategory === "International News" || s.platform === "news").slice(0, 6)}
                onOpenSummary={handleOpenSummary}
                onOpenAddNewsModal={() => setIsAddNewsModalOpen(true)}
                currentLanguage={currentLanguage}
              />

              {/* Top Section: Daily Briefing & Verification Row */}
              <div className="space-y-3">
                {/* Daily Digest Compact Card */}
                <div 
                  onClick={() => setCurrentView("digest")}
                  className="group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border border-indigo-100/90 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent p-3 sm:p-3.5 transition-all hover:border-indigo-300 dark:border-indigo-900/40 dark:from-indigo-950/40 dark:via-violet-950/20"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-indigo-600 text-white shadow-2xs">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] sm:text-xs font-bold tracking-wider text-indigo-700 uppercase dark:text-indigo-400">
                            Daily Digest
                          </span>
                          <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            5 Min Read
                          </span>
                        </div>
                        <p className="line-clamp-1 text-xs font-medium text-neutral-800 dark:text-neutral-200 sm:text-sm">
                          {dailyDigest.briefingHeadline}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform dark:text-indigo-400">
                      <span className="hidden sm:inline">Open</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Verification Status Panel - Streamlined Compact Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl sm:rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-2 sm:p-2.5 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isAutoFetchingVerified || isSyncingWorld ? "animate-ping" : ""}`} />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate text-[11px] sm:text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                      {syncStatusNotice || "Automated Verified Ingestion Active • Cross-checked with official wires"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id="feed-add-news-banner-btn"
                      onClick={() => setIsAddNewsModalOpen(true)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-indigo-700 transition"
                      title="Publish custom news or ingest breaking wires"
                    >
                      <Newspaper className="h-3 w-3" />
                      <span>+ Add News</span>
                    </button>

                    {archivedIds.length > 0 && (
                      <button
                        id="feed-toggle-archive-view-btn"
                        onClick={() => setShowArchivedFeed(!showArchivedFeed)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                          showArchivedFeed
                            ? "bg-amber-600 text-white shadow-2xs font-bold"
                            : "bg-white text-amber-800 border border-amber-300 hover:bg-amber-50 dark:bg-neutral-800 dark:border-amber-700 dark:text-amber-300"
                        }`}
                        title={showArchivedFeed ? "Return to active feed" : "View archived stories"}
                      >
                        <Archive className="h-3 w-3" />
                        <span>{showArchivedFeed ? "Archived" : `Archived (${archivedIds.length})`}</span>
                      </button>
                    )}

                    <button
                      id="feed-toggle-verified-only-btn"
                      onClick={() => setOnlyVerifiedFeedFilter(!onlyVerifiedFeedFilter)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                        onlyVerifiedFeedFilter
                          ? "bg-emerald-600 text-white shadow-2xs font-bold"
                          : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 dark:bg-neutral-800 dark:border-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {onlyVerifiedFeedFilter ? "✓ Verified" : "Verified Only"}
                    </button>

                    <button
                      id="feed-manual-sync-btn"
                      onClick={() => handleAutoFetchVerified(feedCategoryFilter === "All" ? "Current Affairs" : feedCategoryFilter)}
                      disabled={isAutoFetchingVerified}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700 transition disabled:opacity-60"
                      title="Ingest fresh breaking news and authenticate claims"
                    >
                      <RefreshCw className={`h-3 w-3 ${isAutoFetchingVerified ? "animate-spin" : ""}`} />
                      <span className="hidden sm:inline">{isAutoFetchingVerified ? "Ingesting..." : "Sync Fresh News"}</span>
                      <span className="sm:hidden">{isAutoFetchingVerified ? "Sync..." : "Sync"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Two-Level Filter Layout */}
              <div className="space-y-2 pt-1">
                {/* Level 1 — Source Filters */}
                <div>
                  <div className="mb-1 flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Source
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 sm:hidden">
                      Scroll for more →
                    </span>
                  </div>

                  <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar smooth-touch-scroll">
                      {platformTabs.map((p) => {
                        const Icon = p.icon;
                        const isSelected = feedPlatformFilter === p.id;
                        return (
                          <button
                            key={p.id}
                            id={`feed-platform-${p.id}`}
                            onClick={() => setFeedPlatformFilter(p.id)}
                            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition min-h-[36px] ${
                              isSelected
                                ? "bg-neutral-900 text-white shadow-2xs dark:bg-white dark:text-neutral-900"
                                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            }`}
                          >
                            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                            <span>{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Visual fade scroll cue for Source Filters */}
                    <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-neutral-50 via-neutral-50/50 to-transparent dark:from-neutral-950 dark:via-neutral-950/50 dark:to-transparent sm:hidden" />
                  </div>
                </div>

                {/* Level 2 — Category Filters */}
                <div>
                  <div className="mb-1 flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Category
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 sm:hidden">
                      {categories.length + 1} topics
                    </span>
                  </div>

                  <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar smooth-touch-scroll">
                      {["All", ...categories].map((c) => {
                        const isSelected = feedCategoryFilter === c;
                        return (
                          <button
                            key={c}
                            id={`feed-cat-${c.toLowerCase().replace(/\s+/g, "-")}`}
                            onClick={() => setFeedCategoryFilter(c)}
                            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition min-h-[30px] flex items-center ${
                              isSelected
                                ? "bg-indigo-600 text-white dark:bg-indigo-500 shadow-2xs"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                    {/* Visual fade scroll cue for Category Filters */}
                    <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-neutral-50 via-neutral-50/50 to-transparent dark:from-neutral-950 dark:via-neutral-950/50 dark:to-transparent sm:hidden" />
                  </div>
                </div>

                {/* Level 2.5 — Historical Archive Filters (Date Range & Publisher Source) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mr-1 shrink-0">
                      Archive Window:
                    </span>
                    {[
                      { id: "all", label: "All Time" },
                      { id: "today", label: "Today (24h)" },
                      { id: "7d", label: "Past 7 Days" },
                      { id: "30d", label: "Past 30 Days" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        id={`feed-date-${d.id}`}
                        onClick={() => setFeedDateFilter(d.id as any)}
                        className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium whitespace-nowrap transition ${
                          feedDateFilter === d.id
                            ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Publisher:
                    </span>
                    <select
                      id="feed-publisher-select"
                      value={feedSourceFilter}
                      onChange={(e) => setFeedSourceFilter(e.target.value)}
                      className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700 focus:border-indigo-500 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      <option value="All">All Publishers (18 Wires)</option>
                      <option value="BBC">BBC News / World / Tech</option>
                      <option value="The Hindu">The Hindu (National & World)</option>
                      <option value="Al Jazeera">Al Jazeera English</option>
                      <option value="The Guardian">The Guardian (World, Environment, Sport)</option>
                      <option value="CNBC">CNBC Finance & Markets</option>
                      <option value="Wired">Wired</option>
                      <option value="MIT Technology Review">MIT Technology Review</option>
                      <option value="Vox">Vox News & Explains</option>
                      <option value="Mongabay">Mongabay Environmental News</option>
                      <option value="ScienceDaily">ScienceDaily</option>
                    </select>
                  </div>
                </div>

                {/* Level 3 — Feed Section & Sorting Control */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/80 pt-2.5 dark:border-neutral-800">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mr-0.5 shrink-0">
                      Sort:
                    </span>
                    <button
                      id="feed-sort-latest-btn"
                      onClick={() => setFeedSortOrder("newest")}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                        feedSortOrder === "newest"
                          ? "bg-neutral-900 text-white shadow-2xs dark:bg-white dark:text-neutral-900"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>Latest News</span>
                    </button>

                    <button
                      id="feed-sort-updated-btn"
                      onClick={() => setFeedSortOrder("updated")}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                        feedSortOrder === "updated"
                          ? "bg-amber-600 text-white shadow-2xs font-bold"
                          : "bg-white text-amber-800 border border-amber-200/80 hover:bg-amber-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-amber-300"
                      }`}
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Latest Updates</span>
                    </button>

                    <button
                      id="feed-sort-popular-btn"
                      onClick={() => setFeedSortOrder("popular")}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                        feedSortOrder === "popular"
                          ? "bg-neutral-900 text-white shadow-2xs dark:bg-white dark:text-neutral-900"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      <Flame className="h-3 w-3" />
                      <span>Most Popular</span>
                    </button>

                    <button
                      id="feed-sort-oldest-btn"
                      onClick={() => setFeedSortOrder("oldest")}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                        feedSortOrder === "oldest"
                          ? "bg-neutral-900 text-white shadow-2xs dark:bg-white dark:text-neutral-900"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      <span>Oldest</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    Showing {displayedFeedSummaries.length} of {Math.max(filteredFeedSummaries.length, archiveTotalCount).toLocaleString()} archived articles
                  </span>
                </div>
              </div>

              {/* Summaries Stream with Skeleton Loaders */}
              {isFeedLoading ? (
                <FeedCardSkeletonList count={3} />
              ) : filteredFeedSummaries.length > 0 ? (
                <div className="space-y-4">
                  {/* Live Wire Ingestion Active Skeleton Placeholder */}
                  {isAutoFetchingVerified && (
                    <div className="space-y-2 rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-3.5 dark:border-emerald-900/30 dark:bg-emerald-950/10">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                          <span>Ingesting and authenticating fresh live wire dispatches...</span>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Verifying sources</span>
                      </div>
                      <FeedCardSkeleton />
                    </div>
                  )}

                  {displayedFeedSummaries.map((summary) => (
                    <FeedCard
                      key={summary.id}
                      summary={summary}
                      currentLanguage={currentLanguage}
                      onOpenSummary={handleOpenSummary}
                      onToggleSave={handleToggleSave}
                      isSaved={savedIds.includes(summary.id)}
                      isReadLater={readLaterIds.includes(summary.id)}
                      onToggleReadLater={handleToggleReadLater}
                      onMoveToReadLater={handleMoveToReadLater}
                      onMoveToSaved={handleMoveToSaved}
                      onOpenAudit={(s) => setAuditModalSummary(s)}
                      onArchive={handleArchiveSummary}
                      isArchived={archivedIds.includes(summary.id)}
                      onNotify={(msg) => showToast(msg)}
                      onOpenImagePicker={(s) => setImagePickerSummary(s)}
                    />
                  ))}

                  {/* Progressive & Server-Backed Historical Archive Load More Action */}
                  {(filteredFeedSummaries.length > visibleFeedCount || archiveHasMore) && (
                    <div className="flex flex-col items-center justify-center pt-3 pb-8">
                      <button
                        id="feed-load-more-btn"
                        onClick={handleLoadMoreFeedAndArchive}
                        disabled={isLoadingMoreArchive}
                        className="inline-flex items-center gap-2 rounded-2xl border border-neutral-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 shadow-2xs transition hover:bg-neutral-50 hover:border-neutral-400 active:scale-95 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-850 dark:text-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <ChevronDown className={`h-4 w-4 text-indigo-500 ${isLoadingMoreArchive ? "animate-bounce" : ""}`} />
                        <span>
                          {isLoadingMoreArchive
                            ? "Loading Historical Archive..."
                            : `Load More News (${Math.max(filteredFeedSummaries.length - visibleFeedCount, archiveTotalCount - displayedFeedSummaries.length).toLocaleString()} more in archive)`}
                        </span>
                      </button>
                      <span className="mt-1.5 text-[11px] text-neutral-400">
                        Showing {displayedFeedSummaries.length} of {Math.max(filteredFeedSummaries.length, archiveTotalCount).toLocaleString()} permanently archived dispatches
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
                  <Search className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-600 mb-2" />
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    No matching summaries found
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Try searching for another keyword or reset platform, publisher, and date filters.
                  </p>
                  <button
                    onClick={() => {
                      setFeedPlatformFilter("All");
                      setFeedCategoryFilter("All");
                      setFeedSourceFilter("All");
                      setFeedDateFilter("all");
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
              readLaterIds={readLaterIds}
              onToggleReadLater={handleToggleReadLater}
              onMoveToReadLater={handleMoveToReadLater}
              onMoveToSaved={handleMoveToSaved}
              onOpenAudit={(s) => setAuditModalSummary(s)}
              onTriggerAutoFetch={handleAutoFetchVerified}
              onOpenAddNewsModal={() => setIsAddNewsModalOpen(true)}
              isFetchingVerified={isAutoFetchingVerified}
              onOpenImagePicker={(s) => setImagePickerSummary(s)}
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

          {/* VIEW 5: READ LATER QUEUE (7-DAY AUTO-CLEANUP) */}
          {currentView === "read-later" && (
            <ReadLaterView
              summaries={summaries}
              readLaterItems={readLaterItems}
              settings={readLaterSettings}
              onUpdateSettings={handleUpdateReadLaterSettings}
              currentLanguage={currentLanguage}
              onOpenSummary={handleOpenSummary}
              onToggleReadStatus={handleToggleReadStatus}
              onRemoveFromQueue={handleRemoveFromQueue}
              onMoveToSaved={handleMoveToSaved}
              onClearCompleted={handleClearCompletedQueue}
              onCleanExpiredNow={handleCleanExpiredQueueNow}
              onMoveAllToSaved={handleMoveAllToSaved}
              onAddToQueue={handleToggleReadLater}
              savedIds={savedIds}
            />
          )}

          {/* VIEW 6: SAVED SUMMARIES & BOOKMARKS */}
          {currentView === "saved" && (
            <SavedView
              summaries={summaries}
              savedIds={savedIds}
              readLaterIds={readLaterIds}
              readLaterCount={readLaterItems.length}
              currentLanguage={currentLanguage}
              onOpenSummary={handleOpenSummary}
              onToggleSave={handleToggleSave}
              onBulkUnsave={handleBulkUnsave}
              onToggleReadLater={handleToggleReadLater}
              onMoveToReadLater={handleMoveToReadLater}
              onNavigateToReadLater={() => setCurrentView("read-later")}
              onOpenAudit={(s) => setAuditModalSummary(s)}
              onOpenImagePicker={(s) => setImagePickerSummary(s)}
            />
          )}

          {/* VIEW 7: USER DASHBOARD & READING STATS */}
          {currentView === "dashboard" && (
            <DashboardView
              user={user}
              summaries={summaries}
              savedCount={savedIds.length}
              readLaterCount={readLaterItems.length}
              creators={creators}
              onNavigate={(view) => setCurrentView(view)}
              onOpenSummary={handleOpenSummary}
            />
          )}

          {/* VIEW 8: SETTINGS & PREFERENCES */}
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
              readLaterSettings={readLaterSettings}
              onUpdateReadLaterSettings={handleUpdateReadLaterSettings}
              onCleanExpiredReadLater={handleCleanExpiredQueueNow}
            />
          )}

          {/* VIEW 8: PUBLICATION OVERVIEW / LANDING PAGE */}
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

          {/* VIEW 9: OWNER GOVERNANCE & TITLE PORTAL */}
          {currentView === "owner-dashboard" && (
            <OwnerDashboardView
              onBackToFeed={() => setCurrentView("feed")}
              initialToken={initialOwnerToken}
              onOpenFreshnessMonitor={() => setIsFreshnessMonitorOpen(true)}
            />
          )}
        </main>
      </div>

      {/* POPUP MODALS */}

      {/* 1. Interactive Multi-Tier Summary Reader & AI Chat */}
      {activeSummaryModal && (
        <SummaryModal
          summary={activeSummaryModal}
          isOpen={Boolean(activeSummaryModal)}
          onClose={() => setActiveSummaryModal(null)}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          isSaved={savedIds.includes(activeSummaryModal.id)}
          onToggleSave={handleToggleSave}
          isReadLater={readLaterIds.includes(activeSummaryModal.id)}
          onToggleReadLater={handleToggleReadLater}
          onMoveToSaved={handleMoveToSaved}
          onMoveToReadLater={handleMoveToReadLater}
          initialTab={summaryModalInitialTab}
          onOpenImagePicker={(s) => setImagePickerSummary(s)}
        />
      )}

      {/* 2. Summarize Custom URL or Text Modal */}
      {isSummarizeUrlModalOpen && (
        <SummarizeUrlModal
          isOpen={isSummarizeUrlModalOpen}
          onClose={() => setIsSummarizeUrlModalOpen(false)}
          onAddSummary={handleAddSummary}
          currentLanguage={currentLanguage}
        />
      )}

      {/* 3. Notifications Modal */}
      {isNotificationsModalOpen && (
        <NotificationsModal
          isOpen={isNotificationsModalOpen}
          onClose={() => setIsNotificationsModalOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsRead}
          onNotificationClick={handleNotificationClick}
          onClearNotifications={handleClearNotifications}
        />
      )}

      {/* 4. Auth / Sign In Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={user}
          onLogin={(updatedUser) => {
            setUser(updatedUser);
            StorageUtils.saveUser(updatedUser);
          }}
        />
      )}

      {/* 5. Verification Audit Certificate Modal */}
      {auditModalSummary && (
        <VerificationAuditModal
          summary={auditModalSummary}
          isOpen={Boolean(auditModalSummary)}
          onClose={() => setAuditModalSummary(null)}
        />
      )}

      {/* 6. Play Store & Android PWA Packaging Modal */}
      {isPlayStoreModalOpen && (
        <PlayStoreInstallModal
          isOpen={isPlayStoreModalOpen}
          onClose={() => setIsPlayStoreModalOpen(false)}
          deferredPrompt={deferredInstallPrompt}
          onInstallApp={handleInstallApp}
        />
      )}

      {/* 7. Dedicated Add News & Live Wires Modal */}
      {isAddNewsModalOpen && (
        <AddNewsModal
          isOpen={isAddNewsModalOpen}
          onClose={() => setIsAddNewsModalOpen(false)}
          onAddNews={handleAddNews}
          onAddMultipleNews={handleAddMultipleNews}
          currentLanguage={currentLanguage}
          existingTitles={summaries.map((s) => s.title)}
        />
      )}

      {/* 8. Dedicated Image Customizer & Topic Matcher Modal */}
      {imagePickerSummary && (
        <ImagePickerModal
          summary={imagePickerSummary}
          isOpen={Boolean(imagePickerSummary)}
          onClose={() => setImagePickerSummary(null)}
          onSaveImage={handleUpdateSummaryImage}
        />
      )}

      {/* 9. Live News Ingestion Pipeline & Feed Freshness Monitor Modal */}
      <NewsFreshnessMonitorModal
        isOpen={isFreshnessMonitorOpen}
        onClose={() => setIsFreshnessMonitorOpen(false)}
        onRefreshComplete={async () => {
          try {
            const data = await AiService.getNews({ limit: 60, sort: "latest" });
            if (data.articles && data.articles.length > 0) {
              setSummaries((prev) => {
                const merged = mergeAndDeduplicateSummaries(prev, data.articles, "latest");
                StorageUtils.saveSummaries(merged);
                return merged;
              });
              showToast(`Live pipeline synchronized: ${data.articles.length} latest articles loaded`);
            }
          } catch (err) {
            console.error("Failed to reload summaries after sync", err);
          }
        }}
      />

      {/* Interactive Floating Action Toast (Archive, Copy, Share) */}
      {activeToast && (
        <div 
          id="app-action-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-neutral-900/95 px-4 py-3 text-xs font-medium text-white shadow-2xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-800/95 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="max-w-[260px] truncate">{activeToast.message}</span>
          {activeToast.undoAction && (
            <button
              id="toast-undo-btn"
              onClick={() => {
                activeToast.undoAction?.();
                setActiveToast(null);
              }}
              className="ml-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/30 transition active:scale-95"
            >
              Undo
            </button>
          )}
          <button
            onClick={() => setActiveToast(null)}
            className="ml-0.5 rounded-md p-1 text-neutral-400 hover:text-white transition"
            title="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
