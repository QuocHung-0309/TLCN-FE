import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/comments`;

// Lấy tất cả comment theo blogId
export const fetchCommentsByBlog = async (blogId: string) => {
  const res = await axiosInstance.get(`/${blogId}`);
  return res.data.data; // BE trả {success, data}
};

// Tạo comment mới
export const createComment = async (blogId: string, content: string, token: string) => {
  const res = await axiosInstance.post(
    `/${blogId}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};

// Cập nhật comment
export const updateComment = async (id: string, content: string, token: string) => {
  const res = await axiosInstance.patch(
    `/${id}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};

// Xóa comment
export const deleteComment = async (id: string, token: string) => {
  const res = await axiosInstance.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.data;
};

// Like / Unlike comment
export const likeComment = async (id: string, token: string) => {
  const res = await axiosInstance.patch(
    `/like/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};
