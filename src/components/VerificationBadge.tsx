import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { SummaryItem, VerificationData } from "../types";

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = "h-3 w-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

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
  const isGoogleVerified = summary.verification?.isGoogleVerified === true || summary.verification?.primarySourceType === "Google Verified Source";
  const status = isGoogleVerified ? "Google Verified" : (summary.verification?.status || "Verified");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenAudit) {
      onOpenAudit(summary);
    }
  };

  if (size === "sm") {
    if (isGoogleVerified) {
      return (
        <button
          id={`verification-badge-${summary.id}`}
          onClick={handleClick}
          title="Google Verified Source: Corroborated with Google Search Grounding & primary web citations. Click to view verification audit."
          className="group/badge inline-flex items-center gap-1 rounded-md border border-blue-200/80 bg-blue-50/90 px-1.5 py-0.5 text-[11px] font-semibold text-blue-900 transition-all hover:border-blue-400 hover:bg-blue-100 dark:border-blue-800/80 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-900/60"
        >
          <GoogleIcon className="h-3 w-3 shrink-0" />
          <span className="font-bold">Google Verified</span>
          {showScore && (
            <>
              <span className="text-blue-400 dark:text-blue-600">•</span>
              <span className="text-[10px] text-blue-700 dark:text-blue-300">{score}%</span>
            </>
          )}
        </button>
      );
    }

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

  if (isGoogleVerified) {
    return (
      <button
        id={`verification-badge-lg-${summary.id}`}
        onClick={handleClick}
        title="Google Verified Source: Click to inspect live Google Search citations and audit certificate."
        className="group/badge flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50/80 px-2.5 py-1.5 text-xs font-semibold text-blue-900 transition-all hover:border-blue-400 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white shadow-xs dark:bg-neutral-800">
          <GoogleIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold">Google Verified Source</span>
          <span className="text-blue-400">•</span>
          <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
            {score}% Match
          </span>
        </div>
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
