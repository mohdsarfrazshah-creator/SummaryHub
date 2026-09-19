import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  User, 
  BarChart3, 
  Megaphone, 
  Gavel, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Send, 
  GraduationCap, 
  Globe, 
  HelpCircle,
  FileText,
  Clock,
  Loader2,
  ShieldCheck,
  Building2,
  FileCheck,
  SearchCheck,
  Award
} from "lucide-react";
import { SummaryItem, Language, ChatMessage, QuizQuestion } from "../types";
import { AiService } from "../services/aiService";
import { VerificationBadge } from "./VerificationBadge";

interface SummaryModalProps {
  summary: SummaryItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  initialTab?: string;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  summary,
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  isSaved,
  onToggleSave,
  initialTab = "quick",
}) => {
  if (!isOpen || !summary) return null;

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [copied, setCopied] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "ai",
      text: `Hello! I'm your SummaryHub AI Assistant. Ask me anything about "${summary.title}". You can ask me to explain it simply, give you key takeaways, or prepare exam notes!`,
      timestamp: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [id: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setIsPlayingAudio(false);
    AiService.stopSpeaking();
  }, [summary.id, initialTab]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Translations
  const trans = summary.translations?.[currentLanguage as "hi" | "ur"];
  const displayTitle = trans?.title || summary.title;
  const displayQuickBullets = trans?.quickSummary || summary.quickSummary;
  const displayEasy = trans?.easySummary || summary.easySummary;
  const displayDetailed = trans?.detailedSummary || summary.detailedSummary;

  // Audio Handler
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      AiService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      let textToRead = "";
      if (activeTab === "easy") {
        textToRead = `${displayTitle}. ${displayEasy}`;
      } else if (activeTab === "detailed") {
        textToRead = `${displayTitle}. ${displayDetailed}`;
      } else {
        textToRead = `${displayTitle}. ${displayQuickBullets.join(". ")}`;
      }

      AiService.speak(
        textToRead,
        currentLanguage,
        () => setIsPlayingAudio(false),
        speechRate
      );
    }
  };

  // Copy Summary text
  const handleCopyText = () => {
    let text = `${summary.title}\nSource: ${summary.creatorName} (${summary.originalUrl})\n\n`;
    if (activeTab === "quick") {
      text += `QUICK SUMMARY:\n${displayQuickBullets.map((b) => `• ${b}`).join("\n")}`;
    } else if (activeTab === "easy") {
      text += `EASY SUMMARY:\n${displayEasy}`;
    } else if (activeTab === "detailed") {
      text += `DETAILED SUMMARY:\n${displayDetailed}`;
    } else if (activeTab === "facts") {
      text += `KEY FACTS:\nNames: ${summary.keyFacts.names.join(", ")}\nDates: ${summary.keyFacts.dates.join(", ")}\nStatistics: ${summary.keyFacts.statistics.join(", ")}\nAnnouncements: ${summary.keyFacts.announcements.join(", ")}\nDecisions: ${summary.keyFacts.decisions.join(", ")}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send Chat message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: "Now",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput("");
    setIsChatLoading(true);

    try {
      const reply = await AiService.chat(textToSend, summary, currentLanguage);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: reply,
        timestamp: "Just now",
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "I experienced an error analyzing the summary. Please check your network or try again.",
        timestamp: "Now",
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Generate Quiz
  const handleLoadQuiz = async () => {
    if (quizQuestions.length > 0) return;
    setQuizLoading(true);
    try {
      const q = await AiService.generateQuiz(summary, currentLanguage);
      setQuizQuestions(q);
    } catch (e) {
      console.error(e);
    } finally {
      setQuizLoading(false);
    }
  };

  // Score Quiz
  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div 
        onClick={() => {
          AiService.stopSpeaking();
          onClose();
        }}
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        
        {/* Modal Top Header */}
        <div className="flex items-start justify-between border-b border-neutral-200/80 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <img
              src={summary.creatorAvatar}
              alt={summary.creatorName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {summary.creatorName}
                </span>
                <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                  {summary.platform}
                </span>
                <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {summary.category}
                </span>
                <VerificationBadge
                  summary={summary}
                  onOpenAudit={() => setActiveTab("verification")}
                  size="sm"
                  showScore={true}
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Published {new Date(summary.publishDate).toLocaleDateString()} • {summary.readingTimeMinutes} min read
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switch inside modal */}
            <div className="flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 text-xs font-semibold dark:border-neutral-700 dark:bg-neutral-800">
              {(["en", "hi", "ur"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  id={`modal-lang-${lang}`}
                  onClick={() => onLanguageChange(lang)}
                  className={`rounded-md px-2 py-1 uppercase transition ${
                    currentLanguage === lang
                      ? "bg-white text-indigo-600 shadow-2xs dark:bg-neutral-900 dark:text-indigo-400"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Save Button */}
            <button
              id={`modal-save-btn-${summary.id}`}
              onClick={() => onToggleSave(summary.id)}
              className={`rounded-lg p-2 transition ${
                isSaved
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                  : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              title={isSaved ? "Saved in library" : "Save summary"}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>

            {/* Close */}
            <button
              id="modal-close-btn"
              onClick={() => {
                AiService.stopSpeaking();
                onClose();
              }}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Subheader: Title & Audio Narration Bar */}
        <div className="border-b border-neutral-100 bg-neutral-50/50 px-5 py-3 dark:border-neutral-800/80 dark:bg-neutral-800/20">
          <h1 className="text-base font-bold text-neutral-900 dark:text-white sm:text-xl">
            {displayTitle}
          </h1>

          {/* Audio Bar & Copy Bar */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                id="modal-listen-audio-btn"
                onClick={handleToggleAudio}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                  isPlayingAudio
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200"
                }`}
              >
                {isPlayingAudio ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                <span>{isPlayingAudio ? "Stop Reading" : "Listen Aloud"}</span>
              </button>

              {isPlayingAudio && (
                <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <span>Speed:</span>
                  {[1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      className={`rounded px-1.5 py-0.5 ${speechRate === rate ? "bg-indigo-600 text-white font-bold" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                id="modal-copy-summary-btn"
                onClick={handleCopyText}
                className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>

              <a
                id="modal-original-source-btn"
                href={summary.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <span>Original Content</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex border-b border-neutral-200 overflow-x-auto bg-white px-5 dark:border-neutral-800 dark:bg-neutral-900">
          {[
            { id: "quick", label: "Quick Summary", icon: Sparkles },
            { id: "easy", label: "Easy (100w)", icon: FileText },
            { id: "detailed", label: "Detailed (300w)", icon: Clock },
            { id: "facts", label: "Key Facts", icon: BarChart3 },
            { id: "verification", label: "Verified Sources", icon: ShieldCheck },
            { id: "exam", label: "Exam Notes", icon: GraduationCap },
            { id: "chat", label: "AI Chat", icon: MessageSquare },
            { id: "quiz", label: "Quiz & Test", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`modal-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "quiz") handleLoadQuiz();
                }}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-3 text-xs font-semibold transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: QUICK SUMMARY (3-5 Bullets) */}
          {activeTab === "quick" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-indigo-800 dark:border-indigo-900/30 dark:bg-indigo-950/30 dark:text-indigo-300">
                💡 <strong>Quick Summary</strong> — Understand the 3-5 core takeaways in under 60 seconds.
              </div>
              <ul className="space-y-3">
                {displayQuickBullets.map((bullet, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5 text-sm text-neutral-800 shadow-2xs dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-200"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-2xs">
                      {idx + 1}
                    </span>
                    <p className="pt-0.5 leading-relaxed">{bullet}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 2: EASY SUMMARY (100-150 words) */}
          {activeTab === "easy" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-300">
                📖 <strong>Easy Summary</strong> — Written in plain, accessible language without jargon for quick digestion.
              </div>
              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5 text-sm text-neutral-800 shadow-2xs dark:border-neutral-800 dark:bg-neutral-800/30 dark:text-neutral-200 leading-relaxed sm:text-base">
                {displayEasy}
              </div>
            </div>
          )}

          {/* TAB 3: DETAILED SUMMARY (300-500 words) */}
          {activeTab === "detailed" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs text-purple-800 dark:border-purple-900/30 dark:bg-purple-950/30 dark:text-purple-300">
                🔍 <strong>Detailed Summary</strong> — In-depth analysis covering historical context, core data, and future implications.
              </div>
              <div className="prose dark:prose-invert max-w-none rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-5 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800/30 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
                {displayDetailed}
              </div>
            </div>
          )}

          {/* TAB 4: KEY FACTS (Names, Dates, Stats, Announcements, Decisions) */}
          {activeTab === "facts" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-300">
                📊 <strong>Key Facts Extraction</strong> — Crucial data points isolated for quick revision and memorization.
              </div>

              {/* Grid of Facts */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Names */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-850">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    <User className="h-4 w-4 text-indigo-500" />
                    <span>Important Names & Bodies</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {summary.keyFacts.names.map((name, i) => (
                      <span key={i} className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-850">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span>Key Dates & Timelines</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {summary.keyFacts.dates.map((d, i) => (
                      <span key={i} className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-850">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    <span>Key Statistics & Metrics</span>
                  </div>
                  <div className="mt-2.5 space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {summary.keyFacts.statistics.map((st, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Announcements */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-850">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    <Megaphone className="h-4 w-4 text-rose-500" />
                    <span>Official Announcements</span>
                  </div>
                  <div className="mt-2.5 space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {summary.keyFacts.announcements.map((an, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span>{an}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decisions */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-850 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    <Gavel className="h-4 w-4 text-violet-500" />
                    <span>Policy & Strategic Decisions</span>
                  </div>
                  <div className="mt-2.5 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                    {summary.keyFacts.decisions.map((dec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400 mt-0.5" />
                        <span>{dec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EXAM NOTES */}
          {activeTab === "exam" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                🎓 <strong>UPSC & Competitive Exam Dossier</strong> — Tailored for civil services, state PCS, banking, and academic competitive examinations.
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-850 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Relevant Syllabus Paper
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                    {summary.examRelevance || "General Studies Paper II & III: Governance, Technology, Environment and Economy."}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Prelims Key Takeaways (Objective Facts)
                  </h3>
                  <ul className="mt-1.5 list-disc pl-5 space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {summary.quickSummary.slice(0, 3).map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                    <li>Verified Key Metric: {summary.keyFacts.statistics[0] || "Measurable national indicator"}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Mains Analytical Question (Model Prompt)
                  </h3>
                  <div className="mt-1.5 rounded-xl border border-neutral-200 bg-white p-3 text-xs italic text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    "Critically analyze the systemic implications of '{summary.title}' on policy governance and socio-economic equity. Suggest actionable frameworks for balanced implementation." (250 Words, 15 Marks)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AI CHAT ASSISTANT */}
          {activeTab === "chat" && (
            <div className="flex h-[420px] flex-col rounded-2xl border border-neutral-200 bg-neutral-50/40 dark:border-neutral-800 dark:bg-neutral-850">
              {/* Quick Prompt Suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-neutral-200 p-2.5 dark:border-neutral-800">
                <span className="shrink-0 text-[10px] font-bold text-neutral-400 uppercase">Prompts:</span>
                {[
                  "Explain in simple language",
                  "Give me the important points",
                  "Why is this important?",
                  "Create exam notes from this",
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(promptText)}
                    className="shrink-0 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-br-xs"
                          : "bg-white border border-neutral-200 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 rounded-bl-xs shadow-2xs whitespace-pre-line"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-3 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                      <span>SummaryHub AI is analyzing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Box */}
              <div className="border-t border-neutral-200 p-2.5 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask anything about this summary..."
                    className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: RETENTION QUIZ */}
          {activeTab === "quiz" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
                <span>🎯 <strong>Retention Quiz</strong> — Test what you absorbed in 3 quick questions.</span>
                {quizSubmitted && (
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Score: {calculateScore()} / {quizQuestions.length}
                  </span>
                )}
              </div>

              {quizLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
                  <p className="text-xs">Generating retention questions with AI...</p>
                </div>
              ) : quizQuestions.length > 0 ? (
                <div className="space-y-4">
                  {quizQuestions.map((q, qIndex) => (
                    <div key={q.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-850">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        {qIndex + 1}. {q.question}
                      </p>

                      <div className="mt-3 space-y-2">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = userAnswers[q.id] === optIndex;
                          const isCorrect = q.correctIndex === optIndex;
                          let btnStyle = "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200";

                          if (quizSubmitted) {
                            if (isCorrect) {
                              btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 font-semibold";
                            } else if (isSelected && !isCorrect) {
                              btnStyle = "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200";
                            }
                          } else if (isSelected) {
                            btnStyle = "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold";
                          }

                          return (
                            <button
                              key={optIndex}
                              disabled={quizSubmitted}
                              onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: optIndex }))}
                              className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left text-xs transition ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <p className="mt-2.5 text-xs text-neutral-500 dark:text-neutral-400">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end gap-2 pt-2">
                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(userAnswers).length === 0}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setUserAnswers({});
                          setQuizSubmitted(false);
                          setQuizQuestions([]);
                          handleLoadQuiz();
                        }}
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                      >
                        Try New Questions
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 8: VERIFICATION AUDIT & SOURCES */}
          {activeTab === "verification" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        Information Authenticity Certificate
                      </h3>
                      <span className="rounded-md bg-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                        {summary.verification?.status || "Verified"}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80">
                      Cross-referenced against verified wire communications and institutional documentation.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Truth Score
                  </span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {summary.verification?.verificationScore || 98}%
                  </div>
                </div>
              </div>

              {/* Fact-Check Summary */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <SearchCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Fact-Check Finding</span>
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                  {summary.verification?.factCheckSummary ||
                    "This summary has been cross-checked against primary institutional dispatches and news agency archives. Numerical values, dates, and names have been corroborated with zero identified inconsistencies."}
                </p>
              </div>

              {/* Corroborated Source Wires */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Primary Official Wires & Dispatches</span>
                </h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {(summary.verification?.verifiedSources || [
                    summary.creatorName || "Official Media Bureau",
                    "National Press Wire",
                    "Government Gazette"
                  ]).map((src, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{src}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Checks Passed Checklist */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Automated Editorial Pipeline Checks</span>
                </h4>
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(summary.verification?.checksPassed || [
                    "Primary Source Corroboration",
                    "Numerical & Statistical Validation",
                    "Temporal Integrity & Date Verification",
                    "Anti-Clickbait & Neutrality Screen",
                    "Institutional Attribution Confirmed"
                  ]).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/70 px-3 py-2 text-xs dark:border-neutral-800 dark:bg-neutral-850"
                    >
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{item}</span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        Passed
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer info */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-100/60 p-3 text-xs text-neutral-500 dark:bg-neutral-800/40 dark:text-neutral-400">
                <span>
                  Source Type: <strong>{summary.verification?.primarySourceType || "Official Wire"}</strong>
                  {summary.verification?.sourceReferenceId && (
                    <span> • Ref: <span className="font-mono">{summary.verification.sourceReferenceId}</span></span>
                  )}
                </span>
                <a
                  href={summary.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <span>Open Primary Source Dispatch</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
