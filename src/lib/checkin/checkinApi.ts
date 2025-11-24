import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface CheckinPayload {
  note?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  device?: string;
  imgList?: string[];
}

export const checkinApi = {
  getUserCheckins: async () => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.get(`${API_URL}/me/checkins`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data.data;
  },

  createCheckin: async (placeId: string, data: CheckinPayload) => {
    const token = localStorage.getItem("accessToken");

    const payload: CheckinPayload = {
      note: data.note || "",
      location: data.location || {
        type: "Point",
        coordinates: [106.7, 10.8], 
      },
      device: data.device || "Unknown Device",
      imgList: data.imgList || [],
    };

    const res = await axios.post(`${API_URL}/places/${placeId}/checkin`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return res.data.data;
  },
};