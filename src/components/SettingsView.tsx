import React, { useState } from "react";
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  Sliders, 
  Check, 
  Save, 
  RefreshCw, 
  Database, 
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { UserProfile, Language } from "../types";

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenPlayStoreModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  currentLanguage,
  onLanguageChange,
  theme,
  onToggleTheme,
  onOpenPlayStoreModal,
}) => {
  const [preferredLength, setPreferredLength] = useState(user.preferences.preferredLength);
  const [readingGoal, setReadingGoal] = useState(user.preferences.dailyReadingGoal);
  const [dailyDigestNotif, setDailyDigestNotif] = useState(user.preferences.notifications.dailyDigest);
  const [breakingNewsNotif, setBreakingNewsNotif] = useState(user.preferences.notifications.breakingNews);
  const [examReminders, setExamReminders] = useState(user.preferences.notifications.examReminders);
  const [newContentAlert, setNewContentAlert] = useState(user.preferences.notifications.creatorPublish);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      preferences: {
        ...user.preferences,
        language: currentLanguage,
        preferredLength,
        dailyReadingGoal: readingGoal,
        notifications: {
          dailyDigest: dailyDigestNotif,
          breakingNews: breakingNewsNotif,
          examReminders,
          creatorPublish: newContentAlert,
        },
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
          Customize your AI summary formats, notification alerts, and content languages.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Summary Delivery & Language */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <Globe className="h-4 w-4 text-indigo-500" />
            <span>Language & Summary Format</span>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Default Summary Language
            </label>
            <p className="text-[11px] text-neutral-500 mb-2">
              Summaries, chats, and audio will generate in this target language by default.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { code: "en", name: "English" },
                { code: "hi", name: "Hindi (हिन्दी)" },
                { code: "ur", name: "Urdu (اردو)" },
              ].map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => onLanguageChange(l.code as Language)}
                  className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${
                    currentLanguage === l.code
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-2xs"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{l.name}</span>
                    {currentLanguage === l.code && <Check className="h-4 w-4" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Length */}
          <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Default Open Tab / Summary Depth
            </label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {[
                { id: "quick", label: "Quick", desc: "3-5 key bullets" },
                { id: "easy", label: "Easy", desc: "100-150 words" },
                { id: "detailed", label: "Detailed", desc: "300-500 words" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPreferredLength(opt.id as any)}
                  className={`rounded-xl border p-3 text-left transition ${
                    preferredLength === opt.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className="text-[11px] text-neutral-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Reading Goal */}
          <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Daily Reading Goal
            </label>
            <div className="mt-2 flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="25"
                step="1"
                value={readingGoal}
                onChange={(e) => setReadingGoal(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-900 dark:bg-neutral-800 dark:text-white">
                {readingGoal} summaries/day
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Notifications */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <Bell className="h-4 w-4 text-amber-500" />
            <span>Notification & Digest Alerts</span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "digest",
                title: "Daily Digest Briefing",
                desc: "Receive 5-minute morning roundup of yesterday's top stories.",
                checked: dailyDigestNotif,
                setter: setDailyDigestNotif,
              },
              {
                id: "breaking",
                title: "Urgent Breaking News",
                desc: "Immediate alerts for major national or global policy decisions.",
                checked: breakingNewsNotif,
                setter: setBreakingNewsNotif,
              },
              {
                id: "exam",
                title: "Current Affairs Revision Reminder",
                desc: "Evening test and revision prompt for exam candidates.",
                checked: examReminders,
                setter: setExamReminders,
              },
              {
                id: "creator",
                title: "Creator Publishing Alerts",
                desc: "Instant notification when followed accounts release new videos or posts.",
                checked: newContentAlert,
                setter: setNewContentAlert,
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-neutral-100 p-3 dark:border-neutral-800"
              >
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">{item.title}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Appearance & Storage */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">Appearance Theme</p>
              <p className="text-[11px] text-neutral-500">Currently using {theme} mode.</p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
              <span>Switch to {theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>

          <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">Database & Persistence</p>
                <p className="text-[11px] text-neutral-500">Local Cache + Ready for Supabase Cloud Database</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Connected
            </span>
          </div>

          {/* Android & Google Play Publishing Status */}
          <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">Android & Google Play Store</p>
                <p className="text-[11px] text-neutral-500">PWA Manifest, Service Worker & Maskable Icons configured</p>
              </div>
            </div>
            {onOpenPlayStoreModal && (
              <button
                type="button"
                id="settings-playstore-open-btn"
                onClick={onOpenPlayStoreModal}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
              >
                Package / Install
              </button>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              Settings updated successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            id="save-settings-btn"
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
