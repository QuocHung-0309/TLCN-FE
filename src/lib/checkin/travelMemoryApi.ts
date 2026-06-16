import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface TravelMemoryPayload {
  provinceName: string;
  visitedAt: string; // YYYY-MM-DD
  caption?: string;
  images: string[];
  privacy?: "private" | "public";
  source?: "manual" | "tour" | "both";
}

export interface TravelMemoryComment {
  _id: string;
  content: string;
  createdAt: string;
  userId?: {
    _id: string;
    fullName?: string;
    avatar?: string;
  };
}

export const travelMemoryApi = {
  uploadImages: async (files: File[]) => {
    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const res = await axios.post(
      `${API_URL}/travel-memories/upload-images`,
      formData,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    return res.data as {
      success: boolean;
      images: string[];
      publicIds?: string[];
    };
  },

  // 1. Tạo kỷ niệm mới
  createMemory: async (data: TravelMemoryPayload) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.post(`${API_URL}/travel-memories`, data, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },

  // 1b. Tạo kỷ niệm từ booking đã hoàn thành
  createMemoryFromBooking: async (bookingId: string, data: Omit<TravelMemoryPayload, "provinceName" | "source">) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.post(`${API_URL}/travel-memories/from-booking/${bookingId}`, data, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },


  // 2. Lấy timeline cá nhân
  getMyMemories: async (province?: string, page: number = 1, limit: number = 10) => {
    const token = localStorage.getItem("accessToken");
    const params: any = { page, limit };
    if (province) params.province = province;

    const res = await axios.get(`${API_URL}/travel-memories/me`, {
      params,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },

  // 3. Lấy timeline cộng đồng
  getPublicMemories: async (province?: string, page: number = 1, limit: number = 10) => {
    const token = localStorage.getItem("accessToken");
    const params: any = { page, limit };
    if (province) params.province = province;

    const res = await axios.get(`${API_URL}/travel-memories/public`, {
      params,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },

  // 4. Thích kỷ niệm
  likeMemory: async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.post(`${API_URL}/travel-memories/${id}/like`, {}, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },

  // 5. Bỏ thích kỷ niệm
  unlikeMemory: async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.delete(`${API_URL}/travel-memories/${id}/like`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },

  getComments: async (memoryId: string, page: number = 1, limit: number = 20) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.get(`${API_URL}/travel-memories/${memoryId}/comments`, {
      params: { page, limit },
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data as {
      success: boolean;
      data: TravelMemoryComment[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  },

  createComment: async (memoryId: string, content: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.post(
      `${API_URL}/travel-memories/${memoryId}/comments`,
      { content },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    return res.data as {
      success: boolean;
      message: string;
      comment: TravelMemoryComment;
    };
  },

  deleteComment: async (memoryId: string, commentId: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.delete(
      `${API_URL}/travel-memories/${memoryId}/comments/${commentId}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    return res.data;
  },
};
