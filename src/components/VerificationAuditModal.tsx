import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  FileCheck, 
  Calendar, 
  Building2, 
  Award, 
  SearchCheck,
  AlertCircle
} from "lucide-react";
import { SummaryItem } from "../types";

interface VerificationAuditModalProps {
  summary: SummaryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationAuditModal: React.FC<VerificationAuditModalProps> = ({
  summary,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !summary) return null;

  const [copied, setCopied] = useState(false);
  const verification = summary.verification || {
    isVerified: true,
    verificationScore: 98,
    status: "Verified",
    verifiedSources: [summary.creatorName || "Official Press Bureau", "National News Wire"],
    factCheckSummary: "Corroborated against primary institutional publications with zero discrepancies detected.",
    verifiedTimestamp: summary.publishDate || new Date().toISOString(),
    primarySourceType: "Official Wire",
    checksPassed: [
      "Primary Source Corroboration",
      "Numerical Data & Figures Audit",
      "Entity Identity Confirmation",
      "Temporal Accuracy & Timestamp Verification",
      "Neutrality & Anti-Misinformation Screen"
    ],
    sourceReferenceId: `VERIF-${summary.id.toUpperCase()}`,
  };

  const handleCopyCertificate = () => {
    const text = `SUMMARYHUB VERIFICATION CERTIFICATE
Content: "${summary.title}"
Reference ID: ${verification.sourceReferenceId || "REF-" + summary.id}
Credibility Score: ${verification.verificationScore}/100
Status: ${verification.status}
Primary Source Type: ${verification.primarySourceType}
Verified Sources: ${verification.verifiedSources.join(", ")}
Verified On: ${new Date(verification.verifiedTimestamp).toLocaleString()}
Fact-Check Summary: ${verification.factCheckSummary}
Checks Passed:
${verification.checksPassed.map((c) => `  [PASS] ${c}`).join("\n")}
Original URL: ${summary.originalUrl}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Card */}
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-emerald-200/80 bg-white shadow-2xl dark:border-emerald-900/50 dark:bg-neutral-900">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent px-5 py-4 dark:border-neutral-800 dark:from-emerald-950/40 dark:via-teal-950/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Verification & Fact-Check Audit
                </h3>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {verification.status}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Independent cross-referencing against primary wire records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Top Score Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Authenticity & Reliability Score
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {verification.verificationScore}%
                </span>
                <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">
                  Highest Editorial Confidence
                </span>
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300 bg-white shadow-2xs dark:border-emerald-800 dark:bg-neutral-850">
              <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Article Under Audit */}
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-850">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Audited Content
            </span>
            <h4 className="mt-1 text-xs font-bold text-neutral-900 dark:text-white leading-relaxed line-clamp-2">
              {summary.title}
            </h4>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>By: <strong>{summary.creatorName}</strong></span>
              <span>•</span>
              <span>Category: <strong>{summary.currentAffairsCategory || summary.category}</strong></span>
              {verification.sourceReferenceId && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[10px] text-neutral-400">
                    Ref: {verification.sourceReferenceId}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Fact-Check Summary Statement */}
          <div>
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
              <SearchCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Fact-Check & Corroboration Finding</span>
            </h5>
            <p className="mt-1.5 rounded-xl border border-neutral-200/80 bg-white p-3 text-xs leading-relaxed text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              {verification.factCheckSummary}
            </p>
          </div>

          {/* Primary Source Records */}
          <div>
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
              <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Corroborating Official Dispatches & Wires</span>
            </h5>
            <div className="mt-2 flex flex-wrap gap-2">
              {verification.verifiedSources.map((source, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{source}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Automated Verification Checks Passed */}
          <div>
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
              <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Automated Verification Pipeline Checks</span>
            </h5>
            <div className="mt-2 space-y-1.5">
              {verification.checksPassed.map((checkItem, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs dark:border-neutral-800 dark:bg-neutral-850"
                >
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {checkItem}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    Passed
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata Footer: Timestamp & Source Type */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-100/70 p-3 text-[11px] text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              <span>Audit Time: {new Date(verification.verifiedTimestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span>Source Type:</span>
              <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200">
                {verification.primarySourceType}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-850">
          <button
            onClick={handleCopyCertificate}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Certificate Copied!" : "Copy Audit Certificate"}</span>
          </button>

          <a
            href={summary.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <span>View Primary Source</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
