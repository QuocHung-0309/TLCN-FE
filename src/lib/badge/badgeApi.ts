import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const badgeApi = {
  getUserBadges: async (status?: string) => {
    const token = localStorage.getItem("accessToken"); // đồng bộ 1 key
    const res = await axiosInstance.get(`/users/badges`, {
      params: { status },
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data.data;
  },

    getUserActions: async () => {
    const token = localStorage.getItem("accessToken"); 
    const res = await axiosInstance.get(`/users/badges/history`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data.data;
  },
};
