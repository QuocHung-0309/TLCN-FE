"use client";

import React from "react";
import Link from "next/link";
import { useDashboardStats } from "@/app/admin/hooks/useAdmin";
import AnimatedNumber from "../AnimatedNumber";
import RevenueChart from "./RevenueChart";
import BookingsChart from "./BookingsChart";

// Helpers
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const formatDateOnly = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();

  if (statsLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <p className="text-sm font-medium text-slate-400">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="m-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-rose-800">Lỗi khi tải dữ liệu dashboard</h2>
        <p className="mt-2 text-sm text-rose-600">{(statsError as any).message || "Vui lòng thử lại sau."}</p>
      </div>
    );
  }

  const {
    overview = {},
    monthlyRevenue = [],
    monthlyBookingsChart = [],
    actionRequiredBookings = [],
    upcomingDepartures = [],
    recentReviews = [],
    bookingStatusStats = {}
  } = stats || {};

  const pendingCountTotal = bookingStatusStats?.pending?.count || 0;
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* HEADER BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-orange-50 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-50 blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-2">{today}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Chào mừng trở lại, Admin 👋
              </h1>
              <p className="mt-2 text-slate-500 max-w-xl">
                Theo dõi hiệu suất kinh doanh, quản lý các tour sắp khởi hành và phản hồi nhanh chóng các yêu cầu đặt tour từ khách hàng.
              </p>
            </div>
            
            {pendingCountTotal > 0 ? (
              <div className="flex items-center gap-4 rounded-2xl bg-orange-50 border border-orange-100 p-4 pr-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <i className="ri-notification-3-line text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800">Cần xử lý ngay</p>
                  <p className="text-orange-600 text-sm mt-0.5">
                    Bạn có <strong className="font-bold">{pendingCountTotal} booking</strong> đang chờ xác nhận.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 pr-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <i className="ri-check-double-line text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800">Tuyệt vời!</p>
                  <p className="text-emerald-600 text-sm mt-0.5">
                    Tất cả booking đã được xử lý.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Doanh thu năm</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <i className="ri-money-dollar-circle-line text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-orange-600">{formatCurrency(overview.yearlyRevenue || 0)}</h3>
              <p className="mt-1 text-xs text-slate-400">Tích lũy từ đầu năm nay</p>
            </div>
          </div>
          
          {/* Bookings */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Tổng Booking</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <i className="ri-calendar-check-line text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-900">
                <AnimatedNumber value={overview.totalBookings || 0} />
              </h3>
              <p className="mt-1 text-xs text-emerald-600 font-medium">+{overview.monthlyBookings || 0} booking tháng này</p>
            </div>
          </div>

          {/* Active Tours */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Tour đang mở</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <i className="ri-route-line text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-900">
                <AnimatedNumber value={overview.activeTours || 0} />
              </h3>
              <p className="mt-1 text-xs text-slate-400">Trên tổng số {overview.totalTours || 0} tours</p>
            </div>
          </div>

          {/* Users */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Khách hàng</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <i className="ri-user-smile-line text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-900">
                <AnimatedNumber value={overview.totalUsers || 0} />
              </h3>
              <p className="mt-1 text-xs text-emerald-600 font-medium">+{overview.newUsersThisMonth || 0} thành viên mới</p>
            </div>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={monthlyRevenue} />
          <BookingsChart data={monthlyBookingsChart} />
        </div>

        {/* ACTIONABLE LISTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PENDING BOOKINGS */}
          <div className="flex flex-col rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden h-[500px]">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white z-10 sticky top-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                Cần xử lý gấp
              </h3>
              <Link href="/admin/bookings" className="text-xs font-semibold text-orange-600 hover:text-orange-700">Xem tất cả</Link>
            </div>
            <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
              {actionRequiredBookings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <i className="ri-check-line text-4xl mb-2 text-slate-200" />
                  <p className="text-sm">Không có booking nào đang chờ duyệt.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actionRequiredBookings.map((booking: any) => (
                    <div key={booking._id} className="p-4 rounded-xl hover:bg-orange-50/50 border border-transparent hover:border-orange-100 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-sm text-slate-900 truncate pr-2">{booking.userInfo?.fullName || "Khách ẩn danh"}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 shrink-0">Chờ duyệt</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1 truncate line-clamp-1" title={booking.tourInfo?.title}>
                        {booking.tourInfo?.title || "Tour đã bị xóa"}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-slate-400">{formatDateTime(booking.createdAt)}</span>
                        <span className="text-sm font-bold text-orange-600">{formatCurrency(booking.totalPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* UPCOMING DEPARTURES */}
          <div className="flex flex-col rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden h-[500px]">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white z-10 sticky top-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="ri-flight-takeoff-line text-blue-500" />
                Khởi hành sắp tới (14 ngày)
              </h3>
              <Link href="/admin/tours" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Quản lý tour</Link>
            </div>
            <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
              {upcomingDepartures.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <i className="ri-calendar-event-line text-4xl mb-2 text-slate-200" />
                  <p className="text-sm">Không có lịch khởi hành nào trong 14 ngày tới.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingDepartures.map((dep: any) => {
                    const isUnderbooked = dep.currentGuests < dep.minGuests;
                    const noLeader = !dep.leader;
                    const needsAttention = isUnderbooked || noLeader;
                    
                    return (
                      <div key={dep._id} className={`p-4 rounded-xl border transition-all ${needsAttention ? 'bg-rose-50/30 border-rose-100 hover:bg-rose-50' : 'hover:bg-slate-50 border-transparent hover:border-slate-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm text-slate-900 truncate pr-2">{dep.tour?.title || "Tour không xác định"}</p>
                          <span className="text-xs font-bold text-slate-700 shrink-0">{formatDateOnly(dep.startDate)}</span>
                        </div>
                        
                        <div className="flex gap-2 mb-3 mt-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isUnderbooked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            <i className="ri-group-line" /> {dep.currentGuests} / {dep.minGuests} (Min)
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${noLeader ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                            <i className="ri-user-star-line" /> {dep.leader || "Chưa gán HDV"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RECENT REVIEWS */}
          <div className="flex flex-col rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden h-[500px]">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white z-10 sticky top-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="ri-star-smile-line text-emerald-500" />
                Đánh giá mới nhất
              </h3>
              <Link href="/admin/reviews" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Xem tất cả</Link>
            </div>
            <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
              {recentReviews.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <i className="ri-chat-3-line text-4xl mb-2 text-slate-200" />
                  <p className="text-sm">Chưa có đánh giá nào gần đây.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentReviews.map((review: any) => (
                    <div key={review._id} className="p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden">
                            {review.user?.avatar ? (
                              <img src={review.user.avatar} alt="avatar" className="h-full w-full object-cover" />
                            ) : (
                              <i className="ri-user-fill text-slate-400 flex justify-center mt-1" />
                            )}
                          </div>
                          <p className="font-semibold text-sm text-slate-900">{review.user?.fullName || "Người dùng"}</p>
                        </div>
                        <div className="flex text-amber-400 text-xs shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={i < review.rating ? "ri-star-fill" : "ri-star-line"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mb-2 truncate">{review.tourTitle}</p>
                      <p className="text-sm text-slate-700 italic line-clamp-2">"{review.comment || "Không có nội dung đánh giá"}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
