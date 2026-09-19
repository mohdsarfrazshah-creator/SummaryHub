import React from "react";
import { 
  Flame, 
  Clock, 
  Bookmark, 
  Users, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Award,
  ArrowUpRight,
  BookOpen
} from "lucide-react";
import { UserProfile, SummaryItem, Creator } from "../types";

interface DashboardViewProps {
  user: UserProfile;
  summaries: SummaryItem[];
  savedCount: number;
  creators: Creator[];
  onNavigate: (view: string) => void;
  onOpenSummary: (summary: SummaryItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  summaries,
  savedCount,
  creators,
  onNavigate,
  onOpenSummary,
}) => {
  const followedCreators = creators.filter((c) => c.isFollowed);
  const readSummaries = summaries.filter((s) => s.isRead);

  // Activity days mockup for visual habit tracker
  const streakDays = [
    { day: "Mon", active: true },
    { day: "Tue", active: true },
    { day: "Wed", active: true },
    { day: "Thu", active: true },
    { day: "Fri", active: true },
    { day: "Sat", active: true },
    { day: "Sun", active: true },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* User Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
                  {user.name}
                </h1>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 capitalize">
                  {user.role} member
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {user.email} • Learning Member since {new Date(user.joinedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="dashboard-settings-btn"
              onClick={() => onNavigate("settings")}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              Account Settings
            </button>
            <button
              id="dashboard-explore-btn"
              onClick={() => onNavigate("explore")}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
            >
              Explore Channels
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Streak */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Daily Reading Streak</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/50">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-white">
            {user.readingStreakDays} Days
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            <span>Streak goal: 14 days</span>
            <span>85% completed</span>
          </div>
        </div>

        {/* Metric 2: Time Saved */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Time Saved</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/50">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ~{user.hoursSavedEstimated} Hours
          </p>
          <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
            Compared to full-length videos & long threads
          </p>
        </div>

        {/* Metric 3: Summaries Read */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Summaries Consumed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/50">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-white">
            {user.summariesReadCount} Read
          </p>
          <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
            Across 7 categories this month
          </p>
        </div>

        {/* Metric 4: Following */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Channels Followed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-500 dark:bg-purple-950/50">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-white">
            {followedCreators.length} Channels
          </p>
          <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
            {savedCount} bookmarks stored
          </p>
        </div>
      </div>

      {/* Habit Streak Calendar & Reading Target Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Weekly Reading Habit Bar */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Weekly Reading Activity
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Consistency builds exponential retention for exam preparation and professional acumen.
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Active Streak
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between gap-2">
            {streakDays.map((st, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/30">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{st.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-850">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <span>Weekly Target: 30 Summaries</span>
              <span className="text-indigo-600 dark:text-indigo-400">24/30 (80%)</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: "80%" }} />
            </div>
          </div>
        </div>

        {/* Right: Followed Channels Quick List */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Following
            </h2>
            <button
              onClick={() => onNavigate("explore")}
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View All
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {followedCreators.slice(0, 5).map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between rounded-xl border border-neutral-100 p-2.5 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-neutral-900 dark:text-white">
                      {creator.name}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {creator.platform} • {creator.category}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-neutral-400">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
