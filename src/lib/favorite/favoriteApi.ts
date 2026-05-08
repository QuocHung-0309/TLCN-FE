import axiosInstance from "../axiosInstance";

export type FavoriteItem = {
  _id: string;
  userId: string;
  tourId: {
    _id: string;
    title: string;
    destination?: string;
    images?: string[];
    priceAdult?: number;
    priceChild?: number;
    time?: string;
    rating?: number;
  };
  createdAt: string;
  updatedAt: string;
};

// Lấy danh sách tour yêu thích
export const getMyFavorites = async (): Promise<{ data: FavoriteItem[] }> => {
  const res = await axiosInstance.get<{ data: FavoriteItem[] }>("/favorites");
  return res.data;
};

// Thêm/Bỏ yêu thích
export const toggleFavorite = async (
  tourId: string
): Promise<{ message: string; isFavorite: boolean }> => {
  const res = await axiosInstance.post<{ message: string; isFavorite: boolean }>(
    "/favorites/toggle",
    { tourId }
  );
  return res.data;
};

// Kiểm tra 1 tour đã yêu thích chưa
export const checkFavorite = async (
  tourId: string
): Promise<{ isFavorite: boolean }> => {
  const res = await axiosInstance.get<{ isFavorite: boolean }>(
    `/favorites/check/${tourId}`
  );
  return res.data;
};
