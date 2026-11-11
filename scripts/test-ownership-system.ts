/**
 * Comprehensive Automated Security & Functional Test Suite for:
 * Website Ownership Management, Transfer & Access Control System
 * 
 * Tests:
 * 1. Initial State & Public Claim
 * 2. OTP Verification & Super Owner Setup
 * 3. Permanent Lockdown of Public Claim
 * 4. Owner 2FA Authentication
 * 5. Role-Based Access Control & Dashboard Data Protection
 * 6. Transfer Workflow (Initiation, Buyer Acceptance, Seller Confirmation)
 * 7. Atomic Title Transfer & Sole Ownership Guarantee
 * 8. Immediate & Permanent Revocation of Former Owner Privileges
 * 9. Former Owner Inability to Reclaim or Reverse
 * 10. Audit Log Integrity & Complete Event Tracking
 */

import { OwnershipManager } from "../src/server/ownershipManager";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "ownership_store.json");
const BACKUP_PATH = path.join(DATA_DIR, "ownership_store.json.testbackup");

function backupStore() {
  if (fs.existsSync(STORE_PATH)) {
    fs.copyFileSync(STORE_PATH, BACKUP_PATH);
  }
}

function restoreStore() {
  if (fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(BACKUP_PATH, STORE_PATH);
    fs.unlinkSync(BACKUP_PATH);
  }
}

function resetTestStore() {
  if (fs.existsSync(DATA_DIR)) {
    if (fs.existsSync(STORE_PATH)) {
      fs.unlinkSync(STORE_PATH);
    }
  }
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `- ${detail}` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("===================================================================");
  console.log("THE WORLD LEDGER — OWNERSHIP MANAGEMENT SYSTEM SECURITY TEST SUITE");
  console.log("===================================================================\n");

  backupStore();

  try {
    resetTestStore();

    // 1. Initial State
    console.log("Test Suite 1: Initial State & Public Claimability");
    const initialStatus = OwnershipManager.getPublicStatus();
    assert(!initialStatus.isClaimed, "System starts in unclaimed state");
    assert(initialStatus.ownershipStatus === "unclaimed", "Ownership status is 'unclaimed'");
    assert(!initialStatus.isCurrentOwner, "No active owner session initially");

    // 2. Initial Claim Request & Verification
    console.log("\nTest Suite 2: Secure Initial Claim & Super Owner Setup");
    const sellerEmail = "founder@worldledger.org";
    const claimReq = OwnershipManager.requestInitialClaim(sellerEmail, "Founding Editor");
    assert(claimReq.success, "Initial claim request succeeds with valid email");
    assert(typeof claimReq.simulatedCode === "string" && claimReq.simulatedCode.length === 6, "6-digit OTP code generated");

    // Invalid code attempt
    let invalidCodeCaught = false;
    try {
      OwnershipManager.verifyInitialClaim(sellerEmail, "000000", "Founding Editor");
    } catch {
      invalidCodeCaught = true;
    }
    assert(invalidCodeCaught, "Incorrect verification code rejected");

    // Correct verification
    const verifiedClaim = OwnershipManager.verifyInitialClaim(sellerEmail, claimReq.simulatedCode, "Founding Editor");
    assert(verifiedClaim.success, "Verification succeeds with correct OTP");
    assert(Boolean(verifiedClaim.sessionToken), "Owner session token issued");
    assert(verifiedClaim.owner.email === sellerEmail, "Owner profile matches claim email");
    assert(verifiedClaim.owner.role === "super_owner", "Role is established as super_owner");

    // 3. Permanent Lockdown of Initial Claim
    console.log("\nTest Suite 3: Permanent Lockdown of Public Claim");
    let lockedDown = false;
    try {
      OwnershipManager.requestInitialClaim("attacker@shadow.net", "Attacker");
    } catch (e: any) {
      lockedDown = e.message.includes("permanently disabled");
    }
    assert(lockedDown, "Secondary claim attempt blocked once ownership is established");

    // 4. Role-Based Access Control & Dashboard Protection
    console.log("\nTest Suite 4: Server-Side RBAC & Dashboard Access");
    let unauthCaught = false;
    try {
      OwnershipManager.getDashboardData("fake_invalid_token");
    } catch (e: any) {
      unauthCaught = true;
    }
    assert(unauthCaught, "Invalid session token rejected from owner dashboard");

    const dashboard = OwnershipManager.getDashboardData(verifiedClaim.sessionToken);
    assert(dashboard.isClaimed, "Owner dashboard confirms website is claimed");
    assert(dashboard.currentOwner.email === sellerEmail, "Dashboard reflects verified current owner");

    // 5. Transfer Initiation & Validation
    console.log("\nTest Suite 5: Transfer Initiation & Self-Transfer Prevention");
    let selfTransferBlocked = false;
    try {
      OwnershipManager.initiateTransfer(verifiedClaim.sessionToken, sellerEmail);
    } catch (e: any) {
      selfTransferBlocked = e.message.includes("Self-transfer prohibited");
    }
    assert(selfTransferBlocked, "Prohibits transferring website to oneself");

    const buyerEmail = "buyer@internationalmedia.com";
    const transferInit = OwnershipManager.initiateTransfer(verifiedClaim.sessionToken, buyerEmail, "Asset purchase agreement completed.");
    assert(transferInit.success, "Transfer successfully initiated to buyer");
    assert(transferInit.pendingTransfer.status === "pending_buyer_acceptance", "Status is pending_buyer_acceptance");

    const inviteToken = transferInit.pendingTransfer.buyerInviteToken;
    const buyerCode = transferInit.pendingTransfer.buyerVerificationCode;

    // 6. Inspection of Transfer Invitation
    console.log("\nTest Suite 6: Invitation Inspection");
    const inspect = OwnershipManager.inspectInvitation(inviteToken);
    assert(inspect.isValid, "Buyer can inspect transfer invitation");
    assert(inspect.buyerEmail === buyerEmail, "Invitation designates correct buyer email");

    // 7. Buyer Acceptance
    console.log("\nTest Suite 7: Buyer Verification & Explicit Acceptance");
    let wrongBuyerBlocked = false;
    try {
      OwnershipManager.buyerAcceptTransfer("imposter@network.com", buyerCode, "Imposter");
    } catch (e: any) {
      wrongBuyerBlocked = true;
    }
    assert(wrongBuyerBlocked, "Imposter email rejected from accepting transfer");

    const buyerAccept = OwnershipManager.buyerAcceptTransfer(buyerEmail, buyerCode, "Global Media CEO");
    assert(buyerAccept.success, "Buyer acceptance succeeds with verified code");
    assert(Boolean(buyerAccept.sellerFinalCode), "Seller final authorization code generated");

    // 8. Seller Final Confirmation (Atomic Execution)
    console.log("\nTest Suite 8: Seller Final Confirmation & Atomic Title Transfer");
    const sellerFinalCode = buyerAccept.sellerFinalCode;
    const finalize = OwnershipManager.sellerConfirmTransfer(verifiedClaim.sessionToken, sellerFinalCode);
    assert(finalize.success, "Atomic transfer confirmed and executed");
    assert(finalize.newOwnerEmail === buyerEmail, "New owner email matches buyer");

    // 9. Revocation of Former Owner Privileges
    console.log("\nTest Suite 9: Permanent Privilege Revocation of Former Owner");
    let sellerSessionRevoked = false;
    try {
      OwnershipManager.getDashboardData(verifiedClaim.sessionToken);
    } catch (e: any) {
      sellerSessionRevoked = e.message.includes("REVOKED");
    }
    assert(sellerSessionRevoked, "Former owner's session token is revoked immediately (403 REVOKED)");

    let formerOwnerCannotTransfer = false;
    try {
      OwnershipManager.initiateTransfer(verifiedClaim.sessionToken, "newvictim@mail.com");
    } catch (e: any) {
      formerOwnerCannotTransfer = true;
    }
    assert(formerOwnerCannotTransfer, "Former owner cannot initiate new transfers");

    // 10. New Owner Sole Control
    console.log("\nTest Suite 10: New Owner Sole Authority & Next Transfer Control");
    const newOwnerLoginReq = OwnershipManager.requestOwnerLoginCode(buyerEmail);
    assert(newOwnerLoginReq.success, "New owner can request login passcode");
    const newOwnerAuth = OwnershipManager.verifyOwnerLoginCode(buyerEmail, newOwnerLoginReq.simulatedCode);
    assert(newOwnerAuth.success, "New owner authenticates with 2FA");
    assert(Boolean(newOwnerAuth.sessionToken), "New owner receives authenticated session token");

    const newDashboard = OwnershipManager.getDashboardData(newOwnerAuth.sessionToken);
    assert(newDashboard.currentOwner.email === buyerEmail, "New owner has exclusive dashboard access");
    assert(newDashboard.transferHistory.length === 1, "Transfer history contains record of completed transition");
    assert(newDashboard.transferHistory[0].sellerEmail === sellerEmail, "History attributes seller");
    assert(newDashboard.transferHistory[0].buyerEmail === buyerEmail, "History attributes buyer");

    // 11. Audit Log Verification
    console.log("\nTest Suite 11: Tamper-Resistant Audit Trail");
    const auditLogs = OwnershipManager.getAuditLogs(newOwnerAuth.sessionToken);
    assert(auditLogs.length > 5, "Audit log recorded all major milestones");
    const actions = auditLogs.map(a => a.action);
    assert(actions.includes("INITIAL_CLAIM_VERIFIED"), "Audit records INITIAL_CLAIM_VERIFIED");
    assert(actions.includes("TRANSFER_INITIATED"), "Audit records TRANSFER_INITIATED");
    assert(actions.includes("BUYER_ACCEPTED"), "Audit records BUYER_ACCEPTED");
    assert(actions.includes("TRANSFER_COMPLETED_ATOMIC"), "Audit records TRANSFER_COMPLETED_ATOMIC");
    assert(actions.includes("REVOKE_PREVIOUS_OWNER_PRIVILEGES"), "Audit records REVOKE_PREVIOUS_OWNER_PRIVILEGES");

    console.log("\n===================================================================");
    console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("===================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    restoreStore();
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  restoreStore();
  process.exit(1);
});
