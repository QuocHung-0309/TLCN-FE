import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";



// Lấy danh sách địa điểm
export const getDestinations = async (params?: any) => {
  console.log("🚀 Fetching destinations with params:", params);
  const res = await axiosInstance.get(`/places`, { params });
  return res.data;
};

// Lấy chi tiết địa điểm theo ID
export const getDestinationById = async (id: string) => {
  const res = await axiosInstance.get(`/places/${id}`);
  return res.data;
};

// Tìm kiếm địa điểm
export const searchDestinations = async (query: string) => {
  const res = await axiosInstance.get(`/places/search`, { params: { q: query } });
  return res.data;
};

// Like địa điểm
export const likeDestination = async (id: string, token: string) => {
  const res = await axiosInstance.patch(
    `/places/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Thêm vào danh sách yêu thích
export const addToFavorites = async (id: string, token: string) => {
  const res = await axiosInstance.post(
    `/places/${id}/favorite`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Lấy review theo placeId
export const getReviewsByPlaceId = async (placeId: string) => {
  const res = await axiosInstance.get(`/reviews/place/${placeId}`);
  return res.data;
};

// Tạo review mới
export const createReview = async (reviewData: any) => {
  const res = await axiosInstance.post(`/reviews`, reviewData);
  return res.data;
};

// Xóa review
export const deleteReview = async (reviewId: string, userId: string) => {
  const res = await axiosInstance.delete(`/reviews/${reviewId}`, { data: { userId } });
  return res.data;
};

// Cập nhật review
export const updateReview = async (reviewId: string, reviewData: any) => {
  const res = await axiosInstance.put(`/reviews/${reviewId}`, reviewData);
  return res.data;
};

// Like review
export const likeReview = async (reviewId: string, userId: string) => {
  const res = await axiosInstance.post(`/reviews/${reviewId}/like`, { userId });
  return res.data;
};
