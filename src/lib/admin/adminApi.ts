import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";
import { getAdminToken, setAdminToken } from "@/lib/auth/tokenManager";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const adminApi = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15_000,
});

adminApi.interceptors.request.use((cfg) => {
  const token = getAdminToken();
  if (token) {
    cfg.headers = cfg.headers ?? {};
    cfg.headers.Authorization = `Bearer ${token}`;
    console.log("🔐 AdminApi Request:", cfg.method?.toUpperCase(), cfg.url, "with token:", token.substring(0, 20) + "...");
  } else {
    console.warn("⚠️ AdminApi Request WITHOUT token:", cfg.method?.toUpperCase(), cfg.url);
  }
  return cfg;
});

// Response interceptor để handle errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ AdminApi 401 Unauthorized - Token expired or invalid");
      // Có thể redirect về login hoặc clear tokens
    } else if (error.response?.status === 403) {
      console.error("❌ AdminApi 403 Forbidden - Not admin role");
    }
    return Promise.reject(error);
  }
);
export type AdminLoginBody = { identifier: string; password: string };
export type AdminLoginResp = { accessToken?: string; token?: string; admin: { id: string; name?: string; fullName?: string; email?: string; username?: string } };

export async function adminLogin(body: AdminLoginBody) {
  console.log("🔑 Admin Login attempt:", body.identifier);
  const { data } = await axiosInstance.post<AdminLoginResp>("/admin/login", body);
  // Backend trả về `token` hoặc `accessToken`
  const token = data.token || data.accessToken;
  if (token) {
    setAdminToken(token);
    console.log("✅ Admin Login SUCCESS, token saved:", token.substring(0, 20) + "...");
  } else {
    console.error("❌ Admin Login: No token in response", data);
  }
  return { ...data, accessToken: token };
}

/** Dashboard stats cho admin */
export async function getDashboardStats() {
  try {
    console.log("📊 Fetching dashboard stats");
    const { data } = await adminApi.get("/admin/dashboard/stats");
    console.log("✅ Dashboard stats fetched");
    return data;
  } catch (error: any) {
    console.error("❌ Failed to fetch dashboard stats:", error.response?.data || error.message);
    throw error;
  }
}

/** Tours đang/chuẩn bị chạy cho dashboard */
export async function getOngoingTours() {
  const response = await adminApi.get<{ total: number; data: any[] }>("/admin/tours/ongoing");
  return response.data?.data ?? [];
}

/** Gán/cập nhật leader cho tour */
export async function setTourLeader(tourId: string, leaderId: string | null) {
  const { data } = await adminApi.patch(`/admin/tours/${tourId}/leader`, { leaderId });
  return data;
}

/** Thêm sự kiện timeline */
export type TimelineEventBody = {
  type: "departed" | "arrived" | "checkpoint" | "note" | "finished";
  note?: string;
};
export async function addTimeline(tourId: string, body: TimelineEventBody) {
  const { data } = await adminApi.post(`/admin/tours/${tourId}/timeline`, body);
  return data;
}

/** Chi phí tour */
export type Expense = {
  _id: string;
  title: string;
  amount: number;
  occurredAt: string;
  note?: string;
};

export async function getExpenses(tourId: string) {
  const { data } = await adminApi.get<Expense[]>(`/admin/tours/${tourId}/expenses`);
  return data ?? [];
}
export async function addExpense(tourId: string, payload: Omit<Expense, "_id">) {
  const { data } = await adminApi.post(`/admin/tours/${tourId}/expenses`, payload);
  return data;
}
export async function updateExpense(expenseId: string, patch: Partial<Expense>) {
  const { data } = await adminApi.patch(`/admin/expenses/${expenseId}`, patch);
  return data;
}
export async function deleteExpense(expenseId: string) {
  const { data } = await adminApi.delete(`/admin/expenses/${expenseId}`);
  return data;
}

/* ====================================
 *  TOURS CRUD (Admin)
 * ==================================== */

export type TourInput = {
  title: string;
  time?: string;
  description?: string;
  quantity?: number;
  priceAdult?: number;
  priceChild?: number;
  destination: string;
  startDate?: string | Date;
  endDate?: string | Date;
  min_guests?: number;
  current_guests?: number;
  status?: "pending" | "confirmed" | "in_progress" | "completed" | "closed";
  images?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    summary?: string;
    segments?: Array<{
      timeOfDay: "morning" | "afternoon" | "evening";
      title: string;
      items: string[];
    }>;
    photos?: string[];
  }>;
};

export type TourResponse = {
  _id: string;
  title: string;
  time?: string;
  description?: string;
  quantity?: number;
  priceAdult?: number;
  priceChild?: number;
  destination: string;
  destinationSlug?: string;
  startDate?: string;
  endDate?: string;
  min_guests?: number;
  current_guests?: number;
  status: string;
  images: string[];
  itinerary?: any[];
  createdAt?: string;
  updatedAt?: string;
};

export type ToursListResponse = {
  total: number;
  page: number;
  limit: number;
  data: TourResponse[];
};

/** Lấy danh sách tất cả tours */
export async function getAllToursAdmin(params?: {
  page?: number;
  limit?: number;
  status?: string;
  destination?: string;
  search?: string;
}) {
  const { data } = await adminApi.get<ToursListResponse>("/tours/admin", { params });
  return data;
}

/** Lấy chi tiết tour */
export async function getTourByIdAdmin(tourId: string) {
  const { data } = await adminApi.get<TourResponse>(`/tours/admin/${tourId}`);
  return data;
}

/** Tạo tour mới */
export async function createTourAdmin(payload: TourInput) {
  const { data } = await adminApi.post<{ message: string; tour: TourResponse }>("/tours", payload);
  return data;
}

/** Cập nhật tour */
export async function updateTourAdmin(tourId: string, payload: Partial<TourInput>) {
  const { data } = await adminApi.put<{ message: string; tour: TourResponse }>(`/tours/${tourId}`, payload);
  return data;
}

/** Xóa tour */
export async function deleteTourAdmin(tourId: string) {
  const { data } = await adminApi.delete<{ message: string; tour: TourResponse }>(`/tours/${tourId}`);
  return data;
}
