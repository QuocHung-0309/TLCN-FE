"use client";

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllToursAdmin, deleteTourAdmin } from '@/lib/admin/adminApi';
import { Toast, useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import Link from "next/link";

const Page = () => {
  const queryClient = useQueryClient()
  const { toast, showSuccess, showError, hideToast } = useToast()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; tourId: string; tourTitle: string }>({
    isOpen: false,
    tourId: '',
    tourTitle: ''
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminTours", page, searchTerm, statusFilter],
    queryFn: () => getAllToursAdmin({
      page,
      limit: 20,
      search: searchTerm || undefined,
      status: statusFilter || undefined
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: (tourId: string) => deleteTourAdmin(tourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTours'] })
      showSuccess('Xóa tour thành công!')
      setConfirmDelete({ isOpen: false, tourId: '', tourTitle: '' })
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Không thể xóa tour')
      setConfirmDelete({ isOpen: false, tourId: '', tourTitle: '' })
    }
  })

  const handleDelete = (tourId: string, tourTitle: string) => {
    setConfirmDelete({ isOpen: true, tourId, tourTitle })
  }

  const confirmDeleteAction = () => {
    if (confirmDelete.tourId) {
      deleteMutation.mutate(confirmDelete.tourId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800"
      case "in_progress": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-gray-100 text-gray-800"
      case "closed": return "bg-red-100 text-red-800"
      default: return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Chờ duyệt"
      case "confirmed": return "Đã duyệt"
      case "in_progress": return "Đang diễn ra"
      case "completed": return "Hoàn thành"
      case "closed": return "Đóng"
      default: return status
    }
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Lỗi khi tải dữ liệu tours</p>
        <p className="text-red-600 text-sm mt-2">{(error as any).message}</p>
      </div>
    )

  const tours = data?.data || []
  const total = data?.total || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Quản Lý Tours
            </h1>
            <p className="text-slate-600">Quản lý thông tin tours du lịch</p>
          </div>
          <Link
            href="/admin/tours/create"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            + Tạo Tour Mới
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tour, điểm đến..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="confirmed">Đã duyệt</option>
              <option value="in_progress">Đang diễn ra</option>
              <option value="completed">Hoàn thành</option>
              <option value="closed">Đóng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <p className="text-slate-600">
          Tổng cộng: <span className="font-bold text-slate-900">{total}</span> tours
        </p>
      </div>

      {/* Tours Table */}
      {!tours || tours.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">Không tìm thấy tour nào</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Tour</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Điểm đến</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Thời gian</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Giá</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Số khách</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tours.map((tour: any) => (
                    <tr key={tour._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-slate-900 clamp-1">{tour.title}</div>
                          {tour.time && (
                            <div className="text-xs text-slate-500 mt-1">{tour.time}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{tour.destination || '—'}</td>
                      <td className="px-4 py-4 text-sm">
                        <div className="text-slate-700">
                          {tour.startDate
                            ? new Date(tour.startDate).toLocaleDateString("vi-VN")
                            : "—"}
                        </div>
                        {tour.endDate && (
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(tour.endDate).toLocaleDateString("vi-VN")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="text-slate-700">
                          NL: {tour.priceAdult ? tour.priceAdult.toLocaleString() : '0'}đ
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          TE: {tour.priceChild ? tour.priceChild.toLocaleString() : '0'}đ
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tour.status)}`}>
                          {getStatusText(tour.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {tour.current_guests || 0}/{tour.quantity || 0}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-center">
                          <Link
                            href={`/admin/tours/edit/${tour._id}`}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <i className="ri-pencil-line text-lg"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(tour._id, tour.title)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Xóa"
                          >
                            <i className="ri-delete-bin-6-line text-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-md p-4">
            <p className="text-slate-600 mb-4 md:mb-0">
              Tổng cộng: <span className="font-bold text-slate-900">{total}</span> tours | Trang{' '}
              <span className="font-bold text-emerald-600">{page}</span> of{' '}
              <span className="font-bold">{Math.ceil(total / 20)}</span>
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Trước
              </button>

              {[...Array(Math.ceil(total / 20))].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-2 rounded-lg transition ${
                    page === i + 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(Math.ceil(total / 20), p + 1))}
                disabled={page >= Math.ceil(total / 20)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Sau →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      <Toast {...toast} onClose={hideToast} />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa tour "${confirmDelete.tourTitle}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, tourId: '', tourTitle: '' })}
      />
    </div>
  )
}

export default Page
