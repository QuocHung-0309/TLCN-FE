"use client";

import React, { useState } from 'react'
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminReviews, deleteAdminReview } from '@/lib/admin/adminReviewApi';
import { Toast, useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ReviewTable } from './ReviewTable';
import AdminPagination from '@/components/admin/AdminPagination';
import { MessageSquare } from "lucide-react";

const Page = () => {
  const queryClient = useQueryClient()
  const { toast, showSuccess, showError, hideToast } = useToast()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // State cho bộ lọc thực tế (chỉ cập nhật khi ấn Tìm kiếm)
  const [querySearchTerm, setQuerySearchTerm] = useState('')
  const [queryStartDate, setQueryStartDate] = useState('')
  const [queryEndDate, setQueryEndDate] = useState('')

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; reviewId: string; userName: string }>({
    isOpen: false,
    reviewId: '',
    userName: ''
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminReviews", page, querySearchTerm, queryStartDate, queryEndDate],
    queryFn: () => getAdminReviews({
      page,
      limit: 50,
      search: querySearchTerm || undefined,
      startDate: queryStartDate || undefined,
      endDate: queryEndDate || undefined,
    }),
  })

  const handleSearch = () => {
    setQuerySearchTerm(searchTerm)
    setQueryStartDate(startDate)
    setQueryEndDate(endDate)
    setPage(1)
  }

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteAdminReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] })
      showSuccess('Xóa bình luận thành công!')
      setConfirmDelete({ isOpen: false, reviewId: '', userName: '' })
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || 'Không thể xóa bình luận')
      setConfirmDelete({ isOpen: false, reviewId: '', userName: '' })
    }
  })


  const handleDelete = (reviewId: string, userName: string) => {
    setConfirmDelete({ isOpen: true, reviewId, userName })
  }

  const confirmDeleteAction = () => {
    if (confirmDelete.reviewId) {
      deleteMutation.mutate(confirmDelete.reviewId)
    }
  }


  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Lỗi khi tải dữ liệu bình luận</p>
        <p className="text-red-600 text-sm mt-2">{(error as any).message}</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 shrink-0">
            <MessageSquare className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Quản lý Đánh giá
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý các đánh giá từ khách hàng
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Tìm kiếm</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <i className="ri-search-line"></i>
              </span>
              <input
                type="text"
                placeholder="Tên khách hàng, nội dung đánh giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Từ ngày</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-calendar-line text-lg"></i>
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Đến ngày</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-calendar-check-line text-lg"></i>
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
            >
              <i className="ri-search-line text-lg"></i>
              Tìm kiếm
            </button>
          </div>
        </div>
        
        {(querySearchTerm || queryStartDate || queryEndDate) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStartDate('')
                setEndDate('')
                setQuerySearchTerm('')
                setQueryStartDate('')
                setQueryEndDate('')
                setPage(1)
              }}
              className="text-xs text-slate-400 hover:text-orange-500 transition flex items-center gap-1.5"
            >
              <i className="ri-refresh-line"></i> Làm mới bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {!data?.data || data.data.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
          <p className="text-yellow-800 flex items-center gap-2"><i className="ri-error-warning-line"></i> Không tìm thấy bình luận nào</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <ReviewTable
              data={data?.data ?? []}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          </div>

          <AdminPagination 
            currentPage={page}
            totalPages={Math.ceil((data?.total || 0) / 50)}
            onPageChange={setPage}
            totalItems={data?.total}
            itemsLabel="bình luận"
            activeColor="orange"
          />
        </>
      )}

      {/* Toast */}
      <Toast {...toast} onClose={hideToast} />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bình luận từ ${confirmDelete.userName} không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, reviewId: '', userName: '' })}
      />

    </div>
  )
}

export default Page
