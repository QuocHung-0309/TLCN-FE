// src/lib/ward/wardApi.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const wardApi = {
  // Lấy tất cả phường/xã
  getAll: async () => {
    const res = await axios.get(`${API_URL}/wards`);
    return res.data;
  },

  // Lấy phường/xã theo id
  getById: async (id: string) => {
    const res = await axios.get(`${API_URL}/wards/id/${id}`);
    return res.data;
  },

  // Lấy phường/xã theo tên
  getByName: async (name: string) => {
    const res = await axios.get(`${API_URL}/wards/name/${name}`);
    return res.data;
  },
};
