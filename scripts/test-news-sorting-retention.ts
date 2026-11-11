import fs from "fs";
import path from "path";
import assert from "assert";
import {
  NewsStoreManager,
  parseDateToUtcIso,
  normalizeCanonicalUrl,
  calculateContentHash,
  StoredArticle,
} from "../src/server/newsStoreManager";
import { sortSummaries, mergeAndDeduplicateSummaries } from "../src/utils/storage";

// Colorized test reporting helpers
const PASS = "\x1b[32m✔ PASS\x1b[0m";
const FAIL = "\x1b[31m✖ FAIL\x1b[0m";

let passedCount = 0;
let failedCount = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`${PASS}: ${name}`);
    passedCount++;
  } catch (err: any) {
    console.error(`${FAIL}: ${name}`);
    console.error("   Details:", err.message);
    failedCount++;
  }
}

async function main() {
  console.log("================================================================================");
  console.log("THE WORLD LEDGER — AUTOMATED TEST SUITE: NEWS SORTING & PERMANENT RETENTION");
  console.log("================================================================================\n");

  // Isolate synthetic test writes into a dedicated test store file so production data is never polluted
  const prodStorePath = path.join(process.cwd(), "data", "news_articles_store.json");
  const testStorePath = path.join(process.cwd(), "data", "test_news_articles_store.json");
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }
  NewsStoreManager.setStorePath(testStorePath);

  const nowMs = Date.now();
  const FIVE_MINS_AGO = new Date(nowMs - 5 * 60 * 1000).toISOString();
  const TEN_MINS_AGO = new Date(nowMs - 10 * 60 * 1000).toISOString();
  const TWO_HOURS_AGO = new Date(nowMs - 2 * 60 * 60 * 1000).toISOString();
  const YESTERDAY = new Date(nowMs - 24 * 60 * 60 * 1000).toISOString();
  const FOUR_DAYS_AGO = new Date(nowMs - 4 * 24 * 60 * 60 * 1000).toISOString();

  // SCENARIO 1: News sorting by latest publication time (5m ago > 2h ago > 4d ago)
  runTest("1. News Sorting: Article published 5m ago strictly appears above 2h-old and 4d-old articles", () => {
    const fourDaysOldArticle: Partial<StoredArticle> = {
      id: "art-older-4d",
      title: "Historical Report Published 4 Days Ago",
      publishedAt: FOUR_DAYS_AGO,
      publishDate: FOUR_DAYS_AGO,
      canonicalUrl: "https://reuters.com/report-4d",
      category: "News",
    };

    const twoHoursOldArticle: Partial<StoredArticle> = {
      id: "art-older-2h",
      title: "Older Global Economic Outlook Published 2 Hours Ago",
      publishedAt: TWO_HOURS_AGO,
      publishDate: TWO_HOURS_AGO,
      canonicalUrl: "https://reuters.com/econ-2h",
      category: "News",
    };

    const fiveMinsNewArticle: Partial<StoredArticle> = {
      id: "art-newer-5m",
      title: "Breaking G20 Accord Finalized 5 Minutes Ago",
      publishedAt: FIVE_MINS_AGO,
      publishDate: FIVE_MINS_AGO,
      canonicalUrl: "https://reuters.com/accord-5m",
      category: "News",
    };

    const sorted = sortSummaries([fourDaysOldArticle, twoHoursOldArticle, fiveMinsNewArticle] as any, "latest");
    assert.strictEqual(sorted[0].id, "art-newer-5m", "5-minute old article MUST appear first in Latest News");
    assert.strictEqual(sorted[1].id, "art-older-2h", "2-hour old article MUST appear second in Latest News");
    assert.strictEqual(sorted[2].id, "art-older-4d", "4-day old article MUST appear third in Latest News");
  });

  // SCENARIO 2: Section-specific sorting rules (Latest Updates vs Latest News)
  runTest("2. Section-Specific Sorting: 'Latest Updates' prioritizes verified updates over original publication date", () => {
    const breakingYesterdayUpdatedNow: Partial<StoredArticle> = {
      id: "art-update-priority",
      title: "Summit Treaty Drafted Yesterday, Critical Amendment Ratified 5m Ago",
      publishedAt: YESTERDAY,
      publishDate: YESTERDAY,
      sourceUpdatedAt: FIVE_MINS_AGO,
      updatedAt: FIVE_MINS_AGO,
      contentChangedAt: FIVE_MINS_AGO,
      lastContentChangeAt: FIVE_MINS_AGO,
      isUpdate: true,
      canonicalUrl: "https://apnews.com/summit-treaty",
      category: "News",
    };

    const freshArticleUnmodified: Partial<StoredArticle> = {
      id: "art-fresh-published",
      title: "Space Mission Launch Initiated 10 Minutes Ago",
      publishedAt: TEN_MINS_AGO,
      publishDate: TEN_MINS_AGO,
      updatedAt: undefined,
      canonicalUrl: "https://bbc.com/space-launch",
      category: "News",
    };

    // Under "latest" (Latest News feed), original publishedAt wins:
    const latestNewsFeed = sortSummaries([breakingYesterdayUpdatedNow, freshArticleUnmodified] as any, "latest");
    assert.strictEqual(latestNewsFeed[0].id, "art-fresh-published", "Latest News feed MUST sort by original publishedAt");

    // Under "updated" (Latest Updates feed), recent update wins:
    const latestUpdatesFeed = sortSummaries([freshArticleUnmodified, breakingYesterdayUpdatedNow] as any, "updated");
    assert.strictEqual(latestUpdatesFeed[0].id, "art-update-priority", "Latest Updates feed MUST place article updated 5m ago at the top");
  });

  // SCENARIO 3: Permanent article retention without limit-based deletion
  runTest("3. Permanent Article Retention: System preserves all historical records without pruning or limit deletion", () => {
    const bulkArticles: Partial<StoredArticle>[] = [];
    for (let i = 0; i < 400; i++) {
      bulkArticles.push({
        id: `retention-test-item-${i}`,
        title: `Historical Archival Report Record Number ${i} on Policy`,
        canonicalUrl: `https://worldledger.news/archive/${i}`,
        publisherId: i % 2 === 0 ? "bbc_news" : "the_hindu_national",
        creatorName: i % 2 === 0 ? "BBC News" : "The Hindu",
        publishedAt: new Date(nowMs - (i + 1) * 3600 * 1000).toISOString(),
        publishDate: new Date(nowMs - (i + 1) * 3600 * 1000).toISOString(),
        category: "Current Affairs",
      });
    }

    NewsStoreManager.initStore([]);
    NewsStoreManager.ingestArticles(bulkArticles);

    const postIngestCount = NewsStoreManager.getTotalCount();
    assert(postIngestCount >= 400, `Expected at least 400 articles preserved, got ${postIngestCount}`);

    const oldestItem = NewsStoreManager.getArticleById("retention-test-item-399");
    assert(oldestItem !== undefined, "Oldest article (item 399) must never be pruned");
    assert.strictEqual(oldestItem?.id, "retention-test-item-399");
  });

  // SCENARIO 4: Deduplication preserving history & explicit timestamp fields
  runTest("4. Deduplication: Re-ingestion preserves original publishedAt and firstSeenAt while recording sourceUpdatedAt & contentChangedAt", () => {
    const testDedupSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const testDedupUrl = `https://bloomberg.com/sovereign-reserves-${testDedupSuffix}`;
    const testDedupId = `art-dedup-test-${testDedupSuffix}`;
    const originalPubDate = "2026-08-15T12:00:00.000Z";
    const initialItem: Partial<StoredArticle> = {
      id: testDedupId,
      title: `Unique Policy Record on Sovereign Reserves ${testDedupSuffix}`,
      canonicalUrl: testDedupUrl,
      publishedAt: originalPubDate,
      publishDate: originalPubDate,
      firstSeenAt: "2026-08-15T12:05:00.000Z",
      description: "Original preliminary draft text.",
      category: "Finance",
    };

    NewsStoreManager.ingestArticles([initialItem]);
    const storedBefore = NewsStoreManager.getArticleById(testDedupId);
    assert.strictEqual(storedBefore?.publishedAt, originalPubDate);
    const originalFirstSeen = storedBefore?.firstSeenAt;

    const updatedRevision: Partial<StoredArticle> = {
      canonicalUrl: testDedupUrl,
      title: `Unique Policy Record on Sovereign Reserves ${testDedupSuffix} - Ratified`,
      description: "Amended formal statute text approved by council.",
      sourceUpdatedAt: FIVE_MINS_AGO,
      updatedAt: FIVE_MINS_AGO,
      updateSummary: "Council officially adopted all amendments.",
    };

    const result = NewsStoreManager.ingestArticles([updatedRevision]);
    assert.strictEqual(result.updated, 1, "Should count as an updated article");

    const storedAfter = NewsStoreManager.getArticleById(testDedupId);
    assert(storedAfter !== undefined);
    assert.strictEqual(storedAfter?.publishedAt, originalPubDate, "publishedAt MUST NOT be overwritten by update");
    assert.strictEqual(storedAfter?.firstSeenAt, originalFirstSeen, "firstSeenAt MUST be preserved");
    assert.strictEqual(storedAfter?.title, updatedRevision.title);
    assert.strictEqual(storedAfter?.isUpdate, true, "isUpdate flag MUST be true");
    assert(storedAfter?.sourceUpdatedAt !== undefined, "sourceUpdatedAt MUST be recorded");
    assert(storedAfter?.contentChangedAt !== undefined, "contentChangedAt MUST be recorded");
  });

  // SCENARIO 5: Routine source checks update lastFetchedAt / lastCheckedAt without altering latest-news sorting
  runTest("5. Routine Source Checks: Polling updates lastFetchedAt without jumping feed position or setting isUpdate", () => {
    const staticPubDate = "2026-09-10T08:00:00.000Z";
    const item1: Partial<StoredArticle> = {
      id: "art-routine-check-target",
      title: "Static Regulatory Filing On Public Telecom Infrastructure",
      canonicalUrl: "https://fcc.gov/telecom-notice-40",
      publishedAt: staticPubDate,
      publishDate: staticPubDate,
      description: "Static regulatory filing that does not change.",
      category: "Technology",
    };

    NewsStoreManager.ingestArticles([item1]);
    const initialItem = NewsStoreManager.getArticleById("art-routine-check-target")!;
    const initialFetched = initialItem.lastFetchedAt;

    const routinePollItem: Partial<StoredArticle> = {
      canonicalUrl: "https://fcc.gov/telecom-notice-40",
      title: "Static Regulatory Filing On Public Telecom Infrastructure",
      description: "Static regulatory filing that does not change.",
    };

    const pollRes = NewsStoreManager.ingestArticles([routinePollItem]);
    assert.strictEqual(pollRes.unchanged, 1, "Article must be marked unchanged on routine poll");
    assert.strictEqual(pollRes.skipped, 1, "Article must be counted in skipped on routine poll");

    const postPollItem = NewsStoreManager.getArticleById("art-routine-check-target")!;
    assert.strictEqual(postPollItem.publishedAt, staticPubDate, "publishedAt must remain unchanged");
    assert(postPollItem.lastFetchedAt >= initialFetched, "lastFetchedAt must be refreshed");
    assert.strictEqual(postPollItem.isUpdate, false, "Must not be flagged as updated on routine check");
  });

  // SCENARIO 6: Missing or invalid timestamps do not float to top
  runTest("6. Safe Timestamp Fallbacks: Missing or invalid timestamps fallback safely and never float to top", () => {
    const parsedMissing = parseDateToUtcIso(undefined, "2026-09-01T00:00:00.000Z");
    assert.strictEqual(parsedMissing, "2026-09-01T00:00:00.000Z", "Missing date must fall back to baseline");

    const parsedInvalid = parseDateToUtcIso("invalid-non-date-string-12345", "2026-09-01T00:00:00.000Z");
    assert.strictEqual(parsedInvalid, "2026-09-01T00:00:00.000Z", "Invalid date string must fall back to baseline");

    const genuineNewArticle = {
      id: "art-genuine-10m",
      title: "Genuine Real-Time Article",
      publishedAt: TEN_MINS_AGO,
      publishDate: TEN_MINS_AGO,
    };

    const undatedArticle = {
      id: "art-undated-corrupt",
      title: "Article with Missing Publication Date",
      publishedAt: parsedInvalid,
      publishDate: parsedInvalid,
    };

    const sorted = sortSummaries([undatedArticle, genuineNewArticle] as any, "latest");
    assert.strictEqual(sorted[0].id, "art-genuine-10m", "Genuine newer article MUST appear above undated article");
    assert.strictEqual(sorted[1].id, "art-undated-corrupt", "Undated article MUST NOT float to top");
  });

  // SCENARIO 7: Category, Publisher Source, & Date Range Filtering
  runTest("7. Category, Publisher & Date Range Filters: Chronological ordering and filter accuracy", () => {
    const qRes = NewsStoreManager.queryArticles({ category: "Current Affairs", sort: "latest", limit: 20 });
    assert(qRes.articles.length > 0);
    for (let i = 0; i < qRes.articles.length - 1; i++) {
      const current = new Date(qRes.articles[i].publishedAt).getTime();
      const next = new Date(qRes.articles[i + 1].publishedAt).getTime();
      assert(current >= next, `Chronological violation at index ${i}`);
    }

    const todayRes = NewsStoreManager.queryArticles({ dateRange: "today", sort: "latest", limit: 50 });
    assert(todayRes.articles.length > 0, "Should return articles published within the last 24 hours");
    for (const a of todayRes.articles) {
      assert(nowMs - new Date(a.publishedAt).getTime() <= 24 * 3600 * 1000 + 5000, "All 'today' articles must be within 24h");
    }

    const bbcRes = NewsStoreManager.queryArticles({ sourceId: "bbc_news", sort: "latest", limit: 20 });
    assert(bbcRes.articles.length > 0, "Should filter by publisher sourceId");
  });

  // SCENARIO 8: Search relevance ranking with newest-first toggle option
  runTest("8. Search Ranking: Preserves relevance ranking and supports newest-first sorting across historical archive", () => {
    const searchDefault = NewsStoreManager.queryArticles({ query: "policy", sort: "relevance" });
    assert(searchDefault.articles.length > 0, "Search query 'policy' should return matches");

    const searchNewest = NewsStoreManager.queryArticles({ query: "policy", sort: "latest" });
    assert(searchNewest.articles.length > 0);
    for (let i = 0; i < searchNewest.articles.length - 1; i++) {
      const tCur = new Date(searchNewest.articles[i].publishedAt).getTime();
      const tNext = new Date(searchNewest.articles[i + 1].publishedAt).getTime();
      assert(tCur >= tNext, "Search with sort=latest must sort by publication time descending");
    }
  });

  // SCENARIO 9: Pagination consistency without duplicate or skipped articles
  runTest("9. Pagination Consistency: Multi-page retrieval yields non-overlapping, complete sequences", () => {
    const page1 = NewsStoreManager.queryArticles({ sort: "latest", page: 1, limit: 10 });
    const page2 = NewsStoreManager.queryArticles({ sort: "latest", page: 2, limit: 10 });

    assert.strictEqual(page1.page, 1);
    assert.strictEqual(page2.page, 2);

    const idsPage1 = new Set(page1.articles.map((a) => a.id));
    for (const a2 of page2.articles) {
      assert(!idsPage1.has(a2.id), `Duplicate article ${a2.id} found across page 1 and page 2!`);
    }
  });

  // Clean up isolated test store before verifying production store recovery
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }

  // SCENARIO 10: System recovery & persistent disk integrity across restarts on production store
  runTest("10. System Recovery: Production store reloads all genuine historical articles and sanitizes test fixtures", () => {
    NewsStoreManager.setStorePath(prodStorePath);
    assert(fs.existsSync(prodStorePath), "Persistent storage file data/news_articles_store.json MUST exist on disk");

    // Re-initialize manager against production store (runs automatic migration & fixture cleanup if needed)
    NewsStoreManager.initStore([]);
    const reloadedCount = NewsStoreManager.getTotalCount();
    assert(reloadedCount > 2000, `Expected >2000 genuine historical articles in production store, got ${reloadedCount}`);

    // Verify no synthetic test fixtures remain in the production store
    const pollutedItem = NewsStoreManager.getArticleById("retention-test-item-0");
    assert.strictEqual(pollutedItem, undefined, "Production store must be 100% free of synthetic test fixtures");

    // Verify top articles in Latest News are genuinely sorted newest first
    const topFeed = NewsStoreManager.queryArticles({ sort: "latest", page: 1, limit: 25 });
    for (let i = 0; i < topFeed.articles.length - 1; i++) {
      const tCur = new Date(topFeed.articles[i].publishedAt).getTime();
      const tNext = new Date(topFeed.articles[i + 1].publishedAt).getTime();
      assert(tCur >= tNext, `Production store newest-first order violated at index ${i}`);
    }
  });

  console.log("\n================================================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner exception:", err);
  process.exit(1);
});
