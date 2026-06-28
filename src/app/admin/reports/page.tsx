"use client";

import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getAllReportsAdmin } from '@/lib/admin/adminApi';
import { getAdminLeaders } from '@/lib/admin/adminLeaderApi';
import Link from "next/link";
import AdminPagination from '@/components/admin/AdminPagination';
import dayjs from "dayjs";

const STATUS_COLORS: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Chờ xác nhận", bg: "bg-amber-100", text: "text-amber-700" },
  confirmed: { label: "Đã xác nhận", bg: "bg-sky-100", text: "text-sky-700" },
  in_progress: { label: "Đang diễn ra", bg: "bg-emerald-100", text: "text-emerald-700" },
  completed: { label: "Hoàn thành", bg: "bg-purple-100", text: "text-purple-700" },
  closed: { label: "Đã đóng", bg: "bg-slate-200", text: "text-slate-700" },
};

const fmtDate = (d: string) => d ? dayjs(d).format("DD/MM/YYYY") : "";

export default function AdminReportsPage() {
  const [page, setPage] = useState(1);
  const [appliedLeaderId, setAppliedLeaderId] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const [inputLeaderId, setInputLeaderId] = useState("");
  const [inputStatus, setInputStatus] = useState("");
  const [inputStartDate, setInputStartDate] = useState("");
  const [inputEndDate, setInputEndDate] = useState("");

  const { data: leadersData } = useQuery({
    queryKey: ['adminLeadersList'],
    queryFn: () => getAdminLeaders({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });
  const leaders = leadersData?.data || [];

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminReports", page, appliedLeaderId, appliedStatus, appliedStartDate, appliedEndDate],
    queryFn: () => getAllReportsAdmin({
      page,
      limit: 20,
      leaderId: appliedLeaderId || undefined,
      status: appliedStatus || undefined,
      startDate: appliedStartDate || undefined,
      endDate: appliedEndDate || undefined,
    }),
  });

  const handleSearch = () => {
    setAppliedLeaderId(inputLeaderId);
    setAppliedStatus(inputStatus);
    setAppliedStartDate(inputStartDate);
    setAppliedEndDate(inputEndDate);
    setPage(1);
  };

  const handleClearFilters = () => {
    setInputLeaderId("");
    setInputStatus("");
    setInputStartDate("");
    setInputEndDate("");
    setAppliedLeaderId("");
    setAppliedStatus("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setPage(1);
  };

  const hasActiveFilter = appliedLeaderId || appliedStatus || appliedStartDate || appliedEndDate;

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Lỗi khi tải dữ liệu báo cáo</p>
        <p className="text-red-600 text-sm mt-2">{(error as any).message}</p>
      </div>
    );

  const reports = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 shrink-0">
            <i className="ri-file-text-line text-orange-600 text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Báo cáo Chuyến đi
            </h1>
            <p className="text-sm text-slate-500">
              Tra cứu và theo dõi báo cáo, chi phí, timeline của tất cả các chuyến đi
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Hướng dẫn viên</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-user-star-line text-lg"></i>
              </span>
              <select
                value={inputLeaderId}
                onChange={(e) => setInputLeaderId(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition appearance-none outline-none"
              >
                <option value="">Tất cả HDV</option>
                {leaders.map((l: any) => (
                  <option key={l._id} value={l._id}>{l.fullName}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-arrow-down-s-line"></i>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Trạng thái</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-toggle-line text-lg"></i>
              </span>
              <select
                value={inputStatus}
                onChange={(e) => setInputStatus(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition appearance-none outline-none"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="in_progress">Đang diễn ra</option>
                <option value="completed">Hoàn thành</option>
                <option value="closed">Đã đóng</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-arrow-down-s-line"></i>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Từ ngày</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-calendar-line text-lg"></i>
              </span>
              <input
                type="date"
                value={inputStartDate}
                onChange={(e) => setInputStartDate(e.target.value)}
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
                value={inputEndDate}
                onChange={(e) => setInputEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <i className="ri-search-line"></i> Tìm kiếm
            </button>
          </div>
        </div>

        {hasActiveFilter && (
          <div className="mt-4 flex justify-end">
            <button onClick={handleClearFilters} className="text-xs text-slate-400 hover:text-orange-600 transition flex items-center gap-1.5">
              <i className="ri-refresh-line"></i> Làm mới bộ lọc
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        {reports.length === 0 ? (
          <div className="text-center py-16">
            <i className="ri-file-text-line text-5xl text-slate-300 mx-auto mb-3 block"></i>
            <p className="text-slate-500">Không tìm thấy báo cáo chuyến đi nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tên Tour</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Khởi hành</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Leader</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Số Khách</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep: any, index: number) => {
                  const sc = STATUS_COLORS[rep.status] ?? STATUS_COLORS.pending;
                  return (
                    <tr key={rep._id} className={`hover:bg-slate-50 transition ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 line-clamp-1">{rep.tourId?.title}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <i className="ri-map-pin-line"></i> {rep.tourId?.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">{fmtDate(rep.startDate)}</div>
                        <div className="text-xs text-slate-500 mt-0.5">đến {fmtDate(rep.endDate)}</div>
                      </td>
                      <td className="px-6 py-4">
                        {rep.leaderId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
                              {rep.leaderId.fullName?.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{rep.leaderId.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa gán</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">{rep.current_guests}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/admin/reports/${rep._id}`} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition inline-flex items-center gap-1.5 font-medium" title="Xem chi tiết">
                          <i className="ri-eye-line text-lg"></i> Xem
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center">
          <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
