import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";



export interface JourneyCollection {
  id: string;
  name: string;
  description: string;
  provinces: string[];
  icon: string;
  total: number;
  unlocked: number;
  missingProvinces: string[];
  completed: boolean;
}

export const journeyApi = {
  // Lấy danh sách bộ sưu tập và tiến độ
  getMyCollections: async (): Promise<{ success: boolean; data: JourneyCollection[] }> => {
    const token = localStorage.getItem("accessToken");
    const res = await axiosInstance.get(`/journey/collections/me`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },

  // Lấy danh sách tour gợi ý (theo bộ sưu tập đang đi dở)
  getTourSuggestions: async (): Promise<{ success: boolean; data: any[] }> => {
    const token = localStorage.getItem("accessToken");
    const res = await axiosInstance.get(`/journey/suggestions`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  }
};
