import React from "react";
import { 
  Sparkles, 
  Youtube, 
  Twitter, 
  Instagram, 
  Newspaper, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  Briefcase, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Globe,
  BookOpen
} from "lucide-react";

interface LandingViewProps {
  onGetStarted: () => void;
  onExploreFeed: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGetStarted,
  onExploreFeed,
}) => {
  return (
    <div className="mx-auto max-w-6xl space-y-16 pb-20 pt-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-b from-indigo-50/50 via-white to-white p-8 text-center shadow-sm dark:border-neutral-800 dark:from-indigo-950/20 dark:via-neutral-900 dark:to-neutral-900 sm:p-14">
        
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-2xs backdrop-blur-xs dark:border-indigo-900/60 dark:bg-neutral-800/80 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>AI-Powered Content Aggregator • Signal Over Noise</span>
        </div>

        {/* Hero Title */}
        <h1 className="mx-auto mt-6 max-w-4xl text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl sm:leading-tight">
          Stay Informed in Minutes, Not Hours.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-base">
          SummaryHub automatically condenses long YouTube videos, complex X threads, Instagram updates, and world news wires into 4-tier AI summaries, exam notes, and audio briefings.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            id="landing-get-started-btn"
            onClick={onGetStarted}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 active:scale-98"
          >
            <span>Start Reading for Free</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            id="landing-explore-feed-btn"
            onClick={onExploreFeed}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <span>Live Interactive Feed</span>
          </button>
        </div>

        {/* Platform Logos */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            YouTube Videos
          </span>
          <span className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-neutral-900 dark:text-white" />
            X (Twitter) Threads
          </span>
          <span className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-600" />
            Instagram Briefings
          </span>
          <span className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-emerald-600" />
            Verified News Wire
          </span>
        </div>
      </section>

      {/* Target Audiences Grid */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
            Engineered for Fast Learning & High Retention
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Tailored summary depth for every workflow
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Box 1: Exam Aspirants */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 mb-4">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Students & Exam Aspirants
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              UPSC, Banking, State PCS, and University exams. Auto-extracts syllabus connections, names, dates, stats, and provides 3-question retention quizzes.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Current Affairs Dossiers</span>
            </div>
          </div>

          {/* Box 2: Busy Professionals */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 mb-4">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Busy Professionals
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              Skip 40-minute podcast fluff and video sponsors. Get the 3-bullet executive summary and audio narration during commutes or workouts.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Daily 5-Min Morning Digest</span>
            </div>
          </div>

          {/* Box 3: Lifelong Learners */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 sm:col-span-2 lg:col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300 mb-4">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Curious Readers & Researchers
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              Chat directly with any article or video summary. Ask questions like "Explain this simply" or "What are the macroeconomic counter-arguments?".
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Interactive AI Assistant</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Summary Tiers Highlight */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 sm:p-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
            4-Tier Intelligent Architecture
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Read at the exact depth your time permits
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-850">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Tier 1</span>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Quick Summary</h4>
            <p className="text-xs text-neutral-500 mt-1">3–5 bullet points under 60 seconds.</p>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-850">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Tier 2</span>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Easy Summary</h4>
            <p className="text-xs text-neutral-500 mt-1">100–150 words plain language without jargon.</p>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-850">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Tier 3</span>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Detailed Analysis</h4>
            <p className="text-xs text-neutral-500 mt-1">300–500 words for comprehensive mastery.</p>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-850">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Tier 4</span>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Key Facts Extraction</h4>
            <p className="text-xs text-neutral-500 mt-1">Names, dates, statistics, decisions isolated.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
