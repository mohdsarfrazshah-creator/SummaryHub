import React, { useState, useMemo } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  FileJson,
  Sliders,
  Eye,
  CheckCircle2,
  HardDriveDownload,
  BookOpen,
  Clock,
  Sparkles,
} from "lucide-react";
import { SummaryItem } from "../types";
import {
  generatePlainTextSummary,
  generateMarkdownSummary,
  generateJsonSummary,
  downloadFile,
  downloadPdf,
  ExportOptions,
} from "../utils/exportUtils";

interface ExportSavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSavedSummaries: SummaryItem[];
  filteredSavedSummaries: SummaryItem[];
  selectedSummaries?: SummaryItem[];
  activeCategory?: string;
  searchTerm?: string;
}

export const ExportSavedModal: React.FC<ExportSavedModalProps> = ({
  isOpen,
  onClose,
  allSavedSummaries,
  filteredSavedSummaries,
  selectedSummaries = [],
  activeCategory = "All",
  searchTerm = "",
}) => {
  const [format, setFormat] = useState<"txt" | "md" | "json" | "pdf">("pdf");
  const [scope, setScope] = useState<"selected" | "filtered" | "all">(() => {
    if (selectedSummaries.length > 0) return "selected";
    if (filteredSavedSummaries.length !== allSavedSummaries.length) return "filtered";
    return "all";
  });

  // Keep scope in sync if selectedSummaries changes
  React.useEffect(() => {
    if (selectedSummaries.length > 0) {
      setScope("selected");
    }
  }, [selectedSummaries.length, isOpen]);

  // Configuration options
  const [includeDetailed, setIncludeDetailed] = useState(true);
  const [includeKeyFacts, setIncludeKeyFacts] = useState(true);
  const [includeTOC, setIncludeTOC] = useState(true);
  const [includeUrls, setIncludeUrls] = useState(true);
  const [includeVerification, setIncludeVerification] = useState(true);

  // UI state
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Determine items to export
  const targetSummaries = useMemo(() => {
    if (scope === "selected" && selectedSummaries.length > 0) {
      return selectedSummaries;
    }
    if (scope === "filtered") {
      return filteredSavedSummaries.length > 0 ? filteredSavedSummaries : allSavedSummaries;
    }
    return allSavedSummaries;
  }, [scope, selectedSummaries, filteredSavedSummaries, allSavedSummaries]);

  // Generate preview/export text
  const exportOptions: ExportOptions = useMemo(
    () => ({
      includeDetailedAnalysis: includeDetailed,
      includeKeyFacts: includeKeyFacts,
      includeTableOfContents: includeTOC,
      includeSourceUrls: includeUrls,
      includeVerificationData: includeVerification,
      format,
    }),
    [includeDetailed, includeKeyFacts, includeTOC, includeUrls, includeVerification, format]
  );

  const fileContent = useMemo(() => {
    if (format === "json") {
      return generateJsonSummary(targetSummaries);
    }
    if (format === "md") {
      return generateMarkdownSummary(targetSummaries, exportOptions);
    }
    return generatePlainTextSummary(targetSummaries, exportOptions);
  }, [targetSummaries, format, exportOptions]);

  // Filename generator
  const todayStr = new Date().toISOString().split("T")[0];
  const filename = useMemo(() => {
    let scopeLabel = "";
    if (scope === "selected") {
      scopeLabel = `-Selected-${selectedSummaries.length}`;
    } else if (scope === "filtered" && activeCategory !== "All") {
      scopeLabel = `-${activeCategory.replace(/\s+/g, "_")}`;
    }
    return `WorldLedger-Saved${scopeLabel}-${todayStr}.${format}`;
  }, [scope, selectedSummaries.length, activeCategory, todayStr, format]);

  // Statistics
  const totalMinutes = useMemo(() => {
    return targetSummaries.reduce((acc, curr) => acc + (curr.readingTimeMinutes || 3), 0);
  }, [targetSummaries]);

  const approxFileSizeKB = useMemo(() => {
    return (new Blob([fileContent]).size / 1024).toFixed(1);
  }, [fileContent]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (format === "pdf") {
      downloadPdf(targetSummaries, filename, exportOptions);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
      return;
    }
    const mimeTypes: Record<string, string> = {
      txt: "text/plain",
      md: "text/markdown",
      json: "application/json",
    };
    downloadFile(fileContent, filename, mimeTypes[format] || "text/plain");
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <HardDriveDownload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white sm:text-lg">
                Export Saved Articles for Offline Use
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Download a complete, self-contained summary file readable anywhere without internet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div className="text-center">
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Articles</div>
              <div className="mt-0.5 text-base font-bold text-indigo-600 dark:text-indigo-400">
                {targetSummaries.length}
              </div>
            </div>
            <div className="text-center border-x border-neutral-200 dark:border-neutral-800">
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Offline Time</div>
              <div className="mt-0.5 text-base font-bold text-neutral-900 dark:text-white">
                ~{totalMinutes} min
              </div>
            </div>
            <div className="text-center">
              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Est. Size</div>
              <div className="mt-0.5 text-base font-bold text-neutral-900 dark:text-white">
                ~{approxFileSizeKB} KB
              </div>
            </div>
          </div>

          {/* 1. Format Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              1. Choose File Format
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {/* PDF Format */}
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                  format === "pdf"
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${format === "pdf" ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-500"}`} />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">PDF (.pdf)</span>
                  </div>
                  {format === "pdf" && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <span className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Formatted PDF with cover metadata, TOC, and verification.
                </span>
                <span className="mt-2 inline-flex items-center rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Formatted PDF
                </span>
              </button>

              {/* Text Format */}
              <button
                type="button"
                onClick={() => setFormat("txt")}
                className={`relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                  format === "txt"
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${format === "txt" ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-500"}`} />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Plain Text (.txt)</span>
                  </div>
                  {format === "txt" && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <span className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Universal offline reading on any device, phone, or e-reader.
                </span>
                <span className="mt-2 inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  Universal
                </span>
              </button>

              {/* Markdown Format */}
              <button
                type="button"
                onClick={() => setFormat("md")}
                className={`relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                  format === "md"
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <FileCode className={`h-4 w-4 ${format === "md" ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-500"}`} />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Markdown (.md)</span>
                  </div>
                  {format === "md" && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <span className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Formatted for Obsidian, Notion, Bear, Logseq, and notes.
                </span>
                <span className="mt-2 inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  Notes
                </span>
              </button>

              {/* JSON Format */}
              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                  format === "json"
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <FileJson className={`h-4 w-4 ${format === "json" ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-500"}`} />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Structured JSON</span>
                  </div>
                  {format === "json" && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <span className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Full backup archive with raw data fields and metadata.
                </span>
                <span className="mt-2 inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  Raw Backup
                </span>
              </button>
            </div>
          </div>

          {/* 2. Scope Selection */}
          {(selectedSummaries.length > 0 || filteredSavedSummaries.length !== allSavedSummaries.length) && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                2. Export Scope
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSummaries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setScope("selected")}
                    className={`flex-1 min-w-[140px] rounded-xl border p-2.5 text-xs font-semibold transition ${
                      scope === "selected"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    }`}
                  >
                    ✓ Selected Articles ({selectedSummaries.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setScope("all")}
                  className={`flex-1 min-w-[140px] rounded-xl border p-2.5 text-xs font-semibold transition ${
                    scope === "all"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                  }`}
                >
                  All Saved ({allSavedSummaries.length})
                </button>
                {filteredSavedSummaries.length !== allSavedSummaries.length && (
                  <button
                    type="button"
                    onClick={() => setScope("filtered")}
                    className={`flex-1 min-w-[140px] rounded-xl border p-2.5 text-xs font-semibold transition ${
                      scope === "filtered"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    }`}
                  >
                    Filtered ({filteredSavedSummaries.length})
                    {activeCategory !== "All" && ` • ${activeCategory}`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. Content Details Included (for txt and md) */}
          {format !== "json" && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Included Content Sections
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{showPreview ? "Hide Preview" : "Live Preview"}</span>
                </button>
              </div>

              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDetailed}
                    onChange={(e) => setIncludeDetailed(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Full Detailed In-Depth Breakdown</span>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeKeyFacts}
                    onChange={(e) => setIncludeKeyFacts(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Key Facts, Dates & Key Metrics</span>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTOC}
                    onChange={(e) => setIncludeTOC(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Table of Contents at Top</span>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUrls}
                    onChange={(e) => setIncludeUrls(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Original Source URLs & Links</span>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 cursor-pointer sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={includeVerification}
                    onChange={(e) => setIncludeVerification(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Verification Scores & Official Fact-Check Sources</span>
                </label>
              </div>
            </div>
          )}

          {/* Live Preview Block */}
          {showPreview && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-semibold">File Preview ({filename}):</span>
                <span>{fileContent.length.toLocaleString()} characters</span>
              </div>
              <pre className="max-h-56 overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-950 p-4 font-mono text-[11px] leading-relaxed text-neutral-200 dark:border-neutral-800">
                {fileContent}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100 bg-neutral-50/70 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950/60">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2 self-start sm:self-auto">
            <span className="font-semibold text-neutral-900 dark:text-white">File:</span>
            <code className="rounded bg-neutral-200/60 px-1.5 py-0.5 text-[11px] dark:bg-neutral-800 font-mono">
              {filename}
            </code>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              id="export-modal-copy-btn"
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              id="export-modal-download-btn"
              type="button"
              onClick={handleDownload}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition ${
                downloadSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download .{format.toUpperCase()} File</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
