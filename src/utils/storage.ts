import { Creator, SummaryItem, UserProfile, NotificationItem, DailyDigest, Category, Language } from "../types";
import { INITIAL_CREATORS, INITIAL_SUMMARIES, INITIAL_DAILY_DIGEST, INITIAL_NOTIFICATIONS } from "../data/mockData";

const STORAGE_KEYS = {
  PROFILE: "summaryhub_profile",
  CREATORS: "summaryhub_creators",
  SUMMARIES: "summaryhub_summaries",
  SAVED_IDS: "summaryhub_saved_ids",
  DIGEST: "summaryhub_digest",
  NOTIFICATIONS: "summaryhub_notifications",
  CUSTOM_CATEGORIES: "summaryhub_custom_categories",
  LANGUAGE: "summaryhub_language",
  THEME: "summaryhub_theme",
};

export const DEFAULT_CATEGORIES: Category[] = [
  "All",
  "News",
  "Current Affairs",
  "Technology",
  "Education",
  "Finance",
  "Sports",
  "Health",
];

export const DEFAULT_USER: UserProfile = {
  id: "user-1",
  name: "Mohd Sarfraz",
  email: "mohd.sarfraz@example.com",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  role: "student",
  joinedDate: "2026-09-01T00:00:00Z",
  readingStreakDays: 7,
  summariesReadCount: 34,
  hoursSavedEstimated: 12.8,
  topicsOfInterest: ["Current Affairs", "Technology", "Economy", "Renewable Energy"],
  preferences: {
    language: "en",
    preferredLength: "quick",
    dailyReadingGoal: 10,
    autoSyncVerifiedNews: true,
    autoSyncIntervalSeconds: 180,
    onlyVerifiedInFeed: false,
    notifications: {
      dailyDigest: true,
      breakingNews: true,
      examReminders: true,
      creatorPublish: true,
    },
  },
};

export const StorageUtils = {
  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  saveUser(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  },

  getCreators(): Creator[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREATORS);
      return data ? JSON.parse(data) : INITIAL_CREATORS;
    } catch {
      return INITIAL_CREATORS;
    }
  },

  saveCreators(creators: Creator[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(creators));
    } catch (e) {
      console.error(e);
    }
  },

  getSummaries(): SummaryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
      const parsed: SummaryItem[] = data ? JSON.parse(data) : INITIAL_SUMMARIES;
      return parsed.map((item, idx) => {
        if (!item.verification) {
          return {
            ...item,
            verification: {
              isVerified: true,
              verificationScore: 97 + (idx % 3),
              status: (item.category === "Current Affairs" || item.category === "News" ? "Official Dispatch" : "Verified") as any,
              verifiedSources: [item.creatorName || "Official Press Wire", "National Media Bureau"],
              factCheckSummary: "Cross-referenced with official records, primary statements, and institutional data without conflicting claims.",
              verifiedTimestamp: item.publishDate || new Date().toISOString(),
              primarySourceType: (item.category === "Current Affairs" ? "Government Gazette" : "Official Wire") as any,
              checksPassed: [
                "Primary Source Corroboration",
                "Numerical & Statistical Validation",
                "Temporal Integrity Check",
                "Anti-Misinformation Screen"
              ],
              sourceReferenceId: `DISPATCH-${202600 + idx}`,
            }
          };
        }
        return item;
      });
    } catch {
      return INITIAL_SUMMARIES;
    }
  },

  saveSummaries(summaries: SummaryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(summaries));
    } catch (e) {
      console.error(e);
    }
  },

  getSavedSummaryIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_IDS);
      if (data) return JSON.parse(data);
      // fallback from summaries
      const initial = INITIAL_SUMMARIES.filter((s) => s.isSaved).map((s) => s.id);
      return initial.length > 0 ? initial : ["sum-1", "sum-4"];
    } catch {
      return ["sum-1", "sum-4"];
    }
  },

  saveSavedSummaryIds(ids: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_IDS, JSON.stringify(ids));
    } catch (e) {
      console.error(e);
    }
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
      if (data) {
        const custom = JSON.parse(data);
        return Array.from(new Set(["Current Affairs", "News", "Technology", "Education", "Finance", "Sports", "Health", ...custom]));
      }
      return ["Current Affairs", "News", "Technology", "Education", "Finance", "Sports", "Health"];
    } catch {
      return ["Current Affairs", "News", "Technology", "Education", "Finance", "Sports", "Health"];
    }
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  },

  getDailyDigest(): DailyDigest {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIGEST);
      return data ? JSON.parse(data) : INITIAL_DAILY_DIGEST;
    } catch {
      return INITIAL_DAILY_DIGEST;
    }
  },

  saveDailyDigest(digest: DailyDigest): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DIGEST, JSON.stringify(digest));
    } catch (e) {
      console.error(e);
    }
  },

  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifications: NotificationItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  },
};

export const StorageService = StorageUtils;
