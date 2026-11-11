export type Platform = "youtube" | "x" | "instagram" | "news";

export type Category = 
  | "News"
  | "Current Affairs"
  | "Technology"
  | "Education"
  | "Finance"
  | "Sports"
  | "Health"
  | string;

export type CurrentAffairsSubCategory = 
  | "National News"
  | "International News"
  | "Economy"
  | "Science & Technology"
  | "Environment"
  | "Sports"
  | "Education";

export type TimeFilter = "daily" | "weekly" | "monthly";

export type Language = "en" | "hi" | "ur";

export interface KeyFacts {
  names: string[];
  dates: string[];
  statistics: string[];
  announcements: string[];
  decisions: string[];
}

export interface GoogleVerifiedSourceItem {
  title: string;
  uri: string;
}

export interface VerificationData {
  isVerified: boolean;
  verificationScore: number; // e.g. 98 out of 100
  status: "Verified" | "Fact-Checked" | "Official Dispatch" | "Under Review";
  verifiedSources: string[]; // e.g. ["Press Information Bureau (PIB)", "Reuters Wire", "Official Gazette"]
  factCheckSummary: string; // concise explanation of how info was authenticated
  verifiedTimestamp: string;
  primarySourceType: "Government Gazette" | "Official Wire" | "Peer-Reviewed" | "Institutional Dispatch" | "Direct Statement" | "Google Verified Source";
  checksPassed: string[];
  sourceReferenceId?: string;
  isGoogleVerified?: boolean;
  googleVerifiedSources?: GoogleVerifiedSourceItem[];
  googleSearchQueries?: string[];
}

export interface SummaryItem {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  platform: Platform;
  category: Category;
  currentAffairsCategory?: CurrentAffairsSubCategory;
  publishDate: string; // ISO string or human date (maintained for backward compatibility)
  publishedAt?: string; // ISO 8601 UTC timestamp of original publication
  sourceUpdatedAt?: string; // Verified update time from the original publisher
  updatedAt?: string; // ISO 8601 UTC timestamp when original source was updated
  firstSeenAt?: string; // ISO 8601 UTC timestamp when The World Ledger discovered article
  lastFetchedAt?: string; // ISO 8601 UTC timestamp when system last checked the source
  lastCheckedAt?: string; // ISO 8601 UTC timestamp of last source poll/check
  contentChangedAt?: string; // ISO 8601 UTC timestamp when meaningful article-content change was detected
  lastContentChangeAt?: string; // ISO 8601 UTC timestamp when substantive content changed
  contentHash?: string; // Deterministic hash of article content/title for update detection
  isUpdate?: boolean; // Flag indicating article has verified source updates
  updateSummary?: string; // Description of verified update
  author?: string; // Original article author if available
  tags?: string[]; // Topical tags & keywords
  status?: "active" | "archived"; // Article archival status
  readingTimeMinutes: number;
  originalUrl: string;
  canonicalUrl?: string;
  publisherId?: string;
  description?: string;
  thumbnailUrl: string;
  originalImageUrl?: string;
  imageSource?: "publisher" | "provider" | "ai" | "fallback" | "custom";
  imageType?: "photo" | "illustration" | "chart" | "fallback";
  imageCaption?: string;
  imageAttribution?: string;
  imageValidationStatus?: "valid" | "fallback" | "invalid";
  imagePrompt?: string;
  imageStatus?: "ready" | "generating" | "failed";
  
  // Multi-tier Summaries
  quickSummary: string[]; // 3-5 bullet points
  easySummary: string; // 100-150 words in simple language
  detailedSummary: string; // 300-500 words for deeper understanding
  keyFacts: KeyFacts;

  // Language translations if generated
  translations?: {
    [key in "hi" | "ur"]?: {
      title?: string;
      quickSummary?: string[];
      easySummary?: string;
      detailedSummary?: string;
    };
  };

  examRelevance?: string;
  verification?: VerificationData;
  isSaved?: boolean;
  isRead?: boolean;
  isReadLater?: boolean;
  viewsCount?: number;
  likesCount?: number;
}

export interface ReadLaterItem {
  id: string; // references SummaryItem.id
  addedAt: string; // ISO string when queued
  isRead?: boolean; // marked as read within the queue
  notes?: string;
}

export interface ReadLaterSettings {
  autoCleanupEnabled: boolean; // default: true
  cleanupDays: number; // default: 7
  notifyBeforeCleanup?: boolean;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  platform: Platform;
  category: Category;
  bio: string;
  followersCount: string;
  isFollowed: boolean;
  verified?: boolean;
  channelUrl: string;
}

export interface DailyDigest {
  date: string;
  totalContentToday: number;
  estimatedReadingTimeMinutes: number;
  briefingHeadline: string;
  executiveOverview: string;
  keyTakeaways: string[];
  quoteOfTheDay: string;
  topSummaryIds: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  description?: string;
  type: "creator_upload" | "breaking_news" | "daily_digest" | "exam_alert";
  timestamp: string;
  read: boolean;
  targetSummaryId?: string;
  linkSummaryId?: string;
}

export interface UserPreferences {
  language: Language;
  preferredLength: "quick" | "easy" | "detailed";
  dailyReadingGoal: number;
  autoSyncVerifiedNews?: boolean;
  autoSyncIntervalSeconds?: number;
  onlyVerifiedInFeed?: boolean;
  notifications: {
    dailyDigest: boolean;
    breakingNews: boolean;
    examReminders: boolean;
    creatorPublish: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "student" | "professional" | "reader" | "curious";
  joinedDate: string;
  readingStreakDays: number;
  summariesReadCount: number;
  hoursSavedEstimated: number;
  topicsOfInterest: string[];
  preferences: UserPreferences;
}
