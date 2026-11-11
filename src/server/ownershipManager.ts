import fs from "fs";
import path from "path";
import crypto from "crypto";
import { 
  OwnerProfile, 
  PendingTransfer, 
  TransferHistoryRecord, 
  AuditLogEntry, 
  SimulatedEmail, 
  OwnershipDashboardData, 
  OwnershipStatePublic,
  AuditAction,
  AuditSeverity
} from "../types/ownership";

interface StoredOwnershipData {
  isClaimed: boolean;
  currentOwner: (OwnerProfile & {
    activeSessionToken?: string;
    sessionExpiresAt?: string;
  }) | null;
  pendingTransfer: PendingTransfer | null;
  previousOwners: Array<{
    userId: string;
    email: string;
    name: string;
    transferredAt: string;
    transferredToEmail: string;
    transferId: string;
    revokedSessionTokens?: string[];
  }>;
  transferHistory: TransferHistoryRecord[];
  auditLogs: AuditLogEntry[];
  verificationCodes: Array<{
    id: string;
    email: string;
    code: string;
    purpose: "INITIAL_CLAIM" | "OWNER_LOGIN" | "BUYER_ACCEPT" | "SELLER_CONFIRM";
    expiresAt: number;
    attempts: number;
  }>;
  simulatedEmails: SimulatedEmail[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "ownership_store.json");

function ensureStoreExists(): StoredOwnershipData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const defaultData: StoredOwnershipData = {
      isClaimed: false,
      currentOwner: null,
      pendingTransfer: null,
      previousOwners: [],
      transferHistory: [],
      verificationCodes: [],
      simulatedEmails: [],
      auditLogs: [
        {
          id: "log-init",
          action: "INITIAL_CLAIM_REQUEST",
          actorEmail: "system",
          ipAddress: "127.0.0.1",
          userAgent: "The World Ledger System Initialization",
          timestamp: new Date().toISOString(),
          details: "Website ownership management initialized. Awaiting initial super owner claim.",
          severity: "info",
        },
      ],
    };
    saveStore(defaultData);
    return defaultData;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading ownership store, creating clean backup:", err);
    const fallback: StoredOwnershipData = {
      isClaimed: false,
      currentOwner: null,
      pendingTransfer: null,
      previousOwners: [],
      transferHistory: [],
      verificationCodes: [],
      simulatedEmails: [],
      auditLogs: [],
    };
    saveStore(fallback);
    return fallback;
  }
}

function saveStore(data: StoredOwnershipData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempPath = `${STORE_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, STORE_PATH);
  } catch (err) {
    console.error("Failed to persist ownership data atomically:", err);
  }
}

function logAudit(
  data: StoredOwnershipData,
  action: AuditAction,
  actorEmail: string,
  details: string,
  severity: AuditSeverity = "info",
  ipAddress: string = "127.0.0.1",
  userAgent: string = "The World Ledger Engine"
) {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    action,
    actorEmail,
    ipAddress,
    userAgent,
    timestamp: new Date().toISOString(),
    details,
    severity,
  };
  data.auditLogs.unshift(entry);
  if (data.auditLogs.length > 300) {
    data.auditLogs = data.auditLogs.slice(0, 300);
  }
}

function sendSimulatedEmail(
  data: StoredOwnershipData,
  to: string,
  subject: string,
  purpose: SimulatedEmail["purpose"],
  bodyText: string,
  code?: string,
  inviteLink?: string
) {
  const emailItem: SimulatedEmail = {
    id: `mail-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    to,
    subject,
    purpose,
    sentAt: new Date().toISOString(),
    code,
    inviteLink,
    bodyText,
  };
  data.simulatedEmails.unshift(emailItem);
  if (data.simulatedEmails.length > 50) {
    data.simulatedEmails = data.simulatedEmails.slice(0, 50);
  }
}

export const OwnershipManager = {
  getPublicStatus(sessionToken?: string): OwnershipStatePublic & { isCurrentOwner?: boolean; currentOwnerEmail?: string } {
    const data = ensureStoreExists();
    let isCurrentOwner = false;
    let currentOwnerEmail: string | undefined;

    if (sessionToken && data.currentOwner && data.currentOwner.activeSessionToken === sessionToken) {
      const isExpired = data.currentOwner.sessionExpiresAt && new Date(data.currentOwner.sessionExpiresAt).getTime() < Date.now();
      if (!isExpired) {
        isCurrentOwner = true;
        currentOwnerEmail = data.currentOwner.email;
      }
    }

    const masked = data.currentOwner?.email 
      ? data.currentOwner.email.replace(/^(.)(.*)(@.*)$/, (_m, a, b, c) => `${a}${"*".repeat(Math.max(b.length, 3))}${c}`)
      : undefined;

    return {
      isClaimed: data.isClaimed,
      ownershipStatus: !data.isClaimed ? "unclaimed" : (data.pendingTransfer ? "transfer_pending" : "active"),
      ownerEmailMasked: masked,
      ownerName: data.currentOwner?.name,
      hasActivePendingTransfer: Boolean(data.pendingTransfer),
      pendingTransferExpiresAt: data.pendingTransfer?.expiresAt,
      isCurrentOwner,
      currentOwnerEmail: isCurrentOwner ? data.currentOwner?.email : undefined,
    };
  },

  requestInitialClaim(email: string, name?: string, clientIp: string = "127.0.0.1", userAgent: string = "Web"): { success: boolean; message: string; simulatedCode: string } {
    const data = ensureStoreExists();

    if (data.isClaimed) {
      logAudit(data, "UNAUTHORIZED_ACCESS_ATTEMPT", email, "Attempted to request initial claim on already established website ownership.", "warning", clientIp, userAgent);
      saveStore(data);
      throw new Error("Website ownership is already established. Public ownership claiming is permanently disabled.");
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("A valid email address is required to establish website ownership.");
    }

    // Clean old codes
    data.verificationCodes = data.verificationCodes.filter(c => c.expiresAt > Date.now() && c.email !== cleanEmail);

    const code = crypto.randomInt(100000, 999999).toString();
    data.verificationCodes.push({
      id: crypto.randomUUID(),
      email: cleanEmail,
      code,
      purpose: "INITIAL_CLAIM",
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
      attempts: 0,
    });

    logAudit(data, "INITIAL_CLAIM_REQUEST", cleanEmail, `Verification code dispatched for initial super owner establishment to ${cleanEmail}.`, "info", clientIp, userAgent);

    const emailBody = `You have requested to establish primary ownership of The World Ledger for email: ${cleanEmail}.\n\nYour Single-Use Verification Code is: ${code}\n\nThis verification code expires in 15 minutes. Once ownership is claimed, public setup will be permanently locked.`;
    sendSimulatedEmail(data, cleanEmail, "The World Ledger — Establish Website Ownership Verification", "INITIAL_CLAIM", emailBody, code);

    saveStore(data);
    return {
      success: true,
      message: `Verification code sent to ${cleanEmail}. Enter the 6-digit code to activate ownership.`,
      simulatedCode: code,
    };
  },

  verifyInitialClaim(email: string, code: string, name?: string, clientIp: string = "127.0.0.1", userAgent: string = "Web"): { success: boolean; sessionToken: string; owner: OwnerProfile } {
    const data = ensureStoreExists();

    if (data.isClaimed) {
      throw new Error("Website ownership is already established. Public claim is permanently disabled.");
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const recordIndex = data.verificationCodes.findIndex(
      c => c.email === cleanEmail && c.purpose === "INITIAL_CLAIM" && c.expiresAt > Date.now()
    );

    if (recordIndex === -1) {
      logAudit(data, "UNAUTHORIZED_ACCESS_ATTEMPT", cleanEmail, "Invalid or expired verification code submitted during initial claim.", "warning", clientIp, userAgent);
      saveStore(data);
      throw new Error("Invalid or expired verification code. Please request a fresh code.");
    }

    const verificationRecord = data.verificationCodes[recordIndex];
    if (verificationRecord.code !== cleanCode) {
      verificationRecord.attempts += 1;
      if (verificationRecord.attempts >= 5) {
        data.verificationCodes.splice(recordIndex, 1);
        logAudit(data, "UNAUTHORIZED_ACCESS_ATTEMPT", cleanEmail, "Maximum failed attempts exceeded for initial claim code.", "warning", clientIp, userAgent);
        saveStore(data);
        throw new Error("Maximum attempts exceeded. This verification code has been invalidated for security.");
      }
      saveStore(data);
      throw new Error(`Incorrect verification code. ${5 - verificationRecord.attempts} attempts remaining.`);
    }

    // Success: Remove code
    data.verificationCodes.splice(recordIndex, 1);

    const sessionToken = `TWL_OWNER_${crypto.randomBytes(32).toString("hex")}`;
    const sessionExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days

    const owner: OwnerProfile & { activeSessionToken: string; sessionExpiresAt: string } = {
      userId: crypto.randomUUID(),
      email: cleanEmail,
      name: name?.trim() || "Sarfaraz Shah",
      role: "super_owner",
      claimedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      activeSessionToken: sessionToken,
      sessionExpiresAt,
    };

    data.isClaimed = true;
    data.currentOwner = owner;

    logAudit(
      data, 
      "INITIAL_CLAIM_VERIFIED", 
      cleanEmail, 
      `Super Owner authority established and verified for ${cleanEmail} (${owner.name}). Public claim permanently closed.`, 
      "critical", 
      clientIp, 
      userAgent
    );

    sendSimulatedEmail(
      data,
      cleanEmail,
      "The World Ledger — Super Owner Established",
      "INITIAL_CLAIM",
      `Welcome to The World Ledger. Primary Super Ownership of this publication has been authenticated for ${cleanEmail}.\n\nAll administrative controls and transfer options are accessible via your private Ownership Portal.`
    );

    saveStore(data);

    return {
      success: true,
      sessionToken,
      owner: {
        userId: owner.userId,
        email: owner.email,
        name: owner.name,
        role: owner.role,
        claimedAt: owner.claimedAt,
        lastVerifiedAt: owner.lastVerifiedAt,
      },
    };
  },

  requestOwnerLoginCode(email: string, clientIp: string = "127.0.0.1", userAgent: string = "Web"): { success: boolean; message: string; simulatedCode: string } {
    const data = ensureStoreExists();
    const cleanEmail = email.toLowerCase().trim();

    if (!data.isClaimed || !data.currentOwner) {
      throw new Error("No owner has been established on this website yet.");
    }

    if (data.currentOwner.email.toLowerCase() !== cleanEmail) {
      logAudit(data, "UNAUTHORIZED_ACCESS_ATTEMPT", cleanEmail, "Attempted owner login with non-owner email.", "warning", clientIp, userAgent);
      saveStore(data);
      throw new Error("This email is not the verified current owner of this publication.");
    }

    const code = crypto.randomInt(100000, 999999).toString();
    data.verificationCodes = data.verificationCodes.filter(c => c.expiresAt > Date.now() && c.email !== cleanEmail);
    data.verificationCodes.push({
      id: crypto.randomUUID(),
      email: cleanEmail,
      code,
      purpose: "OWNER_LOGIN",
      expiresAt: Date.now() + 15 * 60 * 1000,
      attempts: 0,
    });

    logAudit(data, "OWNER_LOGIN_REQUEST", cleanEmail, `Owner login 2FA code dispatched to ${cleanEmail}.`, "info", clientIp, userAgent);
    sendSimulatedEmail(
      data,
      cleanEmail,
      "The World Ledger — Owner Portal Security Passcode",
      "OWNER_LOGIN",
      `Your single-use security passcode to access the Owner Portal is: ${code}\n\nExpires in 15 minutes.`,
      code
    );

    saveStore(data);
    return {
      success: true,
      message: `Security passcode dispatched to verified owner (${cleanEmail}).`,
      simulatedCode: code,
    };
  },

  verifyOwnerLoginCode(email: string, code: string, clientIp: string = "127.0.0.1", userAgent: string = "Web"): { success: boolean; sessionToken: string; owner: OwnerProfile } {
    const data = ensureStoreExists();
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    if (!data.isClaimed || !data.currentOwner || data.currentOwner.email.toLowerCase() !== cleanEmail) {
      throw new Error("Unauthorized owner credentials.");
    }

    const recordIndex = data.verificationCodes.findIndex(
      c => c.email === cleanEmail && c.purpose === "OWNER_LOGIN" && c.expiresAt > Date.now()
    );

    if (recordIndex === -1) {
      throw new Error("Expired or invalid login code. Please request a new security code.");
    }

    const verificationRecord = data.verificationCodes[recordIndex];
    if (verificationRecord.code !== cleanCode) {
      verificationRecord.attempts += 1;
      if (verificationRecord.attempts >= 5) {
        data.verificationCodes.splice(recordIndex, 1);
        saveStore(data);
        throw new Error("Exceeded maximum security attempts.");
      }
      saveStore(data);
      throw new Error(`Incorrect code. ${5 - verificationRecord.attempts} attempts remaining.`);
    }

    data.verificationCodes.splice(recordIndex, 1);

    const sessionToken = `TWL_OWNER_${crypto.randomBytes(32).toString("hex")}`;
    data.currentOwner.activeSessionToken = sessionToken;
    data.currentOwner.sessionExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    data.currentOwner.lastVerifiedAt = new Date().toISOString();

    logAudit(data, "OWNER_LOGIN_VERIFIED", cleanEmail, "Owner authenticated with multi-factor verification code.", "info", clientIp, userAgent);
    saveStore(data);

    return {
      success: true,
      sessionToken,
      owner: {
        userId: data.currentOwner.userId,
        email: data.currentOwner.email,
        name: data.currentOwner.name,
        role: data.currentOwner.role,
        claimedAt: data.currentOwner.claimedAt,
        lastVerifiedAt: data.currentOwner.lastVerifiedAt,
      },
    };
  },

  validateOwnerSession(sessionToken: string): { isValid: boolean; isRevoked?: boolean; owner?: OwnerProfile } {
    const data = ensureStoreExists();

    // Check if this token belongs to a revoked previous owner
    for (const prev of data.previousOwners) {
      if (prev.revokedSessionTokens && prev.revokedSessionTokens.includes(sessionToken)) {
        return { isValid: false, isRevoked: true };
      }
    }

    if (!data.isClaimed || !data.currentOwner || !data.currentOwner.activeSessionToken) {
      return { isValid: false };
    }

    if (data.currentOwner.activeSessionToken !== sessionToken) {
      return { isValid: false };
    }

    if (data.currentOwner.sessionExpiresAt && new Date(data.currentOwner.sessionExpiresAt).getTime() < Date.now()) {
      return { isValid: false };
    }

    return {
      isValid: true,
      owner: {
        userId: data.currentOwner.userId,
        email: data.currentOwner.email,
        name: data.currentOwner.name,
        role: data.currentOwner.role,
        claimedAt: data.currentOwner.claimedAt,
        lastVerifiedAt: data.currentOwner.lastVerifiedAt,
      },
    };
  },

  getDashboardData(sessionToken: string): OwnershipDashboardData {
    const session = this.validateOwnerSession(sessionToken);
    if (!session.isValid) {
      if (session.isRevoked) {
        throw new Error("REVOKED: Your administrative privileges were permanently revoked following a completed ownership transfer.");
      }
      throw new Error("UNAUTHORIZED: Active verified owner session required.");
    }

    const data = ensureStoreExists();
    return {
      isClaimed: data.isClaimed,
      currentOwner: session.owner!,
      ownershipStatus: data.pendingTransfer ? "transfer_pending" : "active",
      pendingTransfer: data.pendingTransfer,
      transferHistory: data.transferHistory,
      auditLogs: data.auditLogs,
      recentEmails: data.simulatedEmails,
      sessionExpiresAt: data.currentOwner?.sessionExpiresAt || new Date(Date.now() + 86400000).toISOString(),
    };
  },

  initiateTransfer(
    sessionToken: string,
    buyerEmail: string,
    note?: string,
    clientIp: string = "127.0.0.1",
    userAgent: string = "Web"
  ): { success: boolean; pendingTransfer: PendingTransfer; message: string } {
    const session = this.validateOwnerSession(sessionToken);
    if (!session.isValid) {
      throw new Error("Unauthorized owner session.");
    }

    const data = ensureStoreExists();
    const cleanBuyerEmail = buyerEmail.toLowerCase().trim();

    if (!cleanBuyerEmail || !cleanBuyerEmail.includes("@")) {
      throw new Error("A valid buyer email address is required.");
    }

    if (cleanBuyerEmail === session.owner!.email.toLowerCase()) {
      throw new Error("Self-transfer prohibited: You cannot transfer website ownership to yourself.");
    }

    if (data.pendingTransfer && data.pendingTransfer.status === "pending_buyer_acceptance") {
      const isExpired = new Date(data.pendingTransfer.expiresAt).getTime() < Date.now();
      if (!isExpired) {
        throw new Error(`An active transfer to ${data.pendingTransfer.buyerEmail} is already pending. Cancel it first before creating a new one.`);
      }
    }

    const transferId = `TRF-${Date.now().toString(36).toUpperCase()}`;
    const buyerInviteToken = crypto.randomBytes(24).toString("hex");
    const buyerVerificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h

    const pending: PendingTransfer = {
      transferId,
      sellerEmail: session.owner!.email,
      sellerUserId: session.owner!.userId,
      buyerEmail: cleanBuyerEmail,
      note: note?.trim(),
      status: "pending_buyer_acceptance",
      createdAt: new Date().toISOString(),
      expiresAt,
      buyerInviteToken,
      buyerVerificationCode,
      failedVerificationAttempts: 0,
    };

    data.pendingTransfer = pending;

    logAudit(
      data,
      "TRANSFER_INITIATED",
      session.owner!.email,
      `Ownership transfer initiated from ${session.owner!.email} to ${cleanBuyerEmail}. Transfer ID: ${transferId}.`,
      "critical",
      clientIp,
      userAgent
    );

    const emailBody = `You have received a formal invitation to accept full legal & administrative ownership of THE WORLD LEDGER from current owner ${session.owner!.email}.\n\nTransfer Passcode: ${buyerVerificationCode}\nInvitation Token: ${buyerInviteToken}\n\nTo review and accept this transfer, visit the Ownership Portal and enter your email with the 6-digit passcode. This invitation expires in 48 hours.`;
    sendSimulatedEmail(
      data,
      cleanBuyerEmail,
      "The World Ledger — Website Ownership Transfer Invitation",
      "BUYER_INVITATION",
      emailBody,
      buyerVerificationCode,
      `/?view=owner-dashboard&token=${buyerInviteToken}`
    );

    saveStore(data);

    return {
      success: true,
      pendingTransfer: pending,
      message: `Ownership transfer initiated. An invitation with security passcode has been dispatched to ${cleanBuyerEmail}.`,
    };
  },

  inspectInvitation(tokenOrCode: string): { 
    isValid: boolean; 
    transferId?: string; 
    sellerEmailMasked?: string; 
    buyerEmail?: string; 
    createdAt?: string; 
    expiresAt?: string; 
    note?: string; 
    status?: string;
    reason?: string;
  } {
    const data = ensureStoreExists();
    if (!data.pendingTransfer) {
      return { isValid: false, reason: "No pending transfer found." };
    }

    const clean = tokenOrCode.trim();
    const isMatch = data.pendingTransfer.buyerInviteToken === clean || data.pendingTransfer.buyerVerificationCode === clean;

    if (!isMatch) {
      return { isValid: false, reason: "Invitation code or token did not match." };
    }

    if (new Date(data.pendingTransfer.expiresAt).getTime() < Date.now()) {
      return { isValid: false, reason: "This transfer invitation has expired." };
    }

    const masked = data.pendingTransfer.sellerEmail.replace(/^(.)(.*)(@.*)$/, (_m, a, b, c) => `${a}${"*".repeat(Math.max(b.length, 3))}${c}`);

    return {
      isValid: true,
      transferId: data.pendingTransfer.transferId,
      sellerEmailMasked: masked,
      buyerEmail: data.pendingTransfer.buyerEmail,
      createdAt: data.pendingTransfer.createdAt,
      expiresAt: data.pendingTransfer.expiresAt,
      note: data.pendingTransfer.note,
      status: data.pendingTransfer.status,
    };
  },

  buyerAcceptTransfer(
    buyerEmail: string,
    codeOrToken: string,
    buyerName?: string,
    clientIp: string = "127.0.0.1",
    userAgent: string = "Web"
  ): { success: boolean; message: string; sellerFinalCode: string } {
    const data = ensureStoreExists();
    const cleanBuyer = buyerEmail.toLowerCase().trim();
    const cleanCode = codeOrToken.trim();

    if (!data.pendingTransfer) {
      throw new Error("No pending ownership transfer exists.");
    }

    if (new Date(data.pendingTransfer.expiresAt).getTime() < Date.now()) {
      throw new Error("This transfer invitation has expired.");
    }

    if (data.pendingTransfer.buyerEmail.toLowerCase() !== cleanBuyer) {
      throw new Error("The entered email does not match the designated recipient for this transfer.");
    }

    const isMatch = data.pendingTransfer.buyerInviteToken === cleanCode || data.pendingTransfer.buyerVerificationCode === cleanCode;
    if (!isMatch) {
      data.pendingTransfer.failedVerificationAttempts = (data.pendingTransfer.failedVerificationAttempts || 0) + 1;
      saveStore(data);
      throw new Error("Invalid transfer verification code.");
    }

    // Buyer accepts: generate seller's final confirmation OTP
    const sellerFinalConfirmationCode = crypto.randomInt(100000, 999999).toString();
    data.pendingTransfer.status = "pending_seller_final_confirmation";
    data.pendingTransfer.buyerAcceptedAt = new Date().toISOString();
    data.pendingTransfer.buyerName = buyerName?.trim() || "New Super Owner";
    data.pendingTransfer.sellerFinalConfirmationCode = sellerFinalConfirmationCode;

    logAudit(
      data,
      "BUYER_ACCEPTED",
      cleanBuyer,
      `Buyer ${cleanBuyer} authenticated and accepted ownership transfer. Awaiting final seller security confirmation.`,
      "critical",
      clientIp,
      userAgent
    );

    const emailBody = `Action Required: Buyer ${cleanBuyer} has explicitly approved the transfer of THE WORLD LEDGER.\n\nTo execute the irreversible transfer and pass all owner authority to the buyer, enter this Final Confirmation Security Passcode: ${sellerFinalConfirmationCode}\n\nWARNING: Upon entering this code, your administrative and owner privileges will be permanently revoked immediately.`;
    sendSimulatedEmail(
      data,
      data.pendingTransfer.sellerEmail,
      "URGENT: Final Confirmation Required for Website Ownership Transfer",
      "SELLER_CONFIRMATION",
      emailBody,
      sellerFinalConfirmationCode
    );

    saveStore(data);

    return {
      success: true,
      message: "Transfer terms accepted. A final security confirmation passcode has been dispatched to the current owner.",
      sellerFinalCode: sellerFinalConfirmationCode,
    };
  },

  sellerConfirmTransfer(
    sessionToken: string,
    confirmationCode: string,
    clientIp: string = "127.0.0.1",
    userAgent: string = "Web"
  ): { success: boolean; newOwnerEmail: string; message: string } {
    const session = this.validateOwnerSession(sessionToken);
    if (!session.isValid) {
      throw new Error("Unauthorized owner session.");
    }

    const data = ensureStoreExists();
    if (!data.pendingTransfer || data.pendingTransfer.status !== "pending_seller_final_confirmation") {
      throw new Error("No transfer in final confirmation state exists.");
    }

    const cleanCode = confirmationCode.trim();
    if (data.pendingTransfer.sellerFinalConfirmationCode !== cleanCode) {
      logAudit(data, "UNAUTHORIZED_ACCESS_ATTEMPT", session.owner!.email, "Incorrect final confirmation security code submitted by seller.", "warning", clientIp, userAgent);
      saveStore(data);
      throw new Error("Incorrect final security confirmation passcode.");
    }

    // ATOMIC TRANSACTION:
    const transferId = data.pendingTransfer.transferId;
    const previousSeller = data.currentOwner!;
    const buyerEmail = data.pendingTransfer.buyerEmail;
    const buyerName = data.pendingTransfer.buyerName || "Super Owner";

    // Revoke old owner
    data.previousOwners.unshift({
      userId: previousSeller.userId,
      email: previousSeller.email,
      name: previousSeller.name,
      transferredAt: new Date().toISOString(),
      transferredToEmail: buyerEmail,
      transferId,
      revokedSessionTokens: [sessionToken, ...(previousSeller.activeSessionToken ? [previousSeller.activeSessionToken] : [])],
    });

    // Record in completed history
    data.transferHistory.unshift({
      id: `hist-${Date.now()}`,
      transferId,
      sellerEmail: previousSeller.email,
      buyerEmail,
      buyerName,
      completedAt: new Date().toISOString(),
      termsAcknowledged: true,
      ipAddress: clientIp,
    });

    // Promote Buyer to sole Super Owner
    const newOwner: OwnerProfile & { activeSessionToken?: string; sessionExpiresAt?: string } = {
      userId: crypto.randomUUID(),
      email: buyerEmail,
      name: buyerName,
      role: "super_owner",
      claimedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      activeSessionToken: `TWL_OWNER_${crypto.randomBytes(32).toString("hex")}`,
      sessionExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };

    data.currentOwner = newOwner;
    data.pendingTransfer = null;

    logAudit(
      data,
      "TRANSFER_COMPLETED_ATOMIC",
      buyerEmail,
      `Atomic ownership transfer complete. Full title and administrative control transferred from ${previousSeller.email} to ${buyerEmail}.`,
      "critical",
      clientIp,
      userAgent
    );

    logAudit(
      data,
      "REVOKE_PREVIOUS_OWNER_PRIVILEGES",
      previousSeller.email,
      `All administrative roles and active sessions permanently revoked for former owner ${previousSeller.email}.`,
      "critical",
      clientIp,
      userAgent
    );

    sendSimulatedEmail(
      data,
      previousSeller.email,
      "The World Ledger — Ownership Transfer Completed (Privileges Revoked)",
      "TRANSFER_COMPLETED",
      `The transfer of THE WORLD LEDGER to ${buyerEmail} has successfully completed.\n\nAs specified in the ownership protocol, all your administrative roles, security tokens, and owner dashboard access have been permanently terminated.`
    );

    sendSimulatedEmail(
      data,
      buyerEmail,
      "Congratulations: You Are Now the Sole Owner of The World Ledger",
      "TRANSFER_COMPLETED",
      `Transfer successful! You are now the sole authenticated Super Owner of THE WORLD LEDGER.\n\nYou have exclusive authority over publishing operations, staff permissions, and future website transfers.`
    );

    saveStore(data);

    return {
      success: true,
      newOwnerEmail: buyerEmail,
      message: `Ownership successfully transferred to ${buyerEmail}. Your owner privileges have been permanently revoked.`,
    };
  },

  cancelTransfer(
    sessionToken: string,
    reason?: string,
    clientIp: string = "127.0.0.1",
    userAgent: string = "Web"
  ): { success: boolean; message: string } {
    const session = this.validateOwnerSession(sessionToken);
    if (!session.isValid) {
      throw new Error("Unauthorized owner session.");
    }

    const data = ensureStoreExists();
    if (!data.pendingTransfer) {
      throw new Error("No pending transfer to cancel.");
    }

    const buyerEmail = data.pendingTransfer.buyerEmail;
    const transferId = data.pendingTransfer.transferId;
    data.pendingTransfer = null;

    logAudit(
      data,
      "TRANSFER_CANCELLED_BY_SELLER",
      session.owner!.email,
      `Pending transfer ${transferId} to ${buyerEmail} was cancelled by owner. Reason: ${reason || "Cancelled by owner"}`,
      "info",
      clientIp,
      userAgent
    );

    sendSimulatedEmail(
      data,
      buyerEmail,
      "The World Ledger — Ownership Transfer Cancelled",
      "TRANSFER_CANCELLED",
      `The pending transfer invitation for THE WORLD LEDGER was cancelled by current owner ${session.owner!.email}.`
    );

    saveStore(data);

    return {
      success: true,
      message: "Pending transfer cancelled.",
    };
  },

  logoutOwner(sessionToken: string): { success: boolean } {
    const data = ensureStoreExists();
    if (data.currentOwner && data.currentOwner.activeSessionToken === sessionToken) {
      const email = data.currentOwner.email;
      data.currentOwner.activeSessionToken = undefined;
      data.currentOwner.sessionExpiresAt = undefined;
      logAudit(data, "OWNER_LOGOUT", email, "Owner logged out and session terminated.", "info");
      saveStore(data);
    }
    return { success: true };
  },

  getAuditLogs(sessionToken: string): AuditLogEntry[] {
    const session = this.validateOwnerSession(sessionToken);
    if (!session.isValid) {
      throw new Error("Unauthorized owner session.");
    }
    const data = ensureStoreExists();
    return data.auditLogs;
  },

  getSimulatedEmails(sessionToken?: string): SimulatedEmail[] {
    const data = ensureStoreExists();
    return data.simulatedEmails;
  },
};
