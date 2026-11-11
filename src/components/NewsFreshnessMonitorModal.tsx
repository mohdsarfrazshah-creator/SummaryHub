import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock,
  Radio,
  Server,
  Database,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  ArrowUpRight,
  Flame,
  AlertOctagon,
} from "lucide-react";
import { AiService } from "../services/aiService";

interface IngestionSourceStatus {
  id: string;
  name: string;
  sourceName?: string;
  category: string;
  subCategory?: string;
  feedUrl: string;
  status: "operational" | "degraded" | "failed" | "idle";
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastSuccessfulFetch?: string | null;
  lastFailedFetch?: string | null;
  httpStatus?: number;
  latencyMs?: number;
  itemsDiscovered?: number;
  articlesDiscovered?: number;
  articlesInserted?: number;
  articlesUpdated?: number;
  articlesSkipped?: number;
  articlesCount?: number;
  lastArticlePublishedAt?: string;
  lastError?: string | null;
  errorDetails?: string | null;
}

interface IngestionTelemetry {
  status: "healthy" | "warning" | "critical";
  lastGlobalSyncAt: string;
  lastSuccessfulSyncAt: string;
  totalStoreArticles: number;
  newestArticlePublishedAt: string;
  oldestArticlePublishedAt: string;
  operationalSources: number;
  failedSources: number;
  totalSources: number;
  latestRunStats: {
    added: number;
    updated: number;
    skipped?: number;
    discovered: number;
    durationMs: number;
  };
  sources: IngestionSourceStatus[];
}

interface NewsFreshnessMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshFeed?: () => void;
  onRefreshComplete?: () => void;
}

export const NewsFreshnessMonitorModal: React.FC<NewsFreshnessMonitorModalProps> = ({
  isOpen,
  onClose,
  onRefreshFeed,
  onRefreshComplete,
}) => {
  const [telemetry, setTelemetry] = useState<IngestionTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "operational" | "failed">("all");

  const loadStatus = async () => {
    try {
      const data = await AiService.getIngestionStatus();
      setTelemetry(data);
    } catch (err: any) {
      console.warn("Error loading ingestion status:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      const interval = setInterval(loadStatus, 15000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleTriggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncNotice(null);

    try {
      const res = await AiService.triggerNewsSync();
      setSyncNotice(res.message);
      await loadStatus();
      onRefreshFeed?.();
      onRefreshComplete?.();
    } catch (err: any) {
      setSyncNotice(`Sync Error: ${err.message || "Failed to trigger ingestion"}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 8000);
    }
  };

  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return "Never";
    try {
      const ms = new Date(isoString).getTime();
      if (isNaN(ms)) return "Never";
      const diffSec = Math.floor((Date.now() - ms) / 1000);
      if (diffSec < 10) return "Just now";
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return "Never";
    }
  };

  if (!isOpen) return null;

  const sourcesList = telemetry?.sources || [];
  const filteredSources = sourcesList.filter((s) => {
    if (filterStatus === "operational") return s.status === "operational";
    if (filterStatus === "failed") return s.status === "failed";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-neutral-200 bg-white shadow-2xl overflow-hidden dark:border-neutral-800 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/80 px-5 py-4 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-850/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold font-serif-masthead tracking-tight uppercase sm:text-lg">
                  News Freshness & Ingestion Monitor
                </h2>
                {telemetry && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      telemetry.status === "healthy"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                        : telemetry.status === "warning"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span>
                      {telemetry.status === "healthy"
                        ? "All Sources Operational"
                        : `${telemetry.failedSources} Failing / Degraded`}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Authoritative real-time telemetry from wire publishers and automated background workers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition"
            aria-label="Close monitor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Action Trigger Banner */}
          {syncNotice && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-3.5 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{syncNotice}</span>
            </div>
          )}

          {/* Metric Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                <span>Last Global Sync</span>
              </div>
              <div className="mt-1 text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                {getRelativeTime(telemetry?.lastSuccessfulSyncAt)}
              </div>
              <div className="text-[10px] text-neutral-400 truncate">
                {telemetry?.lastSuccessfulSyncAt ? new Date(telemetry.lastSuccessfulSyncAt).toLocaleTimeString() : "—"}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <Database className="h-3.5 w-3.5 text-emerald-500" />
                <span>Total Stored</span>
              </div>
              <div className="mt-1 text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                {telemetry?.totalStoreArticles.toLocaleString() || "—"}
              </div>
              <div className="text-[10px] text-neutral-400">
                Permanent Retention
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <Radio className="h-3.5 w-3.5 text-rose-500" />
                <span>Active Sources</span>
              </div>
              <div className="mt-1 text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                {telemetry ? `${telemetry.operationalSources} / ${telemetry.totalSources}` : "—"}
              </div>
              <div className="text-[10px] text-neutral-400">
                5-Min Automated Cron
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Newest Article</span>
              </div>
              <div className="mt-1 text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate">
                {getRelativeTime(telemetry?.newestArticlePublishedAt)}
              </div>
              <div className="text-[10px] text-neutral-400 truncate">
                {telemetry?.newestArticlePublishedAt ? new Date(telemetry.newestArticlePublishedAt).toLocaleTimeString() : "—"}
              </div>
            </div>
          </div>

          {/* Trigger Control Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-transparent p-4 dark:border-indigo-900/40 dark:from-indigo-950/20">
            <div>
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                Production Ingestion Dispatcher
              </h4>
              <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-300">
                Forces an immediate network harvest from BBC, The Hindu, Wired, CNBC, and international wires.
              </p>
            </div>

            <button
              id="trigger-production-sync-btn"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Harvesting Feeds..." : "Trigger Ingestion Run Now"}</span>
            </button>
          </div>

          {/* Source Status Table Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Configured Sources ({sourcesList.length})
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${
                    filterStatus === "all"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  All ({sourcesList.length})
                </button>
                <button
                  onClick={() => setFilterStatus("operational")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${
                    filterStatus === "operational"
                      ? "bg-emerald-600 text-white"
                      : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  Operational ({sourcesList.filter((s) => s.status === "operational").length})
                </button>
                {sourcesList.some((s) => s.status === "failed") && (
                  <button
                    onClick={() => setFilterStatus("failed")}
                    className={`rounded-lg px-2.5 py-1 font-medium transition ${
                      filterStatus === "failed"
                        ? "bg-rose-600 text-white"
                        : "text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    }`}
                  >
                    Failing ({sourcesList.filter((s) => s.status === "failed").length})
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-neutral-200/90 overflow-hidden dark:border-neutral-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Source & Category</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold">Latest Run (Disc / +Add / ↻Upd / Skip)</th>
                    <th className="px-4 py-2.5 font-semibold">Last Success</th>
                    <th className="px-4 py-2.5 font-semibold">Newest Article</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
                  {filteredSources.map((source) => (
                    <tr
                      key={source.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {source.name}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {source.subCategory || source.category}
                        </div>
                        {source.lastError && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <AlertOctagon className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-xs">{source.lastError}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {source.status === "operational" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Operational</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Failing</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                        <span>{source.articlesDiscovered ?? source.itemsDiscovered ?? 0}</span>
                        {" / "}
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{source.articlesInserted ?? 0}</span>
                        {" / "}
                        <span className="text-amber-600 dark:text-amber-400 font-bold">↻{source.articlesUpdated ?? 0}</span>
                        {" / "}
                        <span className="text-neutral-400">{source.articlesSkipped ?? 0}</span>
                      </td>

                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                        {getRelativeTime(source.lastSuccessAt)}
                      </td>

                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                        {source.lastArticlePublishedAt ? getRelativeTime(source.lastArticlePublishedAt) : "—"}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-[11px] text-neutral-500">
                        {source.latencyMs ? `${source.latencyMs}ms` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-neutral-200/80 px-5 py-3 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 text-xs">
          <span className="text-neutral-500">
            Automated news harvesting engine running every 5 minutes on server.
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-900 px-4 py-1.5 font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
