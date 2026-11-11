import { 
  OwnershipDashboardData, 
  OwnershipStatePublic, 
  PendingTransfer, 
  OwnerProfile,
  SimulatedEmail 
} from "../types/ownership";

const TOKEN_KEY = "twl_owner_session_token";

export const OwnershipService = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string, persist: boolean = true): void {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      if (persist) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn("Storage warning:", e);
    }
  },

  clearToken(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn("Storage clear warning:", e);
    }
  },

  async getPublicStatus(): Promise<OwnershipStatePublic & { isCurrentOwner?: boolean; currentOwnerEmail?: string }> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/ownership/status", { headers });
    if (!res.ok) {
      throw new Error("Failed to load ownership status.");
    }
    return res.json();
  },

  async requestInitialClaim(email: string, name?: string): Promise<{ success: boolean; message: string; simulatedCode: string }> {
    const res = await fetch("/api/ownership/claim/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to request initial ownership claim.");
    }
    return data;
  },

  async verifyInitialClaim(email: string, code: string, name?: string): Promise<{ success: boolean; sessionToken: string; owner: OwnerProfile }> {
    const res = await fetch("/api/ownership/claim/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Claim verification failed.");
    }
    if (data.sessionToken) {
      this.setToken(data.sessionToken);
    }
    return data;
  },

  async requestOwnerLogin(email: string): Promise<{ success: boolean; message: string; simulatedCode: string }> {
    const res = await fetch("/api/ownership/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Owner login request failed.");
    }
    return data;
  },

  async verifyOwnerLogin(email: string, code: string): Promise<{ success: boolean; sessionToken: string; owner: OwnerProfile }> {
    const res = await fetch("/api/ownership/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Owner authentication failed.");
    }
    if (data.sessionToken) {
      this.setToken(data.sessionToken);
    }
    return data;
  },

  async getDashboard(): Promise<OwnershipDashboardData> {
    const token = this.getToken();
    if (!token) {
      throw new Error("Authentication required to access the Owner Portal.");
    }

    const res = await fetch("/api/ownership/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403 || (data.error && data.error.includes("REVOKED"))) {
        this.clearToken();
        throw new Error(data.error || "REVOKED: Your administrative privileges were permanently revoked.");
      }
      throw new Error(data.error || "Failed to load ownership dashboard.");
    }
    return data;
  },

  async initiateTransfer(buyerEmail: string, note?: string): Promise<{ success: boolean; pendingTransfer: PendingTransfer; message: string }> {
    const token = this.getToken();
    if (!token) throw new Error("Owner session required.");

    const res = await fetch("/api/ownership/transfer/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ buyerEmail, note }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to initiate transfer.");
    }
    return data;
  },

  async inspectInvitation(tokenOrCode: string): Promise<any> {
    const res = await fetch(`/api/ownership/transfer/inspect/${encodeURIComponent(tokenOrCode)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to inspect transfer invitation.");
    }
    return data;
  },

  async buyerAcceptTransfer(buyerEmail: string, codeOrToken: string, buyerName?: string): Promise<{ success: boolean; message: string; sellerFinalCode: string }> {
    const res = await fetch("/api/ownership/transfer/buyer-accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerEmail, codeOrToken, buyerName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to accept transfer.");
    }
    return data;
  },

  async sellerConfirmTransfer(confirmationCode: string): Promise<{ success: boolean; newOwnerEmail: string; message: string }> {
    const token = this.getToken();
    if (!token) throw new Error("Owner session required.");

    const res = await fetch("/api/ownership/transfer/seller-confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ confirmationCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to finalize ownership transfer.");
    }
    // Revocation: clear token immediately
    this.clearToken();
    return data;
  },

  async cancelTransfer(reason?: string): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    if (!token) throw new Error("Owner session required.");

    const res = await fetch("/api/ownership/transfer/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to cancel transfer.");
    }
    return data;
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch("/api/ownership/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn("Logout fetch error:", e);
      }
    }
    this.clearToken();
  },

  async getOutbox(): Promise<SimulatedEmail[]> {
    const res = await fetch("/api/ownership/outbox");
    if (!res.ok) return [];
    const data = await res.json();
    return data.emails || [];
  },
};
