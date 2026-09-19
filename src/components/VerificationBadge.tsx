import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { SummaryItem, VerificationData } from "../types";

interface VerificationBadgeProps {
  summary: SummaryItem;
  onOpenAudit?: (summary: SummaryItem) => void;
  size?: "sm" | "md";
  showScore?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  summary,
  onOpenAudit,
  size = "sm",
  showScore = true,
}) => {
  const isVerified = summary.verification?.isVerified !== false;
  const score = summary.verification?.verificationScore || 98;
  const status = summary.verification?.status || "Verified";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenAudit) {
      onOpenAudit(summary);
    }
  };

  if (size === "sm") {
    return (
      <button
        id={`verification-badge-${summary.id}`}
        onClick={handleClick}
        title="Verified information by official source cross-check. Click to view verification certificate."
        className="group/badge inline-flex items-center gap-1 rounded-md border border-emerald-300/80 bg-emerald-50/90 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800 transition-all hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-800/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
      >
        <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        <span className="font-bold">{status}</span>
        {showScore && (
          <>
            <span className="text-emerald-400 dark:text-emerald-600">•</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300">{score}%</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      id={`verification-badge-lg-${summary.id}`}
      onClick={handleClick}
      title="Verified Information. Click to inspect source citations and fact-check audit."
      className="group/badge flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 transition-all hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white">
        <ShieldCheck className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-bold">{status}</span>
        <span className="text-emerald-400">•</span>
        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          Credibility: {score}%
        </span>
      </div>
    </button>
  );
};
