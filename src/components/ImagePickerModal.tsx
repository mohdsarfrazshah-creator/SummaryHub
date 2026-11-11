import React, { useState, useMemo } from "react";
import { X, Sparkles, Check, Image as ImageIcon, Link as LinkIcon, RefreshCw, Eye } from "lucide-react";
import { SummaryItem } from "../types";
import { getTopicInfo, getTopicImageUrl } from "../utils/topicImageMatcher";

interface ImagePickerModalProps {
  summary: SummaryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveImage: (summaryId: string, imageUrl: string) => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  summary,
  isOpen,
  onClose,
  onSaveImage,
}) => {
  const topicInfo = useMemo(() => {
    return getTopicInfo({
      title: summary?.title || "",
      category: summary?.category || "Current Affairs",
      currentAffairsCategory: summary?.currentAffairsCategory,
      content: summary?.detailedSummary || summary?.easySummary || "",
    });
  }, [summary]);

  const initialImage = summary ? (summary.thumbnailUrl || getTopicImageUrl(summary)) : "";
  const [selectedImage, setSelectedImage] = useState<string>(initialImage);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"topic" | "custom">("topic");

  if (!isOpen || !summary) return null;

  const handleApply = () => {
    const finalUrl = activeTab === "custom" && customUrl.trim() ? customUrl.trim() : selectedImage;
    if (finalUrl) {
      onSaveImage(summary.id, finalUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white sm:text-lg">
                  Customize Article Image
                </h2>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Topic Match
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-md">
                {summary.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Topic Tag Banner */}
        <div className="border-b border-neutral-100 bg-indigo-50/50 px-6 py-2.5 dark:border-neutral-800/80 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Recognized Topic Domain: <strong>{topicInfo.topicLabel}</strong></span>
            </div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {topicInfo.candidates.length} Curated Photos
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-200 px-6 pt-2 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab("topic")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === "topic"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Select Related Topic Photo</span>
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === "custom"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Custom Image Link</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Active Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Active Selection Preview
              </span>
              <span className="text-[11px] text-neutral-400">16:9 Standard Card Aspect</span>
            </div>
            <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-neutral-100 shadow-inner dark:border-indigo-500/30 dark:bg-neutral-800">
              <img
                src={activeTab === "custom" && customUrl.trim() ? customUrl : selectedImage}
                alt="Selected preview"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.opacity = "0.5";
                }}
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-black/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Currently Active</span>
              </div>
            </div>
          </div>

          {activeTab === "topic" ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Choose from Curated Photos ({topicInfo.topicLabel})
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Click any photo to select
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {topicInfo.candidates.map((imgUrl, idx) => {
                  const isSelected = selectedImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`group relative aspect-video overflow-hidden rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/40 scale-[1.02]"
                          : "border-neutral-200 hover:border-indigo-300 dark:border-neutral-700 dark:hover:border-neutral-500"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Candidate ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-900/30 flex items-center justify-center backdrop-blur-2xs">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-medium text-white">
                        Option #{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Direct Image Link (URL)
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://example.com/photo.jpg"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-600 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Ensure the image link is publicly accessible and begins with http:// or https://
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50/80 px-6 py-3.5 dark:border-neutral-800 dark:bg-neutral-850">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Check className="h-4 w-4" />
            <span>Apply Selected Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
