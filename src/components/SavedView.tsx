import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Bookmark, 
  Search, 
  Download, 
  Folder, 
  Copy, 
  Check, 
  Trash2, 
  FileText, 
  Clock, 
  ArrowRight, 
  Sliders, 
  CheckCircle2,
  CheckSquare,
  Square,
  MinusSquare,
  ChevronDown,
  X,
  AlertTriangle,
  FileCode,
  FileJson
} from "lucide-react";
import { SummaryItem, Language } from "../types";
import { FeedCard } from "./FeedCard";
import { ExportSavedModal } from "./ExportSavedModal";
import { 
  generatePlainTextSummary, 
  generateMarkdownSummary, 
  generateJsonSummary, 
  downloadFile,
  downloadPdf,
  generatePdfSummary
} from "../utils/exportUtils";

interface SavedViewProps {
  summaries: SummaryItem[];
  savedIds: string[];
  readLaterIds?: string[];
  readLaterCount?: number;
  currentLanguage: Language;
  onOpenSummary: (summary: SummaryItem, initialTab?: string) => void;
  onToggleSave: (id: string) => void;
  onBulkUnsave?: (ids: string[]) => void;
  onToggleReadLater?: (id: string) => void;
  onMoveToReadLater?: (id: string) => void;
  onNavigateToReadLater?: () => void;
  onOpenAudit?: (summary: SummaryItem) => void;
  onOpenImagePicker?: (summary: SummaryItem) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  summaries,
  savedIds,
  readLaterIds = [],
  readLaterCount = 0,
  currentLanguage,
  onOpenSummary,
  onToggleSave,
  onBulkUnsave,
  onToggleReadLater,
  onMoveToReadLater,
  onNavigateToReadLater,
  onOpenAudit,
  onOpenImagePicker,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [copiedAll, setCopiedAll] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [quickDownloaded, setQuickDownloaded] = useState(false);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isBulkExportMenuOpen, setIsBulkExportMenuOpen] = useState(false);
  const [bulkExportSuccess, setBulkExportSuccess] = useState<string | null>(null);

  const bulkExportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (bulkExportMenuRef.current && !bulkExportMenuRef.current.contains(e.target as Node)) {
        setIsBulkExportMenuOpen(false);
      }
    };
    if (isBulkExportMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isBulkExportMenuOpen]);

  // Saved items list with instant O(1) Set lookup
  const savedSummaries = useMemo(() => {
    const idSet = new Set(savedIds);
    return summaries.filter((s) => idSet.has(s.id));
  }, [summaries, savedIds]);

  // Clean up selectedIds if items were removed
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => savedIds.includes(id)));
  }, [savedIds]);

  // Distinct folders/categories among saved
  const folders = useMemo(() => {
    const set = new Set<string>();
    savedSummaries.forEach((s) => set.add(s.category));
    return ["All", ...Array.from(set)];
  }, [savedSummaries]);

  // Filtered
  const filteredSaved = useMemo(() => {
    const filtered = savedSummaries.filter((item) => {
      if (selectedFolder !== "All" && item.category !== selectedFolder) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCreator = item.creatorName.toLowerCase().includes(q);
        const matchesQuick = item.quickSummary.some((x) => x.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCreator && !matchesQuick) return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.publishDate).getTime();
      const timeB = new Date(b.publishDate).getTime();
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [savedSummaries, selectedFolder, searchTerm]);

  // Selected summaries objects
  const selectedSummaries = useMemo(() => {
    return savedSummaries.filter((s) => selectedIds.includes(s.id));
  }, [savedSummaries, selectedIds]);

  // Selection states relative to filtered items
  const allFilteredSelected = useMemo(() => {
    return filteredSaved.length > 0 && filteredSaved.every((s) => selectedIds.includes(s.id));
  }, [filteredSaved, selectedIds]);

  const someFilteredSelected = useMemo(() => {
    return filteredSaved.some((s) => selectedIds.includes(s.id)) && !allFilteredSelected;
  }, [filteredSaved, selectedIds, allFilteredSelected]);

  // Total estimated offline reading time
  const totalOfflineMinutes = useMemo(() => {
    return savedSummaries.reduce((acc, curr) => acc + (curr.readingTimeMinutes || 3), 0);
  }, [savedSummaries]);

  // Toggle selection for individual article
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Toggle select all filtered articles
  const handleToggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredSaved.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filteredSaved.map((s) => s.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Quick 1-click Plain Text Summary (.txt) Export for all/filtered
  const handleQuickDownloadTxt = () => {
    if (savedSummaries.length === 0) return;
    const itemsToExport = filteredSaved.length > 0 && (searchTerm.trim() || selectedFolder !== "All")
      ? filteredSaved
      : savedSummaries;
    
    const txtContent = generatePlainTextSummary(itemsToExport, {
      includeDetailedAnalysis: true,
      includeKeyFacts: true,
      includeTableOfContents: true,
      includeSourceUrls: true,
      includeVerificationData: true,
      format: "txt",
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const categorySuffix = selectedFolder !== "All" ? `-${selectedFolder.replace(/\s+/g, "_")}` : "";
    downloadFile(txtContent, `WorldLedger-Saved-Offline${categorySuffix}-${todayStr}.txt`, "text/plain");

    setQuickDownloaded(true);
    setTimeout(() => setQuickDownloaded(false), 2500);
  };

  // Bulk Export for selected items
  const handleBulkExport = (format: "txt" | "md" | "json" | "pdf") => {
    if (selectedSummaries.length === 0) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const filename = `WorldLedger-Selected-${selectedSummaries.length}-${todayStr}.${format}`;

    if (format === "pdf") {
      downloadPdf(selectedSummaries, filename, {
        includeDetailedAnalysis: true,
        includeKeyFacts: true,
        includeTableOfContents: true,
        includeSourceUrls: true,
        includeVerificationData: true,
        format: "pdf",
      });
    } else if (format === "json") {
      const jsonContent = generateJsonSummary(selectedSummaries);
      downloadFile(jsonContent, filename, "application/json");
    } else if (format === "md") {
      const mdContent = generateMarkdownSummary(selectedSummaries, {
        includeDetailedAnalysis: true,
        includeKeyFacts: true,
        includeTableOfContents: true,
        includeSourceUrls: true,
        includeVerificationData: true,
        format: "md",
      });
      downloadFile(mdContent, filename, "text/markdown");
    } else {
      const txtContent = generatePlainTextSummary(selectedSummaries, {
        includeDetailedAnalysis: true,
        includeKeyFacts: true,
        includeTableOfContents: true,
        includeSourceUrls: true,
        includeVerificationData: true,
        format: "txt",
      });
      downloadFile(txtContent, filename, "text/plain");
    }

    setIsBulkExportMenuOpen(false);
    setBulkExportSuccess(format.toUpperCase());
    setTimeout(() => setBulkExportSuccess(null), 2500);
  };

  // Copy Selected Articles Digest
  const handleBulkCopy = () => {
    if (selectedSummaries.length === 0) return;
    let text = `# The World Ledger Selected Dispatches (${selectedSummaries.length})\n\n`;
    selectedSummaries.forEach((s) => {
      text += `• ${s.title} (${s.creatorName}): ${s.quickSummary[0]}\n`;
      if (s.originalUrl) text += `  Source: ${s.originalUrl}\n`;
    });
    navigator.clipboard.writeText(text);
    setIsBulkExportMenuOpen(false);
    setBulkExportSuccess("COPIED");
    setTimeout(() => setBulkExportSuccess(null), 2000);
  };

  // Bulk Delete Execution
  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (onBulkUnsave) {
      onBulkUnsave(selectedIds);
    } else {
      selectedIds.forEach((id) => onToggleSave(id));
    }
    setSelectedIds([]);
    setIsDeleteConfirmOpen(false);
  };

  const handleCopyAllToClipboard = () => {
    let text = `# The World Ledger Saved Notes\n\n`;
    savedSummaries.forEach((s) => {
      text += `• ${s.title} (${s.creatorName}): ${s.quickSummary[0]}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
              Saved Summaries
            </h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {savedSummaries.length} saved
            </span>
            {selectedIds.length > 0 && (
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300 animate-in fade-in duration-200">
                {selectedIds.length} selected
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
            Your personal digital library. Select items with checkboxes for bulk export or deletion.
          </p>
        </div>

        {savedSummaries.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="copy-all-saved-btn"
              onClick={handleCopyAllToClipboard}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              title="Copy bullet points of all saved summaries"
            >
              {copiedAll ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copiedAll ? "Copied" : "Copy Digest"}</span>
            </button>

            <button
              id="export-options-modal-btn"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-2xs transition hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
              title="Customize offline export options (.txt, .md, .json)"
            >
              <Sliders className="h-4 w-4" />
              <span>Export Options...</span>
            </button>

            <button
              id="download-saved-txt-btn"
              onClick={handleQuickDownloadTxt}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-xs transition ${
                quickDownloaded
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              title="Download entire saved library as a formatted plain text file for offline use"
            >
              {quickDownloaded ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Downloaded .TXT!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download Offline .TXT</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Read Later Queue Announcement Banner */}
      {onNavigateToReadLater && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-3.5 text-xs dark:border-violet-900/40 dark:bg-violet-950/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-violet-900 dark:text-violet-200">
                Temporary Reading List vs Permanent Bookmarks:
              </span>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                You currently have {readLaterCount} items in your <strong className="text-violet-700 dark:text-violet-300">Read Later Queue</strong> with 7-day auto-cleanup. Items here in Saved are kept permanently.
              </p>
            </div>
          </div>
          <button
            id="saved-open-read-later-btn"
            onClick={onNavigateToReadLater}
            className="flex items-center gap-1.5 shrink-0 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-violet-700 transition self-start sm:self-auto"
          >
            <span>Open 7d Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {savedSummaries.length > 0 ? (
        <>
          {/* Filter Folders & Search */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="saved-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search within your saved notes..."
                className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              />
            </div>

            {/* Folder Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {folders.map((folder) => {
                const isSelected = selectedFolder === folder;
                return (
                  <button
                    key={folder}
                    id={`folder-${folder.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setSelectedFolder(folder)}
                    className={`flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <Folder className="h-3 w-3" />
                    <span>{folder}</span>
                  </button>
                );
              })}
            </div>

            {/* Selection & Offline readiness control bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-white p-3 text-xs shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
              {/* Checkbox select all control */}
              <div className="flex items-center gap-3">
                <button
                  id="select-all-saved-btn"
                  type="button"
                  onClick={handleToggleSelectAllFiltered}
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/80 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  title={allFilteredSelected ? "Deselect all filtered articles" : "Select all filtered articles"}
                >
                  {allFilteredSelected ? (
                    <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  ) : someFilteredSelected ? (
                    <MinusSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Square className="h-4 w-4 text-neutral-400" />
                  )}
                  <span>
                    {allFilteredSelected
                      ? "Deselect All"
                      : `Select All (${filteredSaved.length})`}
                  </span>
                </button>

                {selectedIds.length > 0 && (
                  <button
                    onClick={handleClearSelection}
                    className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Status and count info */}
              <div className="flex items-center gap-3">
                <span className="text-neutral-500 dark:text-neutral-400 text-[11px] sm:text-xs">
                  {selectedIds.length > 0 ? (
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {selectedIds.length} of {filteredSaved.length} selected
                    </strong>
                  ) : (
                    <span>
                      Showing <strong>{filteredSaved.length}</strong> of <strong>{savedSummaries.length}</strong> articles (~{totalOfflineMinutes} min)
                    </span>
                  )}
                </span>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <FileText className="h-3 w-3" />
                  <span>Full Export &rarr;</span>
                </button>
              </div>
            </div>
          </div>

          {/* List of Saved Cards with Checkboxes */}
          <div className="grid gap-5">
            {filteredSaved.map((summary) => (
              <FeedCard
                key={summary.id}
                summary={summary}
                currentLanguage={currentLanguage}
                onOpenSummary={onOpenSummary}
                onToggleSave={onToggleSave}
                isSaved={true}
                selectable={true}
                isSelected={selectedIds.includes(summary.id)}
                onToggleSelect={handleToggleSelect}
                isReadLater={readLaterIds.includes(summary.id)}
                onToggleReadLater={onToggleReadLater}
                onMoveToReadLater={onMoveToReadLater}
                onOpenAudit={onOpenAudit}
                onOpenImagePicker={onOpenImagePicker}
              />
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <Bookmark className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-3" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            No saved summaries yet
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Whenever you see an interesting post or video summary in the Home Feed, click the bookmark icon to save it here for offline study and revision.
          </p>
        </div>
      )}

      {/* FLOATING ACTION BAR FOR BULK EXPORT & DELETION */}
      {selectedIds.length > 0 && (
        <div 
          id="saved-floating-action-bar"
          className="fixed bottom-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-2xl w-full animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-700/80 bg-neutral-900/95 p-3 sm:px-4 sm:py-3 text-white shadow-2xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
            {/* Left: Counter & Select All toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 px-3 py-1.5 text-xs font-bold text-indigo-300">
                <CheckSquare className="h-4 w-4 text-indigo-400" />
                <span>{selectedIds.length} {selectedIds.length === 1 ? "article" : "articles"} selected</span>
              </div>

              <button
                id="floating-toggle-select-all-btn"
                type="button"
                onClick={handleToggleSelectAllFiltered}
                className="text-xs text-neutral-300 hover:text-white underline underline-offset-2 transition"
              >
                {allFilteredSelected ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Right: Bulk Export & Bulk Deletion */}
            <div className="flex items-center gap-2">
              {/* Bulk Export Menu Trigger */}
              <div className="relative" ref={bulkExportMenuRef}>
                <div className="inline-flex rounded-xl shadow-xs">
                  <button
                    id="bulk-export-quick-pdf-btn"
                    type="button"
                    onClick={() => handleBulkExport("pdf")}
                    className="flex items-center gap-1.5 rounded-l-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-bold text-white transition border-r border-indigo-700/60"
                    title="Export selected articles as a formatted PDF document with cover, TOC & fact checks"
                  >
                    <Download className="h-4 w-4" />
                    <span>
                      {bulkExportSuccess === "PDF" ? "Downloaded PDF!" : "Export PDF"}
                    </span>
                  </button>

                  <button
                    id="bulk-export-menu-dropdown-btn"
                    type="button"
                    onClick={() => setIsBulkExportMenuOpen(!isBulkExportMenuOpen)}
                    aria-label="More export format options"
                    className="flex items-center justify-center rounded-r-xl bg-indigo-600 hover:bg-indigo-500 px-2 py-2 text-white transition"
                    title="More export formats (PDF, TXT, Markdown, JSON, Clipboard)"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Dropdown Popover */}
                {isBulkExportMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-60 rounded-2xl border border-neutral-700 bg-neutral-900 p-2 shadow-2xl animate-in fade-in duration-150 z-50 text-white">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Export {selectedIds.length} Selected
                    </div>
                    
                    <button
                      id="bulk-export-option-pdf-btn"
                      type="button"
                      onClick={() => handleBulkExport("pdf")}
                      className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-400" />
                        <span>Formatted PDF (.pdf)</span>
                      </div>
                      <span className="rounded bg-indigo-600/40 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                        Styled
                      </span>
                    </button>

                    <button
                      id="bulk-export-option-txt-btn"
                      type="button"
                      onClick={() => handleBulkExport("txt")}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <span>Plain Text Summary (.txt)</span>
                    </button>

                    <button
                      id="bulk-export-option-md-btn"
                      type="button"
                      onClick={() => handleBulkExport("md")}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <FileCode className="h-4 w-4 text-indigo-400" />
                      <span>Markdown Digest (.md)</span>
                    </button>

                    <button
                      id="bulk-export-option-json-btn"
                      type="button"
                      onClick={() => handleBulkExport("json")}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <FileJson className="h-4 w-4 text-indigo-400" />
                      <span>Structured Data (.json)</span>
                    </button>

                    <div className="my-1 border-t border-neutral-800" />

                    <button
                      type="button"
                      onClick={handleBulkCopy}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <Copy className="h-4 w-4 text-emerald-400" />
                      <span>Copy Digest to Clipboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkExportMenuOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <Sliders className="h-4 w-4 text-amber-400" />
                      <span>Customize Options...</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bulk Delete Trigger */}
              <button
                id="bulk-delete-selected-btn"
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-xs transition"
                title={`Delete ${selectedIds.length} selected articles from saved library`}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete ({selectedIds.length})</span>
              </button>

              {/* Clear Selection X button */}
              <button
                id="bulk-clear-selection-btn"
                type="button"
                onClick={handleClearSelection}
                className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
                title="Deselect all"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETION CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div 
            className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Remove {selectedIds.length} {selectedIds.length === 1 ? "Article" : "Articles"}?
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Unsaving will remove these from your personal offline library.
                  </p>
                </div>
              </div>

              {/* Preview of articles to be removed */}
              <div className="mt-4 max-h-48 overflow-y-auto rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-950/50 space-y-1.5">
                {selectedSummaries.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                ))}
                {selectedSummaries.length > 5 && (
                  <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pl-3.5">
                    + {selectedSummaries.length - 5} more articles
                  </div>
                )}
              </div>

              <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                You can easily bookmark them again later from the Home Feed.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  id="confirm-bulk-delete-btn"
                  type="button"
                  onClick={handleConfirmBulkDelete}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Yes, Delete ({selectedIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Export Modal (with selected items support) */}
      <ExportSavedModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allSavedSummaries={savedSummaries}
        filteredSavedSummaries={filteredSaved}
        selectedSummaries={selectedSummaries}
        activeCategory={selectedFolder}
        searchTerm={searchTerm}
      />
    </div>
  );
};
