// src/lib/bookings/bookingsApi.ts
import axiosInstance from "@/lib/axiosInstance";

export type RawBooking = {
  _id: string;
  tourId: string;
  userId: string;
  code: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  numAdults: number;
  numChildren: number;
  totalPrice: number;
  paymentMethod: "momo" | "vnpay" | "office";
  bookingStatus: "p" | "c" | "x"; // pending | completed | canceled
  depositPaid?: boolean;
  depositAmount?: number;
  paidAmount?: number;
  createdAt: string;
  // tuỳ BE có populate
  tour?: {
    _id: string;
    title: string;
    destination?: string;
    time?: string;
    images?: string[];
    cover?: string;
    startDate?: string;
    endDate?: string;
  };
};

export type MyBookingsResponse = {
  total: number;
  page: number;
  limit: number;
  data: RawBooking[];
};

export async function getMyBookings(page = 1, limit = 10): Promise<MyBookingsResponse> {
  const { data } = await axiosInstance.get<MyBookingsResponse>("/bookings/me", {
    params: { page, limit },
  });
  return data;
}
