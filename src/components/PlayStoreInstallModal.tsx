import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Download,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Play,
  ArrowRight,
  Layers,
  Sparkles,
  Instagram
} from "lucide-react";

interface PlayStoreInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallApp: () => void;
}

export const PlayStoreInstallModal: React.FC<PlayStoreInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallApp,
}) => {
  if (!isOpen) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAsset, setCopiedAsset] = useState(false);
  const [activeTab, setActiveTab] = useState<"instant" | "playstore">("instant");

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://summaryhub.app";
  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`;

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/75 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent px-5 py-4 dark:border-neutral-800 dark:from-indigo-950/40 dark:via-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-600/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Android & Google Play Publishing
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Ready
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                PWA Manifest, Android Icons, and Service Worker configured
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-100 bg-neutral-50/70 px-5 pt-2 dark:border-neutral-800 dark:bg-neutral-850/50">
          <button
            onClick={() => setActiveTab("instant")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition ${
              activeTab === "instant"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>1. Install on Android Now</span>
          </button>
          <button
            onClick={() => setActiveTab("playstore")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition ${
              activeTab === "playstore"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>2. Google Play Store Package (.aab)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === "instant" ? (
            <>
              {/* Native Install Prompt Card */}
              <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                      Install SummaryHub App Directly
                    </h4>
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                      Runs in standalone fullscreen mode without browser navigation bars, with offline caching and instant load times.
                    </p>
                  </div>
                  <img
                    src="/pwa-192x192.png"
                    alt="SummaryHub Icon"
                    className="h-12 w-12 rounded-2xl shadow-md ring-2 ring-indigo-500/20"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    id="trigger-pwa-install-btn"
                    onClick={onInstallApp}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    <span>{deferredPrompt ? "Install App on this Device" : "Install / Add to Home Screen"}</span>
                  </button>

                  <button
                    onClick={handleCopyAppUrl}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? "Link Copied!" : "Copy Mobile URL"}</span>
                  </button>
                </div>
              </div>

              {/* Instructions for Android Users */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  How any Android user can install it immediately:
                </h5>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-850">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                      1
                    </span>
                    <p className="mt-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Open the app URL in <strong>Google Chrome</strong> on Android.
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-850">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                      2
                    </span>
                    <p className="mt-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Tap the <strong>⋮ (three dots)</strong> menu in the top right.
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-850">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                      3
                    </span>
                    <p className="mt-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Play Store Packaging Guide */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                  <h4 className="text-sm font-bold">PWA is 100% Google Play Ready</h4>
                </div>
                <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400/90 leading-relaxed">
                  Your app now includes a compliant <code className="font-mono font-bold">manifest.json</code>, 512x512 maskable icons, and a registered service worker. You can generate the official Google Play <strong>.aab (Android App Bundle)</strong> in 1 click.
                </p>

                <div className="mt-3">
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 transition hover:bg-emerald-700"
                  >
                    <span>Generate .aab with PWABuilder</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* 3 Step Submission Workflow */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Play Store Submission Checklist:
                </h5>

                <div className="space-y-2">
                  <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-850">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                      1
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-neutral-900 dark:text-white">
                        Generate Android App Bundle (.aab)
                      </h6>
                      <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-300">
                        Visit PWABuilder, click <strong>"Package for Store"</strong> → choose <strong>"Google Play (Android)"</strong>. It produces a production-ready signed <code className="font-mono">.aab</code> package.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-850">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                      2
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-neutral-900 dark:text-white">
                        Open Google Play Console
                      </h6>
                      <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-300">
                        Log into <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline dark:text-indigo-400">play.google.com/console</a> with your Google Developer Account ($25 one-time fee) and click <strong>"Create App"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-850">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                      3
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-neutral-900 dark:text-white">
                        Upload .aab & Publish
                      </h6>
                      <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-300">
                        Upload the generated <code className="font-mono">.aab</code> file in the Production or Internal Testing track, complete the short store questionnaire, and submit for Google review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Active PWA Specs Card */}
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-400">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>PWA Manifest: <code className="font-mono">/manifest.json</code></span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Service Worker: <code className="font-mono">/sw.js</code></span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Play Store Icons: 192x192 & 512x512 maskable</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-850">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              Close
            </button>
            <a
              href="https://www.instagram.com/horizonseer._?stkn=amlld3BudWdwa2l0"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
            >
              <Instagram className="h-3.5 w-3.5" />
              <span>Support / Report</span>
            </a>
          </div>

          <a
            href={pwaBuilderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <span>Launch PWABuilder</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
