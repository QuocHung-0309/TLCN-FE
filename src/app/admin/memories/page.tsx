"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast, useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  getAdminMemories,
  moderateAdminMemory,
  deleteAdminMemory,
} from "@/lib/admin/adminMemoryApi";
import { MemoryCard } from "./MemoryCard";
import { CommentsModal } from "./CommentsModal";
import AdminPagination from "@/components/admin/AdminPagination";
import { Image as ImageIcon } from "lucide-react";

const Page = () => {
  const queryClient = useQueryClient();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [page, setPage] = useState(1);
  const [filterInputs, setFilterInputs] = useState({
    search: "",
    privacy: "public",
  });
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    privacy: "public",
  });

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    memoryId: string;
    userName: string;
  }>({
    isOpen: false,
    memoryId: "",
    userName: "",
  });

  const [activeCommentsMemoryId, setActiveCommentsMemoryId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminMemories", page, activeFilters],
    queryFn: () =>
      getAdminMemories({
        page,
        limit: 20,
        search: activeFilters.search || undefined,
        privacy: activeFilters.privacy || undefined,
      }),
  });

  const moderateMutation = useMutation({
    mutationFn: (id: string) => moderateAdminMemory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMemories"] });
      showSuccess("Đã ẩn bài viết thành công!");
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Không thể ẩn bài viết");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminMemory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMemories"] });
      showSuccess("Xóa kỷ niệm thành công!");
      setConfirmDelete({ isOpen: false, memoryId: "", userName: "" });
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Không thể xóa kỷ niệm");
      setConfirmDelete({ isOpen: false, memoryId: "", userName: "" });
    },
  });

  const handleSearch = () => {
    setActiveFilters({ ...filterInputs });
    setPage(1);
  };

  const handleModerate = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn ép bài viết này về trạng thái Riêng tư không? Người dùng sẽ nhận được thông báo.")) {
      moderateMutation.mutate(id);
    }
  };

  const handleDelete = (memoryId: string, userName: string) => {
    setConfirmDelete({ isOpen: true, memoryId, userName });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-8">
        <p className="text-red-800 font-medium">Lỗi khi tải dữ liệu Kỷ niệm</p>
        <p className="text-red-600 text-sm mt-2">{(error as any).message}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 shrink-0">
            <ImageIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Kiểm duyệt Kỷ niệm
            </h1>
            <p className="text-sm text-slate-500">
              Kiểm duyệt các hình ảnh và nội dung chia sẻ từ người dùng
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Tìm kiếm</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <i className="ri-search-line"></i>
              </span>
              <input
                type="text"
                placeholder="Tên khách hàng, email, địa điểm, nội dung..."
                value={filterInputs.search}
                onChange={(e) => setFilterInputs({ ...filterInputs, search: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Trạng thái</label>
            <div className="flex gap-2">
              <select
                value={filterInputs.privacy}
                onChange={(e) => setFilterInputs({ ...filterInputs, privacy: e.target.value })}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none"
              >
                <option value="public">Công khai</option>
                <option value="private">Riêng tư (Bị ẩn)</option>
                <option value="">Tất cả</option>
              </select>
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 rounded-xl font-bold transition shadow-lg shadow-orange-500/30 flex items-center justify-center"
              >
                Lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {!data?.data || data.data.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
          <p className="text-yellow-800 flex items-center gap-2">
            <i className="ri-error-warning-line"></i> Không tìm thấy kỷ niệm nào
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data.data.map((memory) => (
              <MemoryCard
                key={memory._id}
                memory={memory}
                onModerate={handleModerate}
                onDelete={handleDelete}
                onViewComments={setActiveCommentsMemoryId}
                isModerating={moderateMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>

          <AdminPagination
            currentPage={page}
            totalPages={Math.ceil((data?.total || 0) / 20)}
            onPageChange={setPage}
            totalItems={data?.total}
            itemsLabel="kỷ niệm"
            activeColor="orange"
          />
        </>
      )}

      {/* Components */}
      <Toast {...toast} onClose={hideToast} />

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa kỷ niệm của ${confirmDelete.userName} không? Hình ảnh và dữ liệu sẽ bị xóa vĩnh viễn.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={() => deleteMutation.mutate(confirmDelete.memoryId)}
        onCancel={() => setConfirmDelete({ isOpen: false, memoryId: "", userName: "" })}
      />

      <CommentsModal
        memoryId={activeCommentsMemoryId || ""}
        isOpen={!!activeCommentsMemoryId}
        onClose={() => setActiveCommentsMemoryId(null)}
      />
    </div>
  );
};

export default Page;
