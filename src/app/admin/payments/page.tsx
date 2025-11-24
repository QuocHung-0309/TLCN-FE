"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminBookings, updateBookingPaymentStatus } from "@/lib/admin/adminBookingApi";
import { BookingData } from "@/lib/admin/adminBookingApi";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getPaymentStatus = (booking: BookingData) => {
  const totalPrice = booking.totalPrice || 0;
  const paidAmount = booking.depositPaid ? (booking.depositAmount || 0) : 0;
  const isPaid = paidAmount >= totalPrice;
  const isPartialPaid = paidAmount > 0 && paidAmount < totalPrice;
  
  return {
    isPaid,
    isPartialPaid,
    isUnpaid: paidAmount === 0,
    canMarkPaid: !isPaid,
    remaining: totalPrice - paidAmount,
    paidAmount,
  };
};

export default function PaymentManagementPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "p" | "c" | "x">("");
  const [paymentFilter, setPaymentFilter] = useState<"" | "paid" | "unpaid" | "partial">("");
  
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    type?: "danger" | "warning";
  }>({ isOpen: false, title: "", message: "", action: () => {}, type: "warning" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminPayments", page, searchTerm, statusFilter],
    queryFn: () =>
      getAdminBookings({
        page,
        limit: 20,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      }),
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, paidAmount }: { id: string; paidAmount: number }) =>
      updateBookingPaymentStatus(id, "mark_paid", paidAmount, "manual", `ADMIN_PAYMENT_${Date.now()}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPayments"] });
      showSuccess("Cập nhật thanh toán thành công!");
      setConfirmDialog((d) => ({ ...d, isOpen: false }));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật thanh toán";
      showError(message);
      setConfirmDialog((d) => ({ ...d, isOpen: false }));
    },
  });

  const handleMarkPaid = (booking: BookingData) => {
    const paymentStatus = getPaymentStatus(booking);
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận thanh toán",
      message: `Bạn có chắc chắn muốn đánh dấu đã thanh toán ${formatCurrency(paymentStatus.remaining)} cho booking ${booking.code}?`,
      action: () => {
        updatePaymentMutation.mutate({
          id: booking._id,
          paidAmount: booking.totalPrice,
        });
      },
      type: "warning",
    });
  };

  // Filter bookings based on payment status  
  const bookingsData = (data as any)?.data || [];
  const filteredBookings: BookingData[] = bookingsData.filter((booking: BookingData) => {
    if (!paymentFilter) return true;
    const paymentStatus = getPaymentStatus(booking);
    
    switch (paymentFilter) {
      case "paid":
        return paymentStatus.isPaid;
      case "unpaid":
        return paymentStatus.isUnpaid;
      case "partial":
        return paymentStatus.isPartialPaid;
      default:
        return true;
    }
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Lỗi khi tải dữ liệu thanh toán</p>
          <p className="text-red-600 text-sm mt-2">{(error as any).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          Quản Lý Thanh Toán
        </h1>
        <p className="text-slate-600">Quản lý trạng thái thanh toán cho các booking</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã booking, tên khách hàng, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Booking Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="p">Chờ xác nhận</option>
            <option value="c">Đã xác nhận</option>
            <option value="x">Đã hủy</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Tất cả thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="partial">Thanh toán một phần</option>
            <option value="paid">Đã thanh toán đủ</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setPaymentFilter("");
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">Không tìm thấy booking nào</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Mã Booking
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Khách Hàng
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Tour
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Tổng Tiền
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Đã Thanh Toán
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Còn Lại
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Trạng Thái
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => {
                    const paymentStatus = getPaymentStatus(booking);
                    return (
                      <tr
                        key={booking._id}
                        className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-900">{booking.code}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{booking.fullName}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {booking.tourId?.title || "N/A"}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {formatCurrency(booking.totalPrice)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatCurrency(paymentStatus.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className={paymentStatus.remaining > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                            {formatCurrency(paymentStatus.remaining)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              paymentStatus.isPaid
                                ? "bg-green-100 text-green-800"
                                : paymentStatus.isPartialPaid
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {paymentStatus.isPaid
                              ? "Đã thanh toán"
                              : paymentStatus.isPartialPaid
                              ? "Thanh toán một phần"
                              : "Chưa thanh toán"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            {!paymentStatus.isPaid && (
                              <button
                                onClick={() => handleMarkPaid(booking)}
                                disabled={updatePaymentMutation.isPending}
                                title="Đánh dấu đã thanh toán"
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                              >
                                <i className="ri-check-line text-lg"></i>
                              </button>
                            )}
                            <Link
                              href={`/admin/bookings/${booking._id}`}
                              title="Chi tiết"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <i className="ri-eye-line text-lg"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info & Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-md p-4">
            <p className="text-slate-600 mb-4 md:mb-0">
              Tổng cộng: <span className="font-bold text-slate-900">{data.total}</span> booking |
              Trang <span className="font-bold text-emerald-600">{page}</span> of{" "}
              <span className="font-bold">{Math.ceil((data.total || 0) / (data.limit || 20))}</span>
            </p>

            {/* Pagination Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Trước
              </button>

              {/* Page Numbers */}
              {[...Array(Math.ceil((data.total || 0) / (data.limit || 20)) || 1)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-2 rounded-lg transition ${
                    page === i + 1
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(Math.ceil((data.total || 0) / (data.limit || 20)) || 1, p + 1))}
                disabled={page === Math.ceil((data.total || 0) / (data.limit || 20))}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Sau →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Xác nhận"
        cancelText="Hủy"
        type={confirmDialog.type}
        onConfirm={() => {
          confirmDialog.action();
        }}
        onCancel={() =>
          setConfirmDialog({ isOpen: false, title: "", message: "", action: () => {}, type: "warning" })
        }
      />
    </div>
  );
}