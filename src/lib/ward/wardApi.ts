// src/lib/ward/wardApi.ts
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";



export const wardApi = {
  // Lấy tất cả phường/xã
  getAll: async () => {
    const res = await axiosInstance.get(`/wards`);
    return res.data;
  },

  // Lấy phường/xã theo id
  getById: async (id: string) => {
    const res = await axiosInstance.get(`/wards/id/${id}`);
    return res.data;
  },

  // Lấy phường/xã theo tên
  getByName: async (name: string) => {
    const res = await axiosInstance.get(`/wards/name/${name}`);
    return res.data;
  },
};
