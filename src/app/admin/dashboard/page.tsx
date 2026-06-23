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
<<<<<<< HEAD
            
            {pendingCountTotal > 0 ? (
              <div className="flex items-center gap-4 rounded-2xl bg-orange-50 border border-orange-100 p-4 pr-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <i className="ri-notification-3-line text-xl" />
=======

            <div className="mt-3 flex flex-col items-start gap-3 md:mt-0 md:items-end">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-xs font-medium text-emerald-100 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Hệ thống hoạt động ổn định
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-blue-100 md:text-sm">
                <span className="rounded-full bg-blue-900/60 px-3 py-1">
                  Tổng tours:{" "}
                  <b>{overview.totalTours?.toLocaleString() || 0}</b>
                </span>
                <span className="rounded-full bg-blue-900/60 px-3 py-1">
                  Đặt tour tháng này:{" "}
                  <b>{overview.monthlyBookings?.toLocaleString() || 0}</b>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== OVERVIEW STATS (nền trắng, viền nhẹ) ===== */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Users */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tổng người dùng
                </p>
                <p className="mt-2 text-2xl font-extrabold text-blue-950 dark:text-slate-50">
                  {overview.totalUsers?.toLocaleString() || 0}
                </p>
                <p className="mt-1 text-xs text-blue-950 dark:text-emerald-300">
                  {overview.newUsersThisMonth
                    ? `+${overview.newUsersThisMonth} tháng này`
                    : "Theo dõi tăng trưởng trong Admin"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-200">
                <i className="ri-user-line text-2xl" />
              </div>
            </div>
          </div>

          {/* Tours */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tours
                </p>
                <p className="mt-2 text-2xl font-extrabold text-blue-950 dark:text-slate-50">
                  {overview.totalTours?.toLocaleString() || 0}
                </p>
                <p className="mt-1 text-xs text-blue-950 dark:text-emerald-300">
                  {overview.activeTours || 0} tour đang hoạt động
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-200">
                <i className="ri-map-pin-line text-2xl" />
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-purple-400/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Đặt tour tháng này
                </p>
                <p className="mt-2 text-2xl font-extrabold text-blue-950 dark:text-slate-50">
                  {overview.monthlyBookings?.toLocaleString() || 0}
                </p>
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-300">
                  Tổng hệ thống:{" "}
                  <span className="font-semibold">
                    {overview.totalBookings?.toLocaleString() || 0}
                  </span>
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 shadow-sm dark:bg-purple-900/40 dark:text-purple-200">
                <i className="ri-calendar-check-line text-2xl" />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-400/70 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Doanh thu năm
                </p>
                <p className="mt-2 text-2xl font-extrabold text-orange-600 dark:text-amber-300">
                  {formatCurrency(overview.yearlyRevenue || 0)}
                </p>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                  ⭐ {(overview.averageRating || 0).toFixed(1)}/5 điểm đánh giá
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 shadow-sm dark:bg-orange-900/40 dark:text-orange-200">
                <i className="ri-money-dollar-circle-line text-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECONDARY STATS ===== */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Content / community */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-100">
                B
              </span>
              Nội dung & cộng đồng
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">
                  Bài viết blog
                </span>
                <span className="font-semibold text-blue-950 dark:text-slate-50">
                  {overview.totalBlogs || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">
                  Đánh giá
                </span>
                <span className="font-semibold text-blue-950 dark:text-slate-50">
                  {overview.totalReviews || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Tour status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-100">
                T
              </span>
              Trạng thái tours
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">
                  Chờ duyệt
                </span>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                  {statusDistribution.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">
                  Đã duyệt
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                  {statusDistribution.confirmed || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">
                  Đang diễn ra
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                  {statusDistribution.inProgress || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">
                  Hoàn thành
                </span>
                <span className="rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800/60 dark:text-slate-100">
                  {statusDistribution.completed || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Popular tours */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-600 dark:bg-orange-900/40 dark:text-orange-200">
                  ⭐
                </span>
                Tours phổ biến
              </span>
              <Link
                href="/admin/tours"
                className="text-xs font-medium text-blue-950 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
              >
                Quản lý tours →
              </Link>
            </h3>
            <div className="space-y-3">
              {popularTours.slice(0, 3).map((tour: any, index: number) => (
                <div
                  key={tour._id || index}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                      {tour.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      {tour.bookingCount} lượt đặt
                    </p>
                  </div>
>>>>>>> upstream/feature/chatbot-memory
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
              <Link
                href="/admin/bookings"
                className="text-xs font-medium text-blue-950 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
              >
                Xem tất cả →
              </Link>
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
              <Link
                href="/admin/tours"
                className="text-xs font-medium text-blue-950 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
              >
                Quản lý tours →
              </Link>
            </div>
            <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
              {upcomingDepartures.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <i className="ri-calendar-event-line text-4xl mb-2 text-slate-200" />
                  <p className="text-sm">Không có lịch khởi hành nào trong 14 ngày tới.</p>
                </div>
              ) : (
<<<<<<< HEAD
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
=======
                <div className="space-y-3">
                  {tours.slice(0, 5).map((tour: any) => (
                    <div
                      key={tour._id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {tour.title}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-300">
                          {tour.destination}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">
                          {tour.startDate
                            ? `Khởi hành: ${formatDateTime(tour.startDate)}`
                            : "Chưa xác định ngày khởi hành"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          Khách hiện tại
                        </p>
                        <p className="text-sm font-semibold text-blue-950 dark:text-emerald-300">
                          {tour.current_guests || 0}/{tour.quantity || "—"}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">
                          Leader:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-100">
                            {tour.leader?.fullName || "Chưa gán"}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
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
