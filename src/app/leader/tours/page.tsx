"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar, MapPin, Users, ChevronRight, Plane, Search, X, Filter,
  LayoutGrid, List, Clock,
} from "lucide-react";
import { leaderToursApi, LeaderTour } from "@/lib/leader/leaderApi";
import AdminPagination from "@/components/admin/AdminPagination";

const STATUS_CFG: Record<string, { bg: string; text: string; border: string; dot: string; label: string; bar: string; pill: string }> = {
  pending:     { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  dot: "bg-amber-500",   label: "Chờ xác nhận",  bar: "from-amber-400 to-amber-500",    pill: "bg-amber-500/90 text-white" },
  confirmed:   { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",   dot: "bg-blue-500",    label: "Đã xác nhận",   bar: "from-blue-400 to-blue-500",      pill: "bg-blue-500/90 text-white" },
  in_progress: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200",dot: "bg-emerald-500", label: "Đang diễn ra",  bar: "from-emerald-400 to-emerald-500",pill: "bg-emerald-500 text-white" },
  completed:   { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200",  dot: "bg-slate-400",   label: "Hoàn thành",    bar: "from-slate-300 to-slate-400",    pill: "bg-white/90 text-slate-700" },
  closed:      { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",    dot: "bg-red-500",     label: "Đã đóng",       bar: "from-red-400 to-red-500",        pill: "bg-red-500/90 text-white" },
};

const FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "in_progress", label: "Đang diễn ra" },
  { value: "confirmed",   label: "Đã xác nhận" },
  { value: "pending",     label: "Chờ xác nhận" },
  { value: "completed",   label: "Hoàn thành" },
  { value: "closed",      label: "Đã đóng" },
];

function GridSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-36 bg-slate-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-2 bg-slate-100 rounded-full mt-3" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex gap-4">
      <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
        <div className="h-3 w-1/2 bg-slate-100 rounded" />
        <div className="h-2 bg-slate-100 rounded-full" />
      </div>
      <div className="h-6 w-24 bg-slate-100 rounded-full flex-shrink-0 self-start" />
    </div>
  );
}

export default function LeaderToursPage() {
  const [tours, setTours]               = useState<LeaderTour[]>([]);
  const [filteredTours, setFiltered]    = useState<LeaderTour[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [statusFilter, setStatus]       = useState("");
  const [searchTerm, setSearch]         = useState("");
  const [page, setPage]                 = useState(1);
  const limit = 5;
  const [viewMode, setViewMode]         = useState<"grid" | "list">("grid");

  useEffect(() => {
    setIsLoading(true);
    leaderToursApi.getMyTours()
      .then(d => {
        // Sort newest first based on startDate
        const sorted = [...d].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setTours(sorted);
        setFiltered(sorted);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let result = tours;
    if (statusFilter) {
      result = result.filter(t => t.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const lo = searchTerm.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(lo) || t.destination.toLowerCase().includes(lo));
    }
    setFiltered(result);
    setPage(1); // Reset page on filter
  }, [searchTerm, statusFilter, tours]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const formatShort = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  const countOf = (s: string) => tours.filter(t => t.status === s).length;

  const getDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="p-4 md:p-6 lg:p-8 space-y-5">

        {/* Header banner */}
        <div className="relative overflow-hidden rounded-2xl
          bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 shadow-lg shadow-blue-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(249,115,22,0.2),transparent_55%)]" />
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute right-8 bottom-0 opacity-10">
            <Plane className="w-32 h-32 text-white -rotate-12" />
          </div>
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30
                  rounded-full px-3 py-1 text-xs font-semibold text-orange-200 mb-3">
                  <Plane className="w-3 h-3" /> Lịch trình phân công
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Tour của tôi</h1>
                <p className="text-blue-200/70 text-sm mt-1">Quản lý và theo dõi các tour được phân công</p>
              </div>
              {!isLoading && (
                <div className="flex gap-5 bg-white/10 backdrop-blur-sm border border-white/20
                  rounded-2xl px-6 py-4 flex-shrink-0">
                  {[
                    { label: "Tổng", value: tours.length, color: "text-white" },
                    { label: "Đang chạy", value: countOf("in_progress"), color: "text-emerald-300" },
                    { label: "Sắp đi", value: countOf("confirmed"), color: "text-amber-300" },
                    { label: "Hoàn thành", value: countOf("completed"), color: "text-slate-300" },
                  ].map((s, i, arr) => (
                    <div key={s.label} className="flex items-center gap-4">
                      <div className="text-center">
                        <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-blue-300 mt-0.5">{s.label}</p>
                      </div>
                      {i < arr.length - 1 && <div className="w-px h-8 bg-white/20" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search + Filter + View Toggle */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên tour, điểm đến..."
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-slate-200 text-slate-800
                  placeholder-slate-400 text-sm shadow-sm
                  focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* View mode toggle */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex-shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                title="Dạng lưới">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                title="Dạng danh sách">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {FILTERS.map(f => {
              const active = statusFilter === f.value;
              const count  = f.value === "" ? tours.length : countOf(f.value);
              return (
                <button key={f.value} onClick={() => setStatus(f.value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm
                    font-medium transition-all duration-200 border
                    ${active
                      ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                      : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600"
                    }`}>
                  {f.label}
                  {!isLoading && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                      ${active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tour list */}
        {isLoading ? (
          viewMode === "grid"
            ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{Array(6).fill(0).map((_, i) => <GridSkeleton key={i} />)}</div>
            : <div className="space-y-3">{Array(5).fill(0).map((_, i) => <ListSkeleton key={i} />)}</div>
        ) : filteredTours.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">
              {searchTerm ? "Không tìm thấy tour" : "Không có tour"}
            </h3>
            <p className="text-slate-400 text-sm">
              {searchTerm ? `Không có tour khớp "${searchTerm}"` : "Chưa có tour với trạng thái này"}
            </p>
            {(searchTerm || statusFilter) && (
              <button onClick={() => { setSearch(""); setStatus(""); }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200
                  text-sm text-slate-600 hover:bg-slate-200 transition-all">
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* ── GRID VIEW ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTours.map(tour => {
              const cfg      = STATUS_CFG[tour.status] || STATUS_CFG.pending;
              const capacity = tour.quantity ?? 0;
              const pct      = capacity > 0 ? Math.round((tour.bookedCount||0)/capacity*100) : 0;
              const img      = (tour as any).tourId?.images?.[0];
              const days     = getDuration(tour.startDate, tour.endDate);
              return (
                <Link key={tour._id} href={`/leader/tours/${tour._id}`}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-orange-300
                    hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden shadow-sm">
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-blue-900 to-indigo-900 overflow-hidden">
                    {img ? (
                      <img src={img} alt={tour.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(249,115,22,0.3),transparent_70%)]" />
                        <Plane className="absolute bottom-2 right-3 w-16 h-16 text-white/10 -rotate-12" />
                      </>
                    )}
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${cfg.pill}`}>
                        {tour.status === "in_progress" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        {cfg.label}
                      </span>
                    </div>
                    {/* Duration badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 bg-black/40 text-white text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">
                        <Clock className="w-3 h-3" />{days}N
                      </span>
                    </div>
                    {/* Destination overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                      <p className="text-white text-xs font-medium flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-orange-300" /> {tour.destination}
                      </p>
                    </div>
                  </div>
                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-2 text-sm leading-snug mb-2">
                      {tour.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>{formatShort(tour.startDate)} – {formatShort(tour.endDate)}</span>
                    </div>
                    {/* Progress */}
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${cfg.bar} rounded-full transition-all duration-700`}
                          style={{width:`${pct}%`}} />
                      </div>
                      <span className="text-xs text-slate-500 font-semibold w-14 text-right whitespace-nowrap">
                        {tour.bookedCount||0}/{capacity}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="space-y-3">
            {filteredTours.slice((page - 1) * limit, page * limit).map(tour => {
              const cfg      = STATUS_CFG[tour.status] || STATUS_CFG.pending;
              const capacity = tour.quantity ?? 0;
              const pct      = capacity > 0 ? Math.round((tour.bookedCount||0)/capacity*100) : 0;
              const img      = (tour as any).tourId?.images?.[0];
              return (
                <Link key={tour._id} href={`/leader/tours/${tour._id}`}
                  className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-200
                    hover:border-orange-300 hover:shadow-md transition-all duration-200 p-4 shadow-sm overflow-hidden">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-800 to-indigo-900">
                    {img ? (
                      <img src={img} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Plane className="w-7 h-7 text-white/40" />
                      </div>
                    )}
                  </div>
                  {/* Status bar */}
                  <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${cfg.bar} flex-shrink-0`} />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                      {tour.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{tour.destination}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                        {formatDate(tour.startDate)} – {formatDate(tour.endDate)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{tour.bookedCount||0}/{capacity} khách</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 max-w-xs">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${cfg.bar} rounded-full transition-all duration-700`}
                          style={{width:`${pct}%`}} />
                      </div>
                      <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  {/* Status + Arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${tour.status==="in_progress"?"animate-pulse":""}`} />
                      {cfg.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Summary and Pagination */}
        {!isLoading && filteredTours.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
            <AdminPagination
              currentPage={page}
              totalPages={Math.ceil(filteredTours.length / limit) || 1}
              onPageChange={setPage}
              totalItems={filteredTours.length}
              itemsLabel="tour"
              activeColor="orange"
            />
          </div>
        )}
      </div>
    </div>
  );
}
