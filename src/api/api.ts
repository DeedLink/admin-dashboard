import axios, { type AxiosResponse } from "axios";
import { getItem } from "../storage/storage";
import type { User } from "../types/types";

const USER_API_URL = import.meta.env.VITE_USER_API_URL || "http://localhost:5000/api/users";

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