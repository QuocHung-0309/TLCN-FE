"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "#/stores/auth";
import { getUserToken } from "@/lib/auth/tokenManager";
import {
  getMyBookings,
  type MyBookingItem,
  cancelBooking,
} from "@/lib/checkout/checkoutApi";
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  ChevronRight,
  Filter,
  Info,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import VnpayPayButton from "@/app/user/checkout/VnpayPayButton";

type BookingStatus = "p" | "c" | "x" | "f";

const statusMap: Record<
  BookingStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  p: {
    label: "Chờ thanh toán",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
  },
  c: {
    label: "Đã xác nhận",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  x: {
    label: "Đã hủy",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
  f: {
    label: "Hoàn thành",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
};

const statusFilters: {
  key: "all" | BookingStatus;
  label: string;
}[] = [
  { key: "all", label: "Tất cả" },
  { key: "p", label: "Chờ thanh toán" },
  { key: "c", label: "Đã xác nhận" },
  { key: "f", label: "Hoàn thành" },
  { key: "x", label: "Đã hủy" },
];

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "Chưa xác định";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Chưa xác định";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
}

function getPaymentText(b: MyBookingItem) {
  const {
    totalPrice,
    paidAmount,
    depositAmount,
    depositPaid,
    requireFullPayment,
  } = b;

  if (!totalPrice) return "Chưa có thông tin tổng tiền";

  const remaining = Math.max(totalPrice - paidAmount, 0);
  const percent =
    totalPrice > 0
      ? Math.min(100, Math.round((paidAmount / totalPrice) * 100))
      : 0;

  if (b.bookingStatus === "x") {
    return `Đã hủy · Đã thanh toán: ${formatPrice(paidAmount)}`;
  }

  if (percent >= 100) {
    return `Đã thanh toán đủ (${formatPrice(paidAmount)})`;
  }

  if (depositPaid && depositAmount > 0) {
    return `Đã cọc ${formatPrice(depositAmount)} · Còn lại ${formatPrice(
      remaining
    )}`;
  }

  if (requireFullPayment) {
    return `Yêu cầu thanh toán đủ trước ngày khởi hành · Còn lại ${formatPrice(
      remaining
    )}`;
  }

  if (paidAmount > 0) {
    return `Đã thanh toán ${formatPrice(paidAmount)} · Còn lại ${formatPrice(
      remaining
    )}`;
  }

  return "Chưa thanh toán";
}

export default function HistoryPage() {
  const [bookings, setBookings] = useState<MyBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>(
    "all"
  );

  const [cancelingCode, setCancelingCode] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<MyBookingItem | null>(null);

  const accessToken =
    useAuthStore((s) => s.token.accessToken) || getUserToken();
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
      setSuccess("");

      const response = await getMyBookings(page, 10);
      if (response?.data) {
        setBookings(response.data);
        setTotalPages(Math.ceil(response.total / response.limit) || 1);
      }
    } catch (err: any) {
      console.error("❌ Error fetching bookings:", err);
      setError(
        err?.response?.data?.message ||
          "Không thể tải lịch sử booking, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
      setCancelingCode(null);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;

    const code = cancelTarget.code;
    try {
      setError("");
      setSuccess("");
      setCancelingCode(code);

      const res = await cancelBooking(code);
      if (res?.ok) {
        setSuccess("Huỷ booking thành công.");
        setCancelTarget(null); // đóng popup
        await fetchBookings(); // reload list
      } else {
        setError("Không thể huỷ booking. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("❌ Error cancel booking:", err);
      setError(
        err?.response?.data?.message ||
          "Không thể huỷ booking. Vui lòng thử lại."
      );
    } finally {
      setCancelingCode(null);
    }
  };

  const filteredBookings = useMemo(() => {
    const list =
      statusFilter === "all"
        ? bookings
        : bookings.filter((b) => b.bookingStatus === statusFilter);

    return [...list].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [bookings, statusFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter((b) => {
      if (!b.startDate) return false;
      const start = new Date(b.startDate).getTime();
      const now = Date.now();
      return (
        start >= now && (b.bookingStatus === "p" || b.bookingStatus === "c")
      );
    }).length;

    const totalPaid = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);

    return { total, upcoming, totalPaid };
  }, [bookings]);

  // Loading skeleton (rút gọn cho đỡ dài)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-10 w-40 bg-slate-200 rounded mb-6 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-white border border-slate-100 rounded-2xl shadow-sm animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Lịch sử đặt tour
            </h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">
              Theo dõi hành trình, thanh toán và quản lý huỷ tour của bạn
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.avatar && (
              <Image
                src={user.avatar}
                alt="Avatar"
                width={44}
                height={44}
                className="rounded-full object-cover border border-slate-200"
              />
            )}
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {user?.fullName ?? "Khách hàng"}
              </p>
              <p className="text-xs text-slate-500">
                {user?.memberStatus || "Thành viên SaiGondi"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Thông báo lỗi / thành công */}
        {error && (
          <div className="bg-red-50/90 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-start gap-2 text-sm">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50/90 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-start gap-2 text-sm">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Chưa có booking */}
        {!error && bookings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
              <Calendar className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Bạn chưa có booking nào
            </h3>
            <p className="text-slate-500 mb-6">
              Bắt đầu hành trình khám phá những điểm đến tuyệt vời cùng
              SaiGondi.
            </p>
            <Link
              href="/user/destination"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              Khám phá tour
              <ChevronRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Có booking */}
        {bookings.length > 0 && (
          <>
            {/* Summary + Filter */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-4 md:gap-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Tổng số booking</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">
                    Chuyến sắp khởi hành
                  </p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {stats.upcoming}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Đã thanh toán</p>
                  <p className="text-base font-semibold text-emerald-600">
                    {formatPrice(stats.totalPaid)}
                  </p>
                </div>
              </div>

              {/* Filter */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-800">
                      Lọc theo trạng thái
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {filteredBookings.length} kết quả
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setStatusFilter(f.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        statusFilter === f.key
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List bookings */}
            <div className="space-y-4 md:space-y-5 mt-2">
              {filteredBookings.map((booking) => {
                const statusMeta = statusMap[booking.bookingStatus];
                const total = booking.totalPrice || 0;
                const paid = booking.paidAmount || 0;
                const percent =
                  total > 0
                    ? Math.min(100, Math.round((paid / total) * 100))
                    : 0;

                const isCanceling = cancelingCode === booking.code;

                return (
                  <div
                    key={booking.code}
                    className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
                      {/* Thumbnail */}
                      {booking.tourImage && (
                        <div className="relative w-full md:w-56 h-40 md:h-32 flex-shrink-0">
                          <Image
                            src={booking.tourImage}
                            alt={booking.tourTitle || "Tour"}
                            fill
                            className="rounded-xl object-cover"
                          />
                          <div className="absolute inset-0 rounded-xl ring-1 ring-black/5" />
                          {booking.tourDestination && (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">
                                {booking.tourDestination}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="text-base md:text-lg font-semibold text-slate-900 line-clamp-2">
                                {booking.tourTitle || "Tour không xác định"}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                Mã booking:{" "}
                                <span className="font-mono text-slate-800">
                                  {booking.code}
                                </span>
                              </p>
                              {booking.phoneNumber && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Liên hệ: {booking.fullName} ·{" "}
                                  {booking.phoneNumber}
                                </p>
                              )}
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusMeta.bg} ${statusMeta.color}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}
                              />
                              {statusMeta.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-xs md:text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {booking.startDate || booking.endDate
                                  ? `${formatDate(
                                      booking.startDate || booking.endDate
                                    )}${
                                      booking.endDate
                                        ? ` - ${formatDate(booking.endDate)}`
                                        : ""
                                    }`
                                  : "Ngày khởi hành: Chưa xác định"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {booking.numAdults} người lớn
                                {booking.numChildren > 0 &&
                                  `, ${booking.numChildren} trẻ em`}
                              </span>
                            </div>

                            {booking.time && (
                              <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  Thời lượng: {booking.time}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment row */}
                        <div className="pt-3 md:pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-500">
                                Tổng tiền:
                              </span>
                              <span className="text-base font-semibold text-slate-900">
                                {formatPrice(booking.totalPrice)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {getPaymentText(booking)}
                            </p>
                            {booking.paymentMethod && (
                              <p className="text-[11px] text-slate-400">
                                Phương thức thanh toán:{" "}
                                {booking.paymentMethod.toUpperCase()}
                              </p>
                            )}
                            {booking.totalPrice > 0 && (
                              <div className="w-full max-w-xs mt-1">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  Đã thanh toán {percent}% giá trị booking
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
                            <span className="text-xs text-slate-400">
                              Đặt ngày: {formatDate(booking.createdAt)}
                            </span>

                            {/* Chỉ cho phép thanh toán & huỷ khi đang pending */}
                            {booking.bookingStatus === "p" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setCancelTarget(booking)}
                                  disabled={isCanceling}
                                  className={`inline-flex items-center gap-1 px-4 py-2 border border-red-200 text-red-600 rounded-full text-xs md:text-sm font-medium hover:bg-red-50 transition-colors ${
                                    isCanceling
                                      ? "opacity-70 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <XCircle className="w-3 h-3" />
                                  Huỷ tour
                                </button>

                                {/* VNPay: nút thanh toán với loader riêng */}
                                <VnpayPayButton
                                  bookingCode={booking.code}
                                  label="Thanh toán ngay"
                                />
                              </>
                            )}

                            <Link
                              href={`/user/booking/${booking.code}`}
                              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 transition-colors text-xs md:text-sm font-medium"
                            >
                              Chi tiết
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 md:mt-8">
                <div className="inline-flex items-center gap-2 bg-white rounded-full border border-slate-200 p-1 shadow-sm">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = page === pageNum;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Popup xác nhận huỷ */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 relative animate-fadeIn">
            <div className="absolute -top-4 right-6 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shadow">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>

            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Bạn muốn huỷ tour này?
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              <span className="font-medium">{cancelTarget.tourTitle}</span>
              <br />
              Mã booking: <span className="font-mono">{cancelTarget.code}</span>
            </p>

            <div className="text-xs bg-slate-50 p-3 rounded-xl text-slate-500 mb-5">
              <p>• Ngày đi: {formatDate(cancelTarget.startDate)}</p>
              <p>
                • Số khách: {cancelTarget.numAdults} người lớn
                {cancelTarget.numChildren > 0
                  ? `, ${cancelTarget.numChildren} trẻ em`
                  : ""}
              </p>
              <p>• Tổng tiền: {formatPrice(cancelTarget.totalPrice)}</p>
              <p className="mt-1 text-[11px] text-red-400">
                Lưu ý: Huỷ tour không thể khôi phục.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-sm hover:bg-slate-100"
              >
                Đóng
              </button>

              <button
                onClick={handleCancelConfirm}
                disabled={cancelingCode === cancelTarget.code}
                className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {cancelingCode === cancelTarget.code
                  ? "Đang huỷ..."
                  : "Xác nhận huỷ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
