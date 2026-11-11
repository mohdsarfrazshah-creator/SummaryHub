export type OwnershipStatus = "unclaimed" | "active" | "transfer_pending";

export type TransferStatus = 
  | "pending_buyer_acceptance" 
  | "pending_seller_final_confirmation" 
  | "completed" 
  | "cancelled" 
  | "rejected" 
  | "expired";

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditAction = 
  | "INITIAL_CLAIM_REQUEST"
  | "INITIAL_CLAIM_VERIFIED"
  | "OWNER_LOGIN_REQUEST"
  | "OWNER_LOGIN_VERIFIED"
  | "OWNER_LOGOUT"
  | "TRANSFER_INITIATED"
  | "BUYER_INVITATION_VIEWED"
  | "BUYER_ACCEPTED"
  | "BUYER_REJECTED"
  | "SELLER_CONFIRMATION_REQUEST"
  | "TRANSFER_COMPLETED_ATOMIC"
  | "TRANSFER_CANCELLED_BY_SELLER"
  | "TRANSFER_EXPIRED"
  | "REVOKE_PREVIOUS_OWNER_PRIVILEGES"
  | "UNAUTHORIZED_ACCESS_ATTEMPT";

export interface OwnerProfile {
  userId: string;
  email: string;
  name: string;
  role: "super_owner";
  claimedAt: string;
  lastVerifiedAt: string;
}

export interface PendingTransfer {
  transferId: string;
  sellerEmail: string;
  sellerUserId: string;
  buyerEmail: string;
  buyerName?: string;
  note?: string;
  status: TransferStatus;
  createdAt: string;
  expiresAt: string;
  buyerInviteToken: string;
  buyerVerificationCode: string;
  buyerAcceptedAt?: string;
  sellerFinalConfirmationCode?: string;
  sellerConfirmedAt?: string;
  failedVerificationAttempts: number;
}

export interface TransferHistoryRecord {
  id: string;
  transferId: string;
  sellerEmail: string;
  buyerEmail: string;
  buyerName: string;
  completedAt: string;
  termsAcknowledged: boolean;
  ipAddress?: string;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actorEmail: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details: string;
  severity: AuditSeverity;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  purpose: "INITIAL_CLAIM" | "BUYER_INVITATION" | "SELLER_CONFIRMATION" | "TRANSFER_COMPLETED" | "TRANSFER_CANCELLED" | "OWNER_LOGIN";
  sentAt: string;
  code?: string;
  inviteLink?: string;
  bodyText: string;
  bodyHtml?: string;
}

export interface OwnershipStatePublic {
  isClaimed: boolean;
  ownershipStatus: OwnershipStatus;
  ownerEmailMasked?: string;
  ownerName?: string;
  hasActivePendingTransfer: boolean;
  pendingTransferExpiresAt?: string;
}

export interface OwnershipDashboardData {
  isClaimed: boolean;
  currentOwner: OwnerProfile;
  ownershipStatus: OwnershipStatus;
  pendingTransfer: PendingTransfer | null;
  transferHistory: TransferHistoryRecord[];
  auditLogs: AuditLogEntry[];
  recentEmails: SimulatedEmail[];
  sessionExpiresAt: string;
}
