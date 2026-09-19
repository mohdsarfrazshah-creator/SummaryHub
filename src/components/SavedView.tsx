import React, { useState, useMemo } from "react";
import { 
  Bookmark, 
  Search, 
  Download, 
  Folder, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink, 
  Sparkles,
  FileText
} from "lucide-react";
import { SummaryItem, Language } from "../types";
import { FeedCard } from "./FeedCard";

interface SavedViewProps {
  summaries: SummaryItem[];
  savedIds: string[];
  currentLanguage: Language;
  onOpenSummary: (summary: SummaryItem, initialTab?: string) => void;
  onToggleSave: (id: string) => void;
  onOpenAudit?: (summary: SummaryItem) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  summaries,
  savedIds,
  currentLanguage,
  onOpenSummary,
  onToggleSave,
  onOpenAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [copiedAll, setCopiedAll] = useState(false);

  // Saved items list
  const savedSummaries = useMemo(() => {
    return summaries.filter((s) => savedIds.includes(s.id));
  }, [summaries, savedIds]);

  // Distinct folders/categories among saved
  const folders = useMemo(() => {
    const set = new Set<string>();
    savedSummaries.forEach((s) => set.add(s.category));
    return ["All", ...Array.from(set)];
  }, [savedSummaries]);

  // Filtered
  const filteredSaved = useMemo(() => {
    return savedSummaries.filter((item) => {
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
  }, [savedSummaries, selectedFolder, searchTerm]);

  // Export all saved summaries in Markdown format
  const handleExportMarkdown = () => {
    let md = `# SummaryHub — My Saved Knowledge Base\n`;
    md += `Exported on: ${new Date().toLocaleDateString()}\n\n`;

    savedSummaries.forEach((item, index) => {
      md += `## ${index + 1}. ${item.title}\n`;
      md += `Creator: ${item.creatorName} | Platform: ${item.platform} | Category: ${item.category}\n`;
      md += `Link: ${item.originalUrl}\n\n`;
      md += `### Quick Summary:\n`;
      item.quickSummary.forEach((b) => (md += `- ${b}\n`));
      md += `\n### Detailed Analysis:\n${item.detailedSummary}\n\n`;
      md += `### Key Facts:\n`;
      md += `- Names: ${item.keyFacts.names.join(", ")}\n`;
      md += `- Dates: ${item.keyFacts.dates.join(", ")}\n`;
      md += `- Decisions: ${item.keyFacts.decisions.join(", ")}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SummaryHub-Saved-Notes-${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyAllToClipboard = () => {
    let text = `# SummaryHub Saved Notes\n\n`;
    savedSummaries.forEach((s) => {
      text += `• ${s.title} (${s.creatorName}): ${s.quickSummary[0]}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
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
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
            Your personal digital library. Revisit key takeaways, quiz yourself, or export for revision.
          </p>
        </div>

        {savedSummaries.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              id="copy-all-saved-btn"
              onClick={handleCopyAllToClipboard}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {copiedAll ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copiedAll ? "Copied" : "Copy Digest"}</span>
            </button>

            <button
              id="export-saved-markdown-btn"
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <Download className="h-4 w-4" />
              <span>Export .MD Notes</span>
            </button>
          </div>
        )}
      </div>

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
          </div>

          {/* List of Saved Cards */}
          <div className="grid gap-5">
            {filteredSaved.map((summary) => (
              <FeedCard
                key={summary.id}
                summary={summary}
                currentLanguage={currentLanguage}
                onOpenSummary={onOpenSummary}
                onToggleSave={onToggleSave}
                isSaved={true}
                onOpenAudit={onOpenAudit}
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
    </div>
  );
};
