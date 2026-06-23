import axiosInstance from "@/lib/axiosInstance";

// ==================== TYPES ====================
export type NotificationType =
  | "system"
  | "booking"
  | "tour"
  | "payment"
  | "promotion"
  | "chat"
  | "review"
  | "checkin";

export type TargetType = "all" | "user" | "tour";

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  content: string;
  image?: string | null;
  link?: string | null;
  targetType: TargetType;
  targetUsers?: string[];
  targetTourId?: string;
  readBy?: Array<{ userId: string; readAt: string }>;
  createdBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed
  isRead?: boolean;
  readCount?: number;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

// ==================== USER API ====================
export const notificationApi = {
  // Lấy danh sách thông báo của user
  getMyNotifications: async (
    page = 1,
    limit = 20
  ): Promise<NotificationListResponse> => {
    const res = await axiosInstance.get(`/notifications/me?page=${page}&limit=${limit}`);
    return res.data;
  },

  // Đếm số thông báo chưa đọc
  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await axiosInstance.get(`/notifications/unread-count`);
      return res.data.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  // Đánh dấu đã đọc
  markAsRead: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/notifications/${id}/read`, {});
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch(`/notifications/read-all`, {});
  },
};

// ==================== ADMIN API ====================
export interface AdminNotificationFilters {
  page?: number;
  limit?: number;
  type?: NotificationType;
  targetType?: TargetType;
}

export interface CreateNotificationInput {
  type?: NotificationType;
  title: string;
  content: string;
  image?: string;
  link?: string;
  targetType?: TargetType;
  targetUsers?: string[];
  targetTourId?: string;
  expiresAt?: string;
}

export const adminNotificationApi = {
  // Lấy danh sách thông báo (admin)
  getAllNotifications: async (
    filters: AdminNotificationFilters = {}
  ): Promise<NotificationListResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.type) params.set("type", filters.type);
    if (filters.targetType) params.set("targetType", filters.targetType);

    const res = await axiosInstance.get(`/notifications/admin?${params.toString()}`);
    return res.data;
  },

  // Lấy chi tiết thông báo
  getNotificationById: async (id: string): Promise<Notification> => {
    const res = await axiosInstance.get(`/notifications/admin/${id}`);
    return res.data.data || res.data;
  },

  // Tạo thông báo mới
  createNotification: async (
    data: CreateNotificationInput
  ): Promise<Notification> => {
    const res = await axiosInstance.post(`/notifications/admin`, data);
    return res.data.data || res.data;
  },

  // Cập nhật thông báo
  updateNotification: async (
    id: string,
    data: Partial<CreateNotificationInput & { isActive?: boolean }>
  ): Promise<Notification> => {
    const res = await axiosInstance.put(`/notifications/admin/${id}`, data);
    return res.data.data || res.data;
  },

  // Xóa thông báo
  deleteNotification: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/notifications/admin/${id}`);
  },
};

// ==================== HELPERS ====================
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  system: "Hệ thống",
  booking: "Đặt tour",
  tour: "Tour",
  payment: "Thanh toán",
  promotion: "Khuyến mãi",
  chat: "Tin nhắn",
  review: "Đánh giá",
  checkin: "Check-in",
};

export const NOTIFICATION_TYPE_COLORS: Record<
  NotificationType,
  { bg: string; text: string; icon: string }
> = {
  system: { bg: "bg-slate-100", text: "text-slate-600", icon: "Bell" },
  booking: { bg: "bg-blue-100", text: "text-blue-600", icon: "Calendar" },
  tour: { bg: "bg-emerald-100", text: "text-blue-950", icon: "Map" },
  payment: { bg: "bg-green-100", text: "text-green-600", icon: "CreditCard" },
  promotion: { bg: "bg-orange-100", text: "text-orange-600", icon: "Gift" },
  chat: { bg: "bg-purple-100", text: "text-purple-600", icon: "MessageCircle" },
  review: { bg: "bg-yellow-100", text: "text-yellow-600", icon: "Star" },
  checkin: { bg: "bg-pink-100", text: "text-pink-600", icon: "MapPin" },
};

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  all: "Tất cả người dùng",
  user: "Người dùng cụ thể",
  tour: "Khách hàng của tour",
};

export function formatNotificationTime(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
