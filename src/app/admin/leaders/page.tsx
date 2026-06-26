"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminLeaders, deleteAdminLeader, updateAdminLeader } from "@/lib/admin/adminLeaderApi";
import { Toast, useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import AdminPagination from "@/components/admin/AdminPagination";

import { UserCog } from "lucide-react";

export default function LeadersPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    leaderId: string;
    leaderName: string;
  }>({ isOpen: false, leaderId: "", leaderName: "" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminLeaders", page, searchTerm, statusFilter],
    queryFn: () =>
      getAdminLeaders({
        page,
        limit: 20,
        search: searchTerm || undefined,
        status: (statusFilter as "active" | "inactive") || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminLeader(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminLeaders"] });
      showSuccess("Xóa hướng dẫn viên thành công!");
      setConfirmDelete({ isOpen: false, leaderId: "", leaderName: "" });
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Không thể xóa hướng dẫn viên");
      setConfirmDelete({ isOpen: false, leaderId: "", leaderName: "" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: "active" | "inactive" }) =>
      updateAdminLeader(id, { status: currentStatus === "active" ? "inactive" : "active" }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["adminLeaders"] });
      showSuccess("Đã cập nhật trạng thái");
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    },
  });

  const handleDelete = (id: string, fullName: string) => {
    setConfirmDelete({
      isOpen: true,
      leaderId: id,
      leaderName: fullName || "hướng dẫn viên này",
    });
  };

  const confirmDeleteAction = () => {
    if (confirmDelete.leaderId) {
      deleteMutation.mutate(confirmDelete.leaderId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 shrink-0">
            <UserCog className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Quản lý Hướng Dẫn Viên
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý thông tin và tài khoản của hướng dẫn viên
            </p>
          </div>
        </div>
        <Link
          href="/admin/leaders/create"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all shrink-0"
        >
          <i className="ri-user-add-line text-lg"></i>
          Thêm hướng dẫn viên
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-search-line text-lg"></i>
              </span>
              <input
                type="text"
                placeholder="Tên, email, username, điện thoại..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
              Trạng thái
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-shield-user-line text-lg"></i>
              </span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition appearance-none outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Vô hiệu</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-arrow-down-s-line"></i>
              </span>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <i className="ri-search-line"></i>
              Tìm kiếm
            </button>
          </div>
        </div>

        {(searchTerm || statusFilter) && (
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPage(1);
              }}
              className="text-xs text-slate-400 hover:text-orange-600 transition flex items-center gap-1.5"
            >
              <i className="ri-refresh-line"></i> Làm mới bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Lỗi khi tải dữ liệu hướng dẫn viên</p>
          <p className="text-red-600 text-sm mt-2">{(error as any).message}</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">Không tìm thấy hướng dẫn viên nào</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 min-w-[180px]">
                      Họ tên
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Username
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Điện thoại
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Địa chỉ
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((leader: any, index: number) => (
                    <tr
                      key={leader._id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {leader.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <a
                          href={`mailto:${leader.email}`}
                          className="text-orange-600 hover:underline"
                        >
                          {leader.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-700">@{leader.username}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {leader.phoneNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {leader.address || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            leader.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            leader.status === "active" ? "bg-emerald-500" : "bg-red-500"
                          }`}></span>
                          {leader.status === "active" ? "Hoạt động" : "Vô hiệu"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatDate(leader.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center items-center">
                          <Link
                            href={`/admin/leaders/${leader._id}`}
                            className="p-1.5 text-orange-500 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition"
                            title="Sửa"
                          >
                            <i className="ri-pencil-line text-lg"></i>
                          </Link>
                          <Link
                            href={`/admin/leaders/${leader._id}/reset-password`}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                            title="Đặt lại mật khẩu"
                          >
                            <i className="ri-key-line text-lg"></i>
                          </Link>
                          <button
                            onClick={() => toggleMutation.mutate({ id: leader._id, currentStatus: leader.status })}
                            disabled={toggleMutation.isPending}
                            title={leader.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                            className={`p-1.5 rounded-lg transition disabled:opacity-50 ${
                              leader.status === "active" 
                                ? "text-amber-500 hover:bg-amber-50 hover:text-amber-600" 
                                : "text-emerald-500 hover:bg-emerald-50 hover:text-blue-950"
                            }`}
                          >
                            <i className={`text-lg ${leader.status === "active" ? "ri-lock-2-line" : "ri-lock-unlock-line"}`}></i>
                          </button>
                          <button
                            onClick={() => handleDelete(leader._id, leader.fullName)}
                            disabled={deleteMutation.isPending}
                            title="Xóa"
                            className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition disabled:opacity-50"
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

          <AdminPagination 
            currentPage={page}
            totalPages={Math.ceil(data.total / data.limit)}
            onPageChange={setPage}
            totalItems={data.total}
            itemsLabel="hướng dẫn viên"
          />
        </>
      )}
      
      <Toast {...toast} onClose={hideToast} />
      
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa ${confirmDelete.leaderName} không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, leaderId: "", leaderName: "" })}
      />
    </div>
  );
}
