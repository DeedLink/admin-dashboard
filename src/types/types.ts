export type Address = string;

export interface User {
  _id: string;
  name: string;
  email: string;
  walletAddress?: string | null;
  nic: string;
  kycDocumentHash?: string;
  kycStatus: "pending" | "verified" | "rejected";
  role: "user" | "registrar" | "admin" | "surveyor" | "notary" | "IVSL";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface userStatusResponse {
    walletAddress: string,
    kycStatus: UserStatus,
    userData: {
        name: string,
        email: string
  }
}

export interface VerifyKYCRequest {
  status: "verified" | "rejected";
}


export type UserStatus = "pending" | "verified" | "rejected";

export type StorageType = "local" | "session";

export type StorageKey = "token" | "user" | "walletConnected" | "account" | "provider" | "signer";
