import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Key, 
  UserCheck, 
  ArrowRightLeft, 
  Clock, 
  History, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Copy, 
  RefreshCw, 
  Lock, 
  ExternalLink,
  ChevronRight,
  LogOut,
  Send,
  FileText,
  BadgeAlert,
  Globe2,
  Check
} from "lucide-react";
import { 
  OwnershipDashboardData, 
  OwnershipStatePublic, 
  PendingTransfer, 
  SimulatedEmail 
} from "../types/ownership";
import { OwnershipService } from "../services/ownershipService";
import { BRAND } from "../config/brand";
import { GlobeSymbol } from "./BrandLogo";

interface OwnerDashboardViewProps {
  onBackToFeed: () => void;
  initialToken?: string;
  onOpenFreshnessMonitor?: () => void;
}

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  onBackToFeed,
  initialToken,
  onOpenFreshnessMonitor,
}) => {
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [revokedMessage, setRevokedMessage] = useState<string | null>(null);

  // Core Data
  const [publicStatus, setPublicStatus] = useState<OwnershipStatePublic | null>(null);
  const [dashboardData, setDashboardData] = useState<OwnershipDashboardData | null>(null);

  // Active Tab: overview | transfer | pending | audit | outbox | buyerAccept
  const [activeTab, setActiveTab] = useState<"overview" | "transfer" | "pending" | "audit" | "outbox" | "buyerAccept">("overview");

  // Claim State (when unclaimed)
  const [claimEmail, setClaimEmail] = useState("");
  const [claimName, setClaimName] = useState("Sarfaraz Shah");
  const [claimCode, setClaimCode] = useState("");
  const [claimStep, setClaimStep] = useState<"enter_email" | "enter_code">("enter_email");
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);

  // Login State (when claimed but logged out)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginStep, setLoginStep] = useState<"enter_email" | "enter_code">("enter_email");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Transfer Initiation State
  const [buyerEmailInput, setBuyerEmailInput] = useState("");
  const [transferNoteInput, setTransferNoteInput] = useState("");
  const [isTransferSubmitting, setIsTransferSubmitting] = useState(false);

  // Seller Final Confirmation State
  const [sellerConfirmationCode, setSellerConfirmationCode] = useState("");
  const [sellerAcknowledgedRevocation, setSellerAcknowledgedRevocation] = useState(false);
  const [isConfirmingFinalTransfer, setIsConfirmingFinalTransfer] = useState(false);

  // Buyer Acceptance State (for recipient)
  const [buyerAcceptCode, setBuyerAcceptCode] = useState(initialToken || "");
  const [buyerAcceptEmail, setBuyerAcceptEmail] = useState("");
  const [buyerAcceptName, setBuyerAcceptName] = useState("");
  const [buyerAcknowledgedTerms, setBuyerAcknowledgedTerms] = useState(false);
  const [isBuyerSubmitting, setIsBuyerSubmitting] = useState(false);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadData = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const pub = await OwnershipService.getPublicStatus();
      setPublicStatus(pub);

      if (pub.isCurrentOwner || OwnershipService.getToken()) {
        try {
          const dash = await OwnershipService.getDashboard();
          setDashboardData(dash);
        } catch (dashErr: any) {
          if (dashErr.message && dashErr.message.includes("REVOKED")) {
            setRevokedMessage(dashErr.message);
          }
          setDashboardData(null);
        }
      } else {
        setDashboardData(null);
      }
    } catch (err: any) {
      console.warn("Ownership load error:", err);
      setErrorNotice(err.message || "Failed to load ownership status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (initialToken) {
      setActiveTab("buyerAccept");
      setBuyerAcceptCode(initialToken);
    }
  }, [initialToken]);

  // Handler: Request Initial Claim Code
  const handleRequestClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimEmail || !claimEmail.includes("@")) {
      setErrorNotice("Please enter a valid email address.");
      return;
    }
    setIsClaimSubmitting(true);
    setErrorNotice(null);
    try {
      const res = await OwnershipService.requestInitialClaim(claimEmail, claimName);
      setSuccessNotice(`Verification passcode sent to ${claimEmail}. Enter the code below.`);
      setClaimStep("enter_code");
      if (res.simulatedCode) {
        setClaimCode(res.simulatedCode);
      }
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to initiate claim.");
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  // Handler: Verify Initial Claim
  const handleVerifyClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCode || claimCode.trim().length !== 6) {
      setErrorNotice("Please enter the 6-digit verification code.");
      return;
    }
    setIsClaimSubmitting(true);
    setErrorNotice(null);
    try {
      await OwnershipService.verifyInitialClaim(claimEmail, claimCode, claimName);
      setSuccessNotice("Congratulations! You are now authenticated as the primary Super Owner of The World Ledger.");
      await loadData();
      setActiveTab("overview");
    } catch (err: any) {
      setErrorNotice(err.message || "Claim verification failed.");
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  // Handler: Request Owner Login
  const handleRequestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setErrorNotice("Enter the registered owner email.");
      return;
    }
    setIsLoginSubmitting(true);
    setErrorNotice(null);
    try {
      const res = await OwnershipService.requestOwnerLogin(loginEmail);
      setSuccessNotice(`Security passcode dispatched to ${loginEmail}.`);
      setLoginStep("enter_code");
      if (res.simulatedCode) {
        setLoginCode(res.simulatedCode);
      }
    } catch (err: any) {
      setErrorNotice(err.message || "Login request failed.");
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  // Handler: Verify Owner Login
  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCode || loginCode.trim().length !== 6) {
      setErrorNotice("Enter the 6-digit security passcode.");
      return;
    }
    setIsLoginSubmitting(true);
    setErrorNotice(null);
    try {
      await OwnershipService.verifyOwnerLogin(loginEmail, loginCode);
      setSuccessNotice("Welcome back, Super Owner.");
      await loadData();
      setActiveTab("overview");
    } catch (err: any) {
      setErrorNotice(err.message || "Owner verification failed.");
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  // Handler: Initiate Transfer to Buyer
  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmailInput || !buyerEmailInput.includes("@")) {
      setErrorNotice("Please provide a valid buyer email address.");
      return;
    }
    setIsTransferSubmitting(true);
    setErrorNotice(null);
    try {
      const res = await OwnershipService.initiateTransfer(buyerEmailInput, transferNoteInput);
      setSuccessNotice(`Transfer invitation issued to ${buyerEmailInput}. Awaiting buyer approval.`);
      setBuyerEmailInput("");
      setTransferNoteInput("");
      await loadData();
      setActiveTab("pending");
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to initiate transfer.");
    } finally {
      setIsTransferSubmitting(false);
    }
  };

  // Handler: Buyer Accepts Transfer
  const handleBuyerAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerAcceptEmail || !buyerAcceptCode) {
      setErrorNotice("Please provide your email and the 6-digit invitation passcode.");
      return;
    }
    if (!buyerAcknowledgedTerms) {
      setErrorNotice("You must explicitly acknowledge and accept sole ownership terms.");
      return;
    }
    setIsBuyerSubmitting(true);
    setErrorNotice(null);
    try {
      const res = await OwnershipService.buyerAcceptTransfer(buyerAcceptEmail, buyerAcceptCode, buyerAcceptName);
      setSuccessNotice("Transfer terms explicitly accepted! Current owner has been notified to execute the final security authorization.");
      if (res.sellerFinalCode) {
        setSellerConfirmationCode(res.sellerFinalCode);
      }
      await loadData();
      setActiveTab("pending");
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to accept transfer.");
    } finally {
      setIsBuyerSubmitting(false);
    }
  };

  // Handler: Seller Confirms Final Transfer (Atomic)
  const handleSellerConfirmFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerConfirmationCode || sellerConfirmationCode.trim().length !== 6) {
      setErrorNotice("Enter the 6-digit final confirmation passcode sent to your email.");
      return;
    }
    if (!sellerAcknowledgedRevocation) {
      setErrorNotice("You must acknowledge that your owner authority will be permanently revoked immediately.");
      return;
    }
    setIsConfirmingFinalTransfer(true);
    setErrorNotice(null);
    try {
      const res = await OwnershipService.sellerConfirmTransfer(sellerConfirmationCode);
      setRevokedMessage(`Transfer finalized. Website ownership transferred to ${res.newOwnerEmail}. Your administrative sessions and privileges have been permanently terminated.`);
      setDashboardData(null);
      await loadData();
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to confirm final transfer.");
    } finally {
      setIsConfirmingFinalTransfer(false);
    }
  };

  // Handler: Cancel Transfer
  const handleCancelTransfer = async () => {
    if (!window.confirm("Are you sure you want to cancel the pending website transfer?")) {
      return;
    }
    try {
      await OwnershipService.cancelTransfer("Cancelled by owner");
      setSuccessNotice("Pending transfer cancelled successfully.");
      await loadData();
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to cancel transfer.");
    }
  };

  // Handler: Owner Logout
  const handleLogout = async () => {
    await OwnershipService.logout();
    setDashboardData(null);
    setSuccessNotice("Logged out of Owner Portal.");
    await loadData();
  };

  const isOwnerAuthenticated = Boolean(dashboardData?.currentOwner);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20 pt-4">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <button
          onClick={onBackToFeed}
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition"
        >
          <span>← Back to Publication Feed</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-serif-title uppercase tracking-widest text-[11px] text-amber-700 dark:text-amber-400 font-bold">
            Title & Governance
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="text-neutral-500 dark:text-neutral-400 font-serif-title italic">
            {BRAND.mottoLatin}
          </span>
        </div>
      </div>

      {/* Revocation Warning Banner (If Old Owner Transferred) */}
      {revokedMessage && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 shadow-md">
          <div className="flex items-start gap-3">
            <BadgeAlert className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif-masthead text-base font-bold uppercase tracking-wide text-rose-900 dark:text-rose-100">
                Administrative Authority Terminated
              </h3>
              <p className="mt-1 text-sm font-serif-title leading-relaxed">
                {revokedMessage}
              </p>
              <p className="mt-2 text-xs text-rose-700 dark:text-rose-300 font-medium">
                In accordance with the one-website one-owner principle, you have no unilateral authority to reverse this transaction or access private owner settings. You may continue browsing public dispatches.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {errorNotice && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="p-1 text-rose-500 hover:text-rose-800">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="p-1 text-emerald-500 hover:text-emerald-800">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Masthead Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-stone-100/70 via-white to-stone-50 p-6 sm:p-10 shadow-sm dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <GlobeSymbol className="h-14 w-14 sm:h-16 sm:w-16 shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-serif-masthead text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold">
                  The World Ledger
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                  {publicStatus?.isClaimed ? "Verified Title Registry" : "Ownership Initialization"}
                </span>
              </div>

              <h1 className="mt-1 font-serif-masthead text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-950 dark:text-stone-100">
                Website Ownership & Title Governance
              </h1>

              <p className="mt-1.5 max-w-2xl font-serif-title text-sm text-neutral-600 dark:text-neutral-300">
                Authoritative protocol for website ownership verification, cryptographic title security, and irrevocable bilateral transfer of publisher authority.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
            {publicStatus?.isClaimed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                <span>Title Established</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Title Unclaimed</span>
              </span>
            )}

            {isOwnerAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-serif-title">
                  Signed in as <strong className="text-neutral-900 dark:text-white">{dashboardData?.currentOwner.email}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title="Sign out of Owner Portal"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STATE 1: UNCLAIMED — SECURE "MAKE ME OWNER" PROCESS */}
      {!publicStatus?.isClaimed && (
        <section className="rounded-3xl border border-amber-200/80 bg-white p-6 sm:p-10 shadow-lg dark:border-amber-900/40 dark:bg-neutral-900">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 mb-4">
              <Key className="h-6 w-6" />
            </div>

            <h2 className="font-serif-masthead text-2xl font-bold uppercase tracking-tight text-neutral-950 dark:text-stone-100">
              Establish Initial Super Owner
            </h2>

            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 font-serif-title">
              Claim foundational ownership of The World Ledger using your verified email address. This setup process generates a single-use server verification code.
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 text-left font-serif-title">
              <strong>Security Protocol Notice:</strong> Once ownership is established and confirmed, this public setup channel will be <strong>permanently closed</strong>. All future ownership changes must follow the authorized bilateral transfer workflow.
            </div>

            {claimStep === "enter_email" ? (
              <form onSubmit={handleRequestClaim} className="mt-6 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                    Owner Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={claimName}
                    onChange={(e) => setClaimName(e.target.value)}
                    placeholder="e.g. Sarfaraz Shah"
                    className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                    Owner Email Address (For Verification)
                  </label>
                  <input
                    type="email"
                    required
                    value={claimEmail}
                    onChange={(e) => setClaimEmail(e.target.value)}
                    placeholder="e.g. mohdsarfrazshah@gmail.com"
                    className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-neutral-500">
                    A single-use 6-digit cryptographic verification passcode will be dispatched to this address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isClaimSubmitting}
                  className="w-full rounded-xl bg-amber-600 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-amber-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isClaimSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Dispatching Passcode...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Verification Passcode</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyClaim} className="mt-6 space-y-4 text-left">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                      Enter 6-Digit Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => setClaimStep("enter_email")}
                      className="text-xs text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="mt-1 w-full tracking-[0.4em] text-center font-mono text-2xl font-bold rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-3 text-neutral-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Dispatched to <strong>{claimEmail}</strong>. (Also inspectable in the Security Outbox tab below).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isClaimSubmitting || claimCode.length !== 6}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isClaimSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying & Activating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Activate & Confirm Website Ownership</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* STATE 2: CLAIMED BUT NOT AUTHENTICATED AS OWNER */}
      {publicStatus?.isClaimed && !isOwnerAuthenticated && (
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 mb-4">
              <Lock className="h-6 w-6" />
            </div>

            <h2 className="font-serif-masthead text-xl font-bold uppercase tracking-tight text-neutral-950 dark:text-stone-100">
              Owner Authentication Required
            </h2>

            <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-serif-title">
              This publication already has a verified Super Owner (Registered: <strong>{publicStatus.ownerEmailMasked}</strong>). Sign in with the verified email to manage title or initiate an ownership transfer.
            </p>

            {loginStep === "enter_email" ? (
              <form onSubmit={handleRequestLogin} className="mt-6 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                    Owner Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. mohdsarfrazshah@gmail.com"
                    className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoginSubmitting}
                  className="w-full rounded-xl bg-neutral-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoginSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sending Security Code...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send 2FA Security Passcode</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyLogin} className="mt-6 space-y-4 text-left">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                      Enter 6-Digit Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => setLoginStep("enter_email")}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Change Email
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="mt-1 w-full tracking-[0.4em] text-center font-mono text-2xl font-bold rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-3 text-neutral-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoginSubmitting || loginCode.length !== 6}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoginSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Authenticate Owner Session</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Link to Buyer Acceptance View */}
            <div className="mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <button
                onClick={() => setActiveTab("buyerAccept")}
                className="text-xs text-amber-700 hover:text-amber-800 dark:text-amber-400 font-semibold"
              >
                Received a transfer invitation? Click here to review & accept →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STATE 3: AUTHENTICATED OWNER DASHBOARD OR BUYER ACCEPTANCE */}
      {(isOwnerAuthenticated || activeTab === "buyerAccept") && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-neutral-200 pb-2 dark:border-neutral-800">
            {isOwnerAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "overview"
                      ? "bg-neutral-900 text-white dark:bg-stone-100 dark:text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Title & Governance</span>
                </button>

                <button
                  onClick={() => setActiveTab("transfer")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "transfer"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>Transfer Ownership</span>
                </button>

                <button
                  onClick={() => setActiveTab("pending")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "pending"
                      ? "bg-neutral-900 text-white dark:bg-stone-100 dark:text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Pending Transfers</span>
                  {dashboardData?.pendingTransfer && (
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("audit")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "audit"
                      ? "bg-neutral-900 text-white dark:bg-stone-100 dark:text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Audit Logs</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab("buyerAccept")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "buyerAccept"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>Buyer Acceptance Flow</span>
            </button>

            <button
              onClick={() => setActiveTab("outbox")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "outbox"
                  ? "bg-neutral-900 text-white dark:bg-stone-100 dark:text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Security Outbox</span>
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                {dashboardData?.recentEmails.length || 0}
              </span>
            </button>
          </div>

          {/* TAB 1: TITLE & GOVERNANCE OVERVIEW */}
          {activeTab === "overview" && dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Owner Certificate Card */}
              <div className="md:col-span-2 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-serif-masthead text-lg font-bold uppercase tracking-tight text-neutral-950 dark:text-stone-100">
                        Sole Primary Title Certificate
                      </h3>
                      <p className="text-xs text-neutral-500 font-serif-title">
                        Registration ID: {dashboardData.currentOwner.userId.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Active & Authenticated
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
                    <span className="font-bold uppercase tracking-wider text-neutral-400">Owner Name</span>
                    <p className="mt-1 font-serif-masthead text-base font-bold text-neutral-900 dark:text-white">
                      {dashboardData.currentOwner.name}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
                    <span className="font-bold uppercase tracking-wider text-neutral-400">Verified Email</span>
                    <p className="mt-1 font-mono text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {dashboardData.currentOwner.email}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
                    <span className="font-bold uppercase tracking-wider text-neutral-400">Role Authority</span>
                    <p className="mt-1 font-serif-masthead text-sm font-bold text-amber-700 dark:text-amber-400 uppercase">
                      Super Owner · Sovereign Administrator
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
                    <span className="font-bold uppercase tracking-wider text-neutral-400">Title Established Date</span>
                    <p className="mt-1 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                      {new Date(dashboardData.currentOwner.claimedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200/80 bg-stone-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 text-xs font-serif-title leading-relaxed text-neutral-600 dark:text-neutral-300">
                  <p>
                    <strong>Constitutional Title Principle:</strong> Exactly one owner has executive authority over The World Ledger at any moment. All publishing endpoints, source aggregations, administrative roles, and future title transfers require signed cryptographic session tokens tied directly to this verified email.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("transfer")}
                    className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-amber-700 transition"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>Transfer Website Ownership</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("audit")}
                    className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition"
                  >
                    <History className="h-4 w-4" />
                    <span>View Audit Records</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Publication & Security Health */}
              <div className="space-y-6">
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm space-y-4">
                  <h4 className="font-serif-masthead text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Security Architecture
                  </h4>

                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                      <span className="text-neutral-600 dark:text-neutral-400">Public Claim Channel</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">Permanently Locked</span>
                    </li>
                    <li className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                      <span className="text-neutral-600 dark:text-neutral-400">Multi-Factor Protocol</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Enforced (OTP)</span>
                    </li>
                    <li className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                      <span className="text-neutral-600 dark:text-neutral-400">Transfer Handshake</span>
                      <span className="font-bold text-neutral-900 dark:text-white">Bilateral 3-Step</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Atomic Execution</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified</span>
                    </li>
                  </ul>
                </div>

                {/* News Pipeline & Ingestion Health Card */}
                <div className="rounded-3xl border border-sky-200/80 bg-sky-50/50 p-6 dark:border-sky-900/60 dark:bg-sky-950/20 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-masthead text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                      News Ingestion Pipeline
                    </h4>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Live multi-feed aggregator operating across 18 verified sources with UTC date normalization and millisecond-precision freshness tracking.
                  </p>
                  {onOpenFreshnessMonitor && (
                    <button
                      type="button"
                      onClick={onOpenFreshnessMonitor}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-sky-700 transition active:scale-95"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Open Ingestion & Health Monitor</span>
                    </button>
                  )}
                </div>

                {/* Transfer History Snippet */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm space-y-3">
                  <h4 className="font-serif-masthead text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Transfer History ({dashboardData.transferHistory.length})
                  </h4>

                  {dashboardData.transferHistory.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-serif-title italic">
                      No previous ownership transfers executed. Initial super owner remains in authority.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {dashboardData.transferHistory.map((h) => (
                        <li key={h.id} className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-850">
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {h.sellerEmail} → {h.buyerEmail}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {new Date(h.completedAt).toLocaleDateString()} · {h.transferId}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSFER WEBSITE OWNERSHIP (WIZARD) */}
          {activeTab === "transfer" && dashboardData && (
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 max-w-2xl mx-auto space-y-6">
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <span className="font-serif-masthead text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Bilateral Handshake
                </span>
                <h3 className="font-serif-masthead text-xl font-bold uppercase tracking-tight text-neutral-950 dark:text-stone-100 mt-1">
                  Transfer Website Ownership
                </h3>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300 font-serif-title">
                  Transfer full publication title, database authority, and administrative rights to a new designated owner via email verification.
                </p>
              </div>

              {/* 3-Step Protocol Visualizer */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs border border-neutral-200 rounded-2xl p-3 bg-stone-50 dark:border-neutral-800 dark:bg-neutral-850">
                <div className="space-y-1">
                  <span className="inline-block h-6 w-6 rounded-full bg-amber-600 text-white font-bold leading-6">1</span>
                  <p className="font-bold text-neutral-900 dark:text-white">Seller Initiates</p>
                  <p className="text-[10px] text-neutral-500">Provide buyer email & terms</p>
                </div>
                <div className="space-y-1">
                  <span className="inline-block h-6 w-6 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 font-bold leading-6">2</span>
                  <p className="font-bold text-neutral-900 dark:text-white">Buyer Accepts</p>
                  <p className="text-[10px] text-neutral-500">Buyer verifies & approves terms</p>
                </div>
                <div className="space-y-1">
                  <span className="inline-block h-6 w-6 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300 font-bold leading-6">3</span>
                  <p className="font-bold text-neutral-900 dark:text-white">Atomic Finalize</p>
                  <p className="text-[10px] text-neutral-500">Seller 2FA & instant revocation</p>
                </div>
              </div>

              {/* Irreversible Authority Warning */}
              <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 text-xs text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 font-serif-title space-y-1">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-900 dark:text-rose-100">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Important Legal & Architectural Notice</span>
                </div>
                <p>
                  Entering an email address alone will <strong>never</strong> transfer ownership automatically. The recipient must authenticate and explicitly accept the invitation. Following their acceptance, you will be required to provide a final security confirmation passcode.
                </p>
                <p className="font-bold pt-1">
                  Upon completion, your owner access will be immediately and irreversibly terminated.
                </p>
              </div>

              {/* Initiation Form */}
              <form onSubmit={handleInitiateTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                    Current Verified Owner (Seller)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={dashboardData.currentOwner.email}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3.5 py-2.5 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                    Recipient / Buyer Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmailInput}
                    onChange={(e) => setBuyerEmailInput(e.target.value)}
                    placeholder="e.g. newowner@worldledger.news"
                    className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-neutral-500">
                    A secure, single-use 48-hour invitation with passcode will be dispatched to this email address.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                    Transfer Note or Transaction Reference (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={transferNoteInput}
                    onChange={(e) => setTransferNoteInput(e.target.value)}
                    placeholder="e.g. Authorized transfer of publication title and digital properties as per agreement."
                    className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isTransferSubmitting}
                  className="w-full rounded-xl bg-amber-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-amber-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isTransferSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating Secure Invitation...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Issue Transfer Invitation (Step 1)</span>
                    </>
                  )}
                </button>
              </form>
            </section>
          )}

          {/* TAB 3: PENDING TRANSFERS & FINAL CONFIRMATION */}
          {activeTab === "pending" && dashboardData && (
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 max-w-2xl mx-auto space-y-6">
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
                <h3 className="font-serif-masthead text-xl font-bold uppercase tracking-tight text-neutral-950 dark:text-stone-100">
                  Active Ownership Transfer Status
                </h3>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300 font-serif-title">
                  Monitor the bilateral state of pending transfer requests.
                </p>
              </div>

              {!dashboardData.pendingTransfer ? (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                    <Check className="h-6 w-6" />
                  </div>
                  <p className="font-serif-title text-sm text-neutral-600 dark:text-neutral-400">
                    No ownership transfer is currently in progress. Your title is fully secure.
                  </p>
                  <button
                    onClick={() => setActiveTab("transfer")}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>Initiate a Transfer</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Indicator Card */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-950/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-serif-masthead text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                        Transfer ID: {dashboardData.pendingTransfer.transferId}
                      </span>
                      <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 capitalize">
                        {dashboardData.pendingTransfer.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-neutral-500">Current Owner (Seller):</span>
                        <p className="font-mono font-semibold text-neutral-900 dark:text-white truncate">
                          {dashboardData.pendingTransfer.sellerEmail}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500">Designated Buyer:</span>
                        <p className="font-mono font-semibold text-neutral-900 dark:text-white truncate">
                          {dashboardData.pendingTransfer.buyerEmail}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs pt-1 flex items-center justify-between border-t border-amber-200/60 dark:border-amber-900/40">
                      <span className="text-neutral-500">Expires At:</span>
                      <span className="font-mono text-neutral-800 dark:text-neutral-200">
                        {new Date(dashboardData.pendingTransfer.expiresAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Quick Access Credentials for Testing/Inspection */}
                    <div className="rounded-xl border border-amber-300/80 bg-white p-3 text-xs dark:bg-neutral-900 dark:border-neutral-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-800 dark:text-amber-300">Buyer 6-Digit Passcode:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-base text-neutral-900 dark:text-white">
                          <span>{dashboardData.pendingTransfer.buyerVerificationCode}</span>
                          <button
                            onClick={() => handleCopy(dashboardData.pendingTransfer!.buyerVerificationCode, "code")}
                            className="p-1 text-neutral-400 hover:text-neutral-700"
                            title="Copy Code"
                          >
                            {copiedKey === "code" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PHASE 3: FINAL SELLER CONFIRMATION FORM */}
                  {dashboardData.pendingTransfer.status === "pending_seller_final_confirmation" && (
                    <div className="rounded-2xl border-2 border-rose-400 bg-white p-6 shadow-md dark:border-rose-900 dark:bg-neutral-900 space-y-4">
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                        <AlertTriangle className="h-5 w-5" />
                        <h4 className="font-serif-masthead text-sm font-bold uppercase">
                          Final Security Confirmation Required
                        </h4>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 font-serif-title leading-relaxed">
                        Buyer <strong>{dashboardData.pendingTransfer.buyerEmail}</strong> has explicitly authenticated and accepted the transfer terms. To complete the irreversible handover of The World Ledger, enter your 6-digit confirmation passcode.
                      </p>

                      <form onSubmit={handleSellerConfirmFinal} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                            Enter Seller Final Confirmation Passcode
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={sellerConfirmationCode}
                            onChange={(e) => setSellerConfirmationCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="6-digit code"
                            className="mt-1 w-full text-center tracking-[0.4em] font-mono text-xl font-bold rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-neutral-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          />
                          <p className="mt-1 text-[11px] text-neutral-500">
                            Dispatched to <strong>{dashboardData.currentOwner.email}</strong>. (Inspectable in Security Outbox).
                          </p>
                        </div>

                        <label className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={sellerAcknowledgedRevocation}
                            onChange={(e) => setSellerAcknowledgedRevocation(e.target.checked)}
                            className="mt-0.5 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
                          />
                          <span className="font-serif-title">
                            I understand and explicitly agree that upon confirming this transaction, <strong>all my owner and administrative privileges will be permanently terminated immediately</strong> and cannot be undone.
                          </span>
                        </label>

                        <button
                          type="submit"
                          disabled={isConfirmingFinalTransfer || !sellerAcknowledgedRevocation || sellerConfirmationCode.length !== 6}
                          className="w-full rounded-xl bg-rose-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-rose-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isConfirmingFinalTransfer ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>Executing Atomic Handover...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              <span>Confirm Final Transfer & Relinquish Ownership</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Cancel Transfer Option */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCancelTransfer}
                      className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-neutral-700 dark:hover:bg-rose-950/40 transition"
                    >
                      Cancel Pending Transfer
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === "audit" && dashboardData && (
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                <div>
                  <h3 className="font-serif-masthead text-lg font-bold uppercase tracking-tight text-neutral-950 dark:text-stone-100">
                    Security Audit Trail
                  </h3>
                  <p className="text-xs text-neutral-500 font-serif-title">
                    Cryptographic record of ownership claims, authentications, invitations, and transfers.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title="Refresh Audit Logs"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-200 font-serif-masthead text-[11px] uppercase tracking-wider text-neutral-400 dark:border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Actor</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                    {dashboardData.auditLogs.map((log) => {
                      const severityColor = 
                        log.severity === "critical" 
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : log.severity === "warning"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";

                      return (
                        <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850">
                          <td className="py-2 px-3 text-neutral-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </td>
                          <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-white">
                            {log.action}
                          </td>
                          <td className="py-2 px-3 text-neutral-600 dark:text-neutral-300 truncate max-w-[140px]">
                            {log.actorEmail}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${severityColor}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-sans text-neutral-600 dark:text-neutral-300">
                            {log.details}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 5: BUYER ACCEPTANCE INTERFACE */}
          {activeTab === "buyerAccept" && (
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 max-w-xl mx-auto space-y-6">
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 mb-3">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h3 className="font-serif-masthead text-xl font-bold uppercase tracking-tight text-neutral-950 dark:text-stone-100">
                  Buyer Title Acceptance Portal
                </h3>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300 font-serif-title">
                  Authenticate your invitation passcode and accept primary ownership of The World Ledger.
                </p>
              </div>

              <form onSubmit={handleBuyerAccept} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerAcceptName}
                    onChange={(e) => setBuyerAcceptName(e.target.value)}
                    placeholder="e.g. New Super Owner"
                    className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                    Designated Buyer Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerAcceptEmail}
                    onChange={(e) => setBuyerAcceptEmail(e.target.value)}
                    placeholder="Must match the email designated by the seller"
                    className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-serif-title">
                    6-Digit Passcode or Invitation Token
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerAcceptCode}
                    onChange={(e) => setBuyerAcceptCode(e.target.value.trim())}
                    placeholder="Enter 6-digit passcode"
                    className="mt-1 w-full text-center font-mono text-lg font-bold rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-neutral-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <label className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={buyerAcknowledgedTerms}
                    onChange={(e) => setBuyerAcknowledgedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-serif-title">
                    I explicitly accept and assume sole legal and technical ownership of THE WORLD LEDGER, its content database, source integration pipeline, and administrative authority.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isBuyerSubmitting || !buyerAcknowledgedTerms || !buyerAcceptEmail || !buyerAcceptCode}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBuyerSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Authenticating & Approving...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Accept Website Ownership Transfer (Step 2)</span>
                    </>
                  )}
                </button>
              </form>
            </section>
          )}

          {/* TAB 6: SECURITY OUTBOX (SIMULATED EMAIL DISPATCH) */}
          {activeTab === "outbox" && (
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                <div>
                  <h3 className="font-serif-masthead text-lg font-bold uppercase tracking-tight text-neutral-950 dark:text-stone-100">
                    Security Outbox & Verification Transcripts
                  </h3>
                  <p className="text-xs text-neutral-500 font-serif-title">
                    Live inspection of all verification emails, single-use OTP codes, and transfer invitations dispatched by the server.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title="Refresh Outbox"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {!dashboardData?.recentEmails || dashboardData.recentEmails.length === 0 ? (
                <p className="text-xs text-neutral-500 font-serif-title italic text-center py-6">
                  No simulated emails dispatched yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentEmails.map((mail) => (
                    <div
                      key={mail.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-850 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/60 pb-2 dark:border-neutral-700/60">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-amber-600" />
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            To: <strong className="font-mono">{mail.to}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                          <span>{new Date(mail.sentAt).toLocaleTimeString()}</span>
                          <span className="rounded-md bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-300">
                            {mail.purpose}
                          </span>
                        </div>
                      </div>

                      <p className="font-serif-title font-bold text-sm text-neutral-900 dark:text-stone-100">
                        {mail.subject}
                      </p>

                      <pre className="whitespace-pre-wrap font-sans text-xs text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                        {mail.bodyText}
                      </pre>

                      {mail.code && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-neutral-500 font-medium">Extracted Passcode:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-amber-700 dark:text-amber-400">
                              {mail.code}
                            </span>
                            <button
                              onClick={() => handleCopy(mail.code!, mail.id)}
                              className="rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1"
                            >
                              {copiedKey === mail.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              <span>Copy Passcode</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};
