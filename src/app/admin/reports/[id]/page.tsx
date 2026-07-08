"use client";

import { useQuery } from "@tanstack/react-query";

import React, { useState } from 'react';
import { getReportDetailAdmin, getReportExpensesAdmin } from '@/lib/admin/adminApi';
import { getAdminBookings } from '@/lib/admin/adminBookingApi';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Calendar, Users, FileText, Activity, DollarSign, 
  Clock, Map, Play, AlertCircle, FileDigit, Plane, CheckCircle2, Star
} from "lucide-react";
import dayjs from "dayjs";
import Image from "next/image";

const fmtDate = (d: string) => dayjs(d).format("DD/MM/YYYY");
const fmtDateTime = (d: string) => dayjs(d).format("HH:mm - DD/MM");
const fmtVND = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

const STATUS_COLORS: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending: { label: "Chờ xác nhận", bg: "bg-amber-100", text: "text-amber-700", icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: "Đã xác nhận", bg: "bg-blue-100", text: "text-blue-700", icon: <CheckCircle2 className="w-4 h-4" /> },
  in_progress: { label: "Đang diễn ra", bg: "bg-emerald-100", text: "text-emerald-700", icon: <Activity className="w-4 h-4" /> },
  completed: { label: "Hoàn thành", bg: "bg-purple-100", text: "text-purple-700", icon: <Star className="w-4 h-4" /> },
  closed: { label: "Đã đóng", bg: "bg-slate-200", text: "text-slate-700", icon: <FileDigit className="w-4 h-4" /> },
};

const EVENT_CFG: Record<string, any> = {
  departed: { label: "Bắt đầu chuyến đi", icon: Plane, bg: "bg-blue-100", color: "text-blue-600", border: "border-blue-200" },
  checkin: { label: "Check-in điểm đến", icon: MapPin, bg: "bg-orange-100", color: "text-orange-600", border: "border-orange-200" },
  activity: { label: "Hoạt động", icon: Activity, bg: "bg-indigo-100", color: "text-indigo-600", border: "border-indigo-200" },
  finished: { label: "Kết thúc chuyến đi", icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-600", border: "border-emerald-200" },
  note: { label: "Ghi chú sự kiện", icon: FileText, bg: "bg-slate-100", color: "text-slate-600", border: "border-slate-200" }
};

export default function AdminReportDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"report" | "timeline" | "expenses" | "passengers">("report");

  const { data: tour, isLoading } = useQuery({
    queryKey: ["adminReportDetail", id],
    queryFn: () => getReportDetailAdmin(id),
  });

  const { data: expensesData } = useQuery({
    queryKey: ["adminReportExpenses", id],
    queryFn: () => getReportExpensesAdmin(id),
    enabled: !!id,
  });

  const { data: paxData } = useQuery({
    queryKey: ["adminReportPax", id],
    queryFn: () => getAdminBookings({ departureId: id, limit: 1000 }),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );

  if (!tour)
    return (
      <div className="text-center py-20 bg-slate-50 min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy báo cáo chuyến đi</h2>
        <button onClick={() => router.push("/admin/reports")} className="mt-4 text-blue-600 hover:underline">Quay lại danh sách</button>
      </div>
    );

  const expenses = expensesData?.items || [];
  const passengers = paxData?.data || [];
  const report = tour.leaderReport || null;
  const tlEvents = tour.timeline || [];
  const sc = STATUS_COLORS[tour.status] || STATUS_COLORS.pending;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <button onClick={() => router.push("/admin/reports")}
            className="group inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm mb-4">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <Map className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 leading-tight mb-1">{tour.tourId?.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {tour.tourId?.destination}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {fmtDate(tour.startDate)} - {fmtDate(tour.endDate)}</span>
                  <span className="flex items-center gap-1 font-medium"><Users className="w-4 h-4" /> {tour.current_guests}/{tour.max_guests || tour.min_guests} khách</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${sc.bg} ${sc.text}`}>
                {sc.icon} {sc.label}
              </span>
              <div className="text-sm text-slate-500 flex items-center gap-1.5">
                HDV: <span className="font-semibold text-slate-800">{tour.leaderId?.fullName || "Chưa gán"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-6 overflow-x-auto no-scrollbar border-b border-slate-100">
            {[
              { id: "report", label: "Báo cáo", icon: FileText },
              { id: "timeline", label: "Timeline", icon: Activity },
              { id: "expenses", label: "Chi phí", icon: DollarSign },
              { id: "passengers", label: "Hành khách", icon: Users },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2
                  ${activeTab === t.id ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        
        {/* REPORT TAB */}
        {activeTab === "report" && (
          <div className="space-y-6">
            {!report ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">Chưa có báo cáo</h3>
                <p className="text-slate-500 mt-1">Hướng dẫn viên chưa nộp báo cáo tổng kết cho chuyến đi này.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-blue-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Báo cáo tổng kết</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">1. Tổng kết chuyến đi</h4>
                    <p className="text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">{report.summary || "Không có nội dung."}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">2. Sự cố phát sinh (Nếu có)</h4>
                    <p className="text-slate-700 whitespace-pre-line bg-red-50 p-4 rounded-xl border border-red-100">{report.incidents || "Không có sự cố nào được ghi nhận."}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">3. Ghi chú chi phí</h4>
                    <p className="text-slate-700 whitespace-pre-line bg-emerald-50 p-4 rounded-xl border border-emerald-100">{report.expenseNote || "Không có ghi chú thêm."}</p>
                  </div>
                  {report.noShowBookingIds?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">4. Khách vắng mặt (No-shows)</h4>
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <ul className="list-disc list-inside text-amber-800">
                          {report.noShowBookingIds.map((id: string, i: number) => (
                            <li key={i}>Mã đơn đặt: <strong>{id}</strong></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "timeline" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {!tlEvents || tlEvents.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Chưa có sự kiện timeline nào.</p>
              </div>
            ) : (
              <div className="relative pl-2">
                <div className="absolute left-7 top-5 bottom-5 w-0.5 bg-slate-200" />
                <div className="space-y-6">
                  {tlEvents.map((ev: any, i: number) => {
                    const ec = EVENT_CFG[ev.eventType] || EVENT_CFG.note;
                    const IconC = ec.icon;
                    return (
                      <div key={ev._id || i} className="relative flex gap-5">
                        <div className={`relative z-10 w-10 h-10 rounded-full ${ec.bg} border-4 border-white shadow-sm flex items-center justify-center flex-shrink-0 mt-1`}>
                          <IconC className={`w-4 h-4 ${ec.color}`} />
                        </div>
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <span className={`font-bold ${ec.color}`}>{ec.label}</span>
                            <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">{fmtDateTime(ev.at)}</span>
                          </div>
                          {ev.place && <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {ev.place}</p>}
                          {ev.note && <p className="text-sm text-slate-600 mt-2 bg-white p-3 rounded-xl border border-slate-100 whitespace-pre-line">{ev.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === "expenses" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Chưa có khoản chi phí phát sinh nào.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-800 uppercase">Tổng chi phí phát sinh</h3>
                    <p className="text-xs text-emerald-600 mt-1">Tổng cộng {expenses.length} khoản chi</p>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    {fmtVND(expenses.reduce((sum: number, e: any) => sum + e.amount, 0))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expenses.map((e: any) => (
                    <div key={e._id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800">{e.title}</h4>
                          <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded text-sm">{fmtVND(e.amount)}</span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-3"><Clock className="w-3 h-3" /> {fmtDateTime(e.createdAt)}</p>
                        {e.description && <p className="text-sm text-slate-600 mb-3">{e.description}</p>}
                      </div>
                      {e.receiptUrl && (
                        <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="block mt-auto w-full h-32 relative rounded-xl overflow-hidden border border-slate-200 group">
                          <Image src={e.receiptUrl} alt="Hóa đơn" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold px-3 py-1 bg-black/50 rounded-full">Xem hóa đơn</span>
                          </div>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASSENGERS TAB */}
        {activeTab === "passengers" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {passengers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Chưa có hành khách nào đặt chuyến đi này.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Mã đơn</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Người đặt</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Liên hệ</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Số lượng</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Điểm danh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {passengers.map((pax: any) => {
                      // Kiểm tra xem đơn này có bị report no-show không
                      const isNoShow = report?.noShowBookingIds?.includes(pax._id);
                      return (
                        <tr key={pax._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{pax._id.slice(-6).toUpperCase()}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{pax.fullName}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div>{pax.phoneNumber}</div>
                            <div className="text-xs text-slate-400">{pax.email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {(pax.numAdults || 0) + (pax.numChildren || 0)} khách
                          </td>
                          <td className="px-6 py-4">
                            {isNoShow ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded-full">Vắng mặt (No-show)</span>
                            ) : tour.status === "completed" || tour.status === "closed" ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">Đã tham gia</span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Chưa chốt</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
