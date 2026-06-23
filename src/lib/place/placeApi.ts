import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
import { Place } from "@/types/place";



interface PlaceResponse {
  places: Place[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export const placeApi = {
  getAll: async (): Promise<PlaceResponse> => {
    const res = await axiosInstance.get(`/places`);
    return res.data.data as PlaceResponse;
  },
  getNearbyPlaces: async () => {
    const token = localStorage.getItem("accessToken");
    const res = await axiosInstance.get(`/places/nearby`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data.data;
  },
};