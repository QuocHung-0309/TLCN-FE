import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
import { getUserToken } from "@/lib/auth/tokenManager";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const userChatAxios = axios.create({
  baseURL,
  withCredentials: false,
});

userChatAxios.interceptors.request.use((config) => {
  const userToken = getUserToken();
  if (userToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

export type ChatRole = "admin" | "leader" | "user" | "guest";
export type RoomType = "booking" | "support";

export type ChatMessage = {
  _id: string;
  roomType: RoomType;
  bookingCode?: string;
  supportId?: string;
  fromId?: string;
  fromRole: ChatRole;
  name?: string;
  email?: string;
  content: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type ChatThread = {
  id: string;
  type: RoomType;
  title: string;
  subtitle: string;
  lastMessage?: string;
  lastTime?: string;
  unread?: number;
  email?: string;
  name?: string;
  status?: "active" | "closed" | "pending";
};

export type ChatResponse = {
  roomType?: RoomType;
  bookingCode?: string;
  supportId?: string;
  total: number;
  data: ChatMessage[];
};

export type StartSupportResponse = {
  message: string;
  supportId: string;
  firstMessage: ChatMessage;
};

export type UserChatHistory = {
  supportChats: ChatThread[];
  bookingChats: ChatThread[];
};

export async function getBookingMessages(bookingCode: string): Promise<ChatResponse> {
  const { data } = await axiosInstance.get(`/chat/booking/${bookingCode}`);
  return data;
}

export async function sendBookingMessage(
  bookingCode: string,
  content: string
): Promise<{ message: string; data: ChatMessage }> {
  const { data } = await axiosInstance.post(`/chat/booking/${bookingCode}`, { content });
  return data;
}

export async function startSupportChat(params: {
  content: string;
  name?: string;
  email?: string;
}): Promise<StartSupportResponse> {
  const { data } = await userChatAxios.post("/chat/support/start", params);
  return data;
}

export async function getSupportMessages(supportId: string): Promise<ChatResponse> {
  const { data } = await userChatAxios.get(`/chat/support/${supportId}`);
  return data;
}

export async function sendSupportMessage(
  supportId: string,
  params: { content: string; name?: string; email?: string; role?: ChatRole }
): Promise<{ message: string; data: ChatMessage }> {
  const { data } = await userChatAxios.post(`/chat/support/${supportId}`, params);
  return data;
}

export async function adminGetSupportMessages(supportId: string): Promise<ChatResponse> {
  const { data } = await axiosInstance.get(`/chat/support/${supportId}`);
  return data;
}

export async function adminSendSupportMessage(
  supportId: string,
  params: { content: string }
): Promise<{ message: string; data: ChatMessage }> {
  const { data } = await axiosInstance.post(`/chat/support/${supportId}`, params);
  return data;
}

export async function getUserSupportChats(): Promise<{ total: number; data: any[] }> {
  const { data } = await userChatAxios.get("/chat/user/support");
  return data;
}

export async function getUserChatHistory(): Promise<UserChatHistory> {
  const { data } = await userChatAxios.get("/chat/user/history");
  return data;
}

export async function getAllSupportChats(): Promise<{ total: number; data: any[] }> {
  const { data } = await axiosInstance.get("/chat/admin/support");
  return data;
}

export async function getAllBookingChats(): Promise<{ total: number; data: any[] }> {
  const { data } = await axiosInstance.get("/chat/admin/bookings");
  return data;
}

export async function closeSupportChat(supportId: string): Promise<{ message: string }> {
  const { data } = await axiosInstance.patch(`/chat/admin/support/${supportId}/close`);
  return data;
}

export const ROLE_LABELS: Record<ChatRole, string> = {
  admin: "Admin",
  leader: "Tour Leader",
  user: "Khach hang",
  guest: "Khach vang lai",
};

export const ROLE_COLORS: Record<ChatRole, { bg: string; text: string; bubble: string }> = {
  admin: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    bubble: "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
  },
  leader: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    bubble: "bg-gradient-to-r from-purple-600 to-purple-700 text-white",
  },
  user: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    bubble: "bg-white text-slate-800 border border-slate-200",
  },
  guest: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    bubble: "bg-white text-slate-800 border border-slate-200",
  },
};

export function isStaffRole(role: ChatRole): boolean {
  return role === "admin" || role === "leader";
}

export function formatChatTime(dateStr?: string): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString("vi-VN", { weekday: "short" });
  }

  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}
