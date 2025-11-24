"use client";

import React from 'react';
import Link from "next/link";
import { useDashboardStats, useOngoingTours } from "@/app/admin/hooks/useAdmin";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: ongoingTours, isLoading: toursLoading } = useOngoingTours();
  const tours = Array.isArray(ongoingTours) ? ongoingTours : [];

  if (statsLoading || toursLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Lỗi khi tải dữ liệu dashboard</p>
        <p className="text-red-600 text-sm mt-2">{(statsError as any).message}</p>
      </div>
    )
  }

  const overview = stats?.overview || {};
  const recentBookings = stats?.recentBookings || [];
  const popularTours = stats?.popularTours || [];
  const statusDistribution = stats?.statusDistribution || {};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'p': return 'bg-yellow-100 text-yellow-800';
      case 'c': return 'bg-green-100 text-green-800';
      case 'x': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'p': return 'Chờ xác nhận';
      case 'c': return 'Đã xác nhận';
      case 'x': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          Dashboard Quản Trị
        </h1>
        <p className="text-slate-600">Tổng quan hoạt động hệ thống</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Tổng người dùng</p>
              <p className="text-2xl font-bold text-slate-900">{overview.totalUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <i className="ri-user-line text-xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Tổng tours</p>
              <p className="text-2xl font-bold text-slate-900">{overview.totalTours?.toLocaleString() || 0}</p>
              <p className="text-xs text-emerald-600">{overview.activeTours || 0} đang hoạt động</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <i className="ri-map-pin-line text-xl text-emerald-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Đặt tour tháng này</p>
              <p className="text-2xl font-bold text-slate-900">{overview.monthlyBookings?.toLocaleString() || 0}</p>
              <p className="text-xs text-purple-600">Tổng: {overview.totalBookings?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <i className="ri-calendar-check-line text-xl text-purple-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Doanh thu năm</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(overview.yearlyRevenue || 0)}</p>
              <p className="text-xs text-orange-600">⭐ {(overview.averageRating || 0).toFixed(1)}/5</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <i className="ri-money-dollar-circle-line text-xl text-orange-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Content/Blog Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Nội dung</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Bài viết blog</span>
              <span className="font-semibold text-slate-900">{overview.totalBlogs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Đánh giá</span>
              <span className="font-semibold text-slate-900">{overview.totalReviews || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Trạng thái Tours</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Chờ duyệt</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{statusDistribution.pending || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Đã duyệt</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">{statusDistribution.confirmed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Đang diễn ra</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{statusDistribution.inProgress || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Hoàn thành</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">{statusDistribution.completed || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tours phổ biến</h3>
          <div className="space-y-3">
            {popularTours.slice(0, 3).map((tour: any, index: number) => (
              <div key={tour._id} className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{tour.title}</p>
                  <p className="text-xs text-slate-500">{tour.bookingCount} đặt tour</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Ongoing Tours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Đặt tour gần đây</h3>
              <Link href="/admin/bookings" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentBookings.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Chưa có đặt tour nào</p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking: any) => (
                  <div key={booking._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{booking.userInfo.fullName}</p>
                      <p className="text-sm text-slate-600">{booking.tourInfo?.title || 'Tour không xác định'}</p>
                      <p className="text-xs text-slate-500">{formatDate(booking.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(booking.totalPrice)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(booking.bookingStatus)}`}>
                        {getStatusText(booking.bookingStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ongoing Tours */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Tours đang hoạt động</h3>
              <Link href="/admin/tours" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {tours.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Chưa có tour nào</p>
            ) : (
              <div className="space-y-4">
                {tours.slice(0, 5).map((tour: any) => (
                  <div key={tour._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{tour.title}</p>
                      <p className="text-sm text-slate-600">{tour.destination}</p>
                      <p className="text-xs text-slate-500">
                        {tour.startDate ? formatDate(tour.startDate) : "Chưa xác định"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {tour.current_guests || 0}/{tour.quantity || "—"}
                      </p>
                      <p className="text-xs text-slate-500">{tour.leader?.fullName || "Chưa gán leader"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
