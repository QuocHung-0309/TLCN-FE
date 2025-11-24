"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "#/stores/auth";
import { getUserToken } from "@/lib/auth/tokenManager";
import { getMyBookings, type MyBookingItem } from "@/lib/checkout/checkoutApi";
import { Calendar, MapPin, Users, CreditCard, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type BookingStatus = "p" | "c" | "x" | "f";

const statusMap: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  p: { label: "Chờ thanh toán", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  c: { label: "Đã xác nhận", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  x: { label: "Đã hủy", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  f: { label: "Hoàn thành", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
};

export default function HistoryPage() {
  const [bookings, setBookings] = useState<MyBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const accessToken = useAuthStore((s) => s.token.accessToken) || getUserToken();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!accessToken) {
      window.location.href = "/auth/login";
      return;
    }
    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await getMyBookings(page, 10);
      console.log("📚 Bookings response:", response);
      
      if (response?.data) {
        setBookings(response.data);
        setTotalPages(Math.ceil(response.total / response.limit) || 1);
      }
    } catch (err: any) {
      console.error("❌ Error fetching bookings:", err);
      setError(err.response?.data?.message || "Không thể tải lịch sử booking");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch sử đặt tour</h1>
              <p className="text-gray-600 mt-1">Quản lý các chuyến đi của bạn</p>
            </div>
            <div className="flex items-center space-x-3">
              {user?.avatar && (
                <Image
                  src={user.avatar}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-sm text-gray-500">{user?.memberStatus || "Thành viên"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có booking nào</h3>
            <p className="text-gray-500 mb-6">Bạn chưa đặt tour nào. Hãy khám phá những điểm đến tuyệt vời!</p>
            <Link
              href="/user/destination"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá tour
              <ChevronRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.code} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.tourTitle || "Tour không xác định"}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusMap[booking.bookingStatus]?.bg} ${statusMap[booking.bookingStatus]?.color}`}>
                          {statusMap[booking.bookingStatus]?.label}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">Mã booking: <span className="font-mono">{booking.code}</span></p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{booking.tourDestination || "Chưa xác định"}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(booking.startDate || undefined)} - {formatDate(booking.endDate || undefined)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{booking.numAdults} người lớn{booking.numChildren > 0 ? `, ${booking.numChildren} trẻ em` : ""}</span>
                        </div>
                      </div>
                    </div>

                    {booking.tourImage && booking.tourImage !== null && (
                      <div className="ml-6 flex-shrink-0">
                        <Image
                          src={booking.tourImage}
                          alt={booking.tourTitle || "Tour"}
                          width={120}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span className="text-lg font-semibold text-gray-900">{formatPrice(booking.totalPrice)}</span>
                      {booking.bookingStatus === "p" && (
                        <span className="ml-2 text-sm text-yellow-600">
                          ({booking.depositPaid ? "Đã cọc" : "Chưa thanh toán"})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        Đặt ngày: {formatDate(booking.createdAt)}
                      </span>
                      
                      {booking.bookingStatus === "p" && (
                        <Link
                          href={`/user/booking/${booking.code}/payment`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Thanh toán
                        </Link>
                      )}
                      
                      <Link
                        href={`/user/booking/${booking.code}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}