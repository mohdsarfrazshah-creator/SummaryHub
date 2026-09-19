import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  ArrowRight,
  Check
} from "lucide-react";
import { UserProfile, Language } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [role, setRole] = useState<UserProfile["role"]>(currentUser.role || "student");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...currentUser,
      name: name || "SummaryHub Learner",
      email: email || "user@summaryhub.ai",
      role,
    };
    onLogin(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="text-center">
          <img
            src="/icon.svg"
            alt="SummaryHub Logo"
            className="mx-auto h-12 w-12 rounded-2xl object-contain shadow-sm shadow-indigo-600/30"
          />
          <h2 className="mt-3 text-xl font-bold text-neutral-900 dark:text-white">
            {mode === "signup" ? "Join SummaryHub" : "Welcome Back"}
          </h2>
          <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
            create by Sarfaraz Shah
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {mode === "signup"
              ? "Cut through information overload with personalized AI summaries."
              : "Access your saved summaries, daily streak, and reading library."}
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="mt-6 flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 text-xs font-semibold dark:border-neutral-700 dark:bg-neutral-800">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-1.5 transition ${
              mode === "signup"
                ? "bg-white text-indigo-600 shadow-2xs dark:bg-neutral-900 dark:text-indigo-400 font-bold"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-1.5 transition ${
              mode === "login"
                ? "bg-white text-indigo-600 shadow-2xs dark:bg-neutral-900 dark:text-indigo-400 font-bold"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Full Name
              </label>
              <div className="relative mt-1">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Sharma"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          {/* Role selection for personalized recommendation feed */}
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Primary Goal / Role
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { id: "student", label: "Student", icon: GraduationCap },
                  { id: "professional", label: "Professional", icon: Briefcase },
                  { id: "reader", label: "Reader", icon: BookOpen },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as any)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <span>{mode === "signup" ? "Get Started" : "Sign In to Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
