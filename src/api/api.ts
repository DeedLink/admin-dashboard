import axios, { type AxiosResponse } from "axios";
import { getItem } from "../storage/storage";
import type { User, VerifyKYCRequest } from "../types/types";
import type { IDeed } from "../types/responseDeed";
import type { ITransaction } from "../types/transaction";

const USER_API_URL = import.meta.env.VITE_USER_API_URL;
const DEED_API_URL = import.meta.env.VITE_DEED_API_URL;
const TNX_API_URL = import.meta.env.VITE_TNX_API_URL;
const BACKEND_FILE_URL = import.meta.env.VITE_IPFS_MICROSERVICE_URL;

const api = axios.create({
  baseURL: USER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get profile (protected)
export const getProfile = async (): Promise<User> => {
  const res: AxiosResponse<User> = await api.get("/profile");
  return res.data;
};

// verify KYC
export const verifyKYC = async (
  id: string,
  data: VerifyKYCRequest
): Promise<{ message: string; user: User }> => {
  const res: AxiosResponse<{ message: string; user: User }> = await api.patch(
    `/${id}/verify-kyc`,
    data
  );
  return res.data;
};

// List pending KYC (registrar/admin only)
export const listPendingKYC = async (): Promise<User[]> => {
  const res: AxiosResponse<User[]> = await api.get("/pending-kyc");
  return res.data;
};

// Get all users (only for testing)
export const getUsers = async (): Promise<User[]> => {
  const res: AxiosResponse<User[]> = await api.get("/");
  return res.data;
};

// Search users by name, email or wallet address (public)
export const searchUsers = async (query: string): Promise<User[]> => {
  const res: AxiosResponse<User[]> = await api.get(`/search-user?query=${encodeURIComponent(query)}`);
  return res.data;
};

// -------------------- Pinata API Calls --------------------
const PINATA_API_URL = import.meta.env.VITE_PINATA_API_URL || "http://localhost:6000/ipfs";

const pinataApi = axios.create({
  baseURL: PINATA_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadMetadata = async (data: object, type: 'NFT' | 'FT' | 'USER'): Promise<{ uri: string }> => {
  const res: AxiosResponse<{ uri: string }> = await pinataApi.post(`/upload/metadata?type=${type}`, data);
  return res.data;
};

export const uploadFile = async (file: File): Promise<{ uri: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const res: AxiosResponse<{ uri: string }> = await pinataApi.post('/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

// IPFS
// Fetch the real file URL (signed URL or local fallback)
export const getFileUrl = async (filename: string): Promise<string> => {
  if (filename.startsWith("http")) return filename;

  try {
    const res = await axios.get(`${BACKEND_FILE_URL}/${filename}`);
    return res.data.url || `${BACKEND_FILE_URL}/${filename}`;
  } catch (err) {
    console.error("Failed to fetch file URL:", err);
    return `${BACKEND_FILE_URL}/${filename}`;
  }
};

// -------------------- Admin OTP Flow --------------------

// Request OTP for admin
export const requestAdminOTP = async (walletAddress: string): Promise<{ walletAddress: string; status: string }> => {
  const res: AxiosResponse<{ walletAddress: string; status: string }> = await api.get(`/admin/${walletAddress}`);
  return res.data;
};

// Verify OTP and get JWT token
export const verifyAdminOTP = async (walletAddress: string, otp: string): Promise<{ message: string; token: string; user: any }> => {
  const res: AxiosResponse<{ message: string; token: string; user: any }> = await api.post("/admin/verify", {
    walletAddress,
    otp,
  });
  return res.data;
};

// -------------------- Department User Registration --------------------
export const registerDepartmentUser = async (
  name: string,
  email: string,
  nic: string,
  walletAddress: string,
  role: 'notary' | 'surveyor' | 'IVSL'
): Promise<{ user: User }> => {
  const res: AxiosResponse<{ user: User }> = await api.post("/register-department-user", {
    name,
    email,
    nic,
    walletAddress,
    role
  });
  return res.data;
};

// Deed related api calls
const deedApi = axios.create({
  baseURL: DEED_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

deedApi.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get deeds (protected)
export const getDeeds = async (): Promise<IDeed[]> => {
  const res: AxiosResponse<any[]> = await deedApi.get('/');
  return res.data;
};

// Get deeds by owner ID (protected)
export const getDeedsByOwner = async (ownerId: string): Promise<IDeed[]> => {
  const res: AxiosResponse<any[]> = await deedApi.get(`/owner/${ownerId}`);
  return res.data;
};

// Get deed by ID (protected)
export const getDeedById = async (deedId: string): Promise<any> => {
  const res: AxiosResponse<any> = await deedApi.get(`/${deedId}`);
  return res.data;
};

// Get deed by ID (protected)
export const getDeedByDeedNumber = async (deedNumber: string): Promise<any> => {
  const res: AxiosResponse<any> = await deedApi.get(`/deed/${deedNumber}`);
  return res.data;
};

// Transaction related api calls
const tnxApi = axios.create({
  baseURL: TNX_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

tnxApi.interceptors.request.use((config) => {
  const token = getItem("local", "token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTransactionsByDeedId = async (deedId: string): Promise<ITransaction[]> => {
  const res: AxiosResponse<ITransaction[]> = await tnxApi.get(`/deed/${deedId}`, {
    validateStatus: () => true,
  });
  return Array.isArray(res.data) ? res.data : [];
};
