import axios from "axios";
import { getUserToken } from "@/lib/auth/tokenManager";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const chatbotAxios = axios.create({ baseURL });

chatbotAxios.interceptors.request.use((config) => {
  const token = getUserToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type ChatbotMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TourCard = {
  _id: string;
  title: string;
  destination: string;
  destinationSlug: string;
  time: string;
  priceAdult: number;
  priceChild: number;
  images: string[];
  description: string;
};

export type ChatbotResponse = {
  reply: string;
  tours: TourCard[];
  action?: {
    type: "escalate";
    supportId: string;
  } | null;
};

export type UserInfo = {
  name?: string;
  email?: string;
};

export async function sendChatbotMessage(
  messages: ChatbotMessage[],
  userInfo?: UserInfo
): Promise<ChatbotResponse> {
  const { data } = await chatbotAxios.post<ChatbotResponse>("/chatbot/message", {
    messages,
    userInfo: userInfo || {},
  });
  return data;
}
