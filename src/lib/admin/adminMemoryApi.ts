import axiosInstance from "@/lib/axiosInstance";

export interface AdminMemory {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    username?: string;
  };
  tourId?: {
    _id: string;
    title: string;
  };
  provinceName: string;
  visitedAt: string;
  caption: string;
  images: string[];
  privacy: "public" | "private";
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface GetAdminMemoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  privacy?: string;
}

export interface AdminMemoriesResponse {
  data: AdminMemory[];
  total: number;
  page: number;
  totalPages: number;
}

export const getAdminMemories = async (
  params: GetAdminMemoriesParams
): Promise<AdminMemoriesResponse> => {
  const response = await axiosInstance.get("/admin/memories", { params });
  return response.data;
};

export const moderateAdminMemory = async (id: string): Promise<any> => {
  const response = await axiosInstance.patch(`/admin/memories/${id}/moderate`);
  return response.data;
};

export const deleteAdminMemory = async (id: string): Promise<any> => {
  const response = await axiosInstance.delete(`/admin/memories/${id}`);
  return response.data;
};
