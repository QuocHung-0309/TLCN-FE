"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CardHot from "@/components/cards/CardHot";
import TourFilter, { type TourFilterValue } from "@/components/TourFilter";
import { useGetTours } from "#/hooks/tours-hook/useTours";
import { getTours } from "@/lib/tours/tour";

/* ========= Helpers ========= */

// cùng kiểu bucket với TourFilter
type DayBucket = "1-4" | "5-8" | "9-12" | "14+";

// slug cho URL chi tiết tour
const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// bỏ dấu + chuẩn hoá chuỗi cho BE (/api/tours/search dùng "ha noi", "vinh ha long")
const normalizeForSearch = (s?: string) => {
  if (!s) return undefined;
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      // @ts-ignore
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
};

const titleFromSlug = (s?: string) => (s ? s.replace(/-/g, " ") : "");
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN") : "";
const toNum = (v?: number | string) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d]/g, ""));
    return Number.isNaN(n) ? undefined : n;
  }
};

const computePercent = (t: any): number | undefined => {
  if (typeof t?.discountPercent === "number" && t.discountPercent > 0)
    return Math.round(t.discountPercent);
  const origin = toNum(t?.priceAdult);
  if (!origin || origin <= 0) return undefined;
  let sale = toNum(t?.salePrice);
  if (sale == null && typeof t?.discountAmount === "number")
    sale = Math.max(0, origin - t.discountAmount);
  if (typeof sale === "number" && sale < origin)
    return Math.round((1 - sale / origin) * 100);
  return undefined;
};

const pickTourImage = (t: any): string => {
  const imgs = Array.isArray(t?.images) ? t.images.filter(Boolean) : [];
  if (imgs.length > 0) {
    const seed = String(t?._id ?? t?.id ?? t?.title ?? "");
    let hash = 0;
    for (let i = 0; i < seed.length; i++)
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return imgs[hash % imgs.length];
  }
  return t?.image ?? t?.cover ?? "/hot1.jpg";
};

// chuyển bucket số ngày -> khoảng ngày
const bucketToRange = (b?: DayBucket | ""): [number, number] | null => {
  switch (b) {
    case "1-4":
      return [1, 4];
    case "5-8":
      return [5, 8];
    case "9-12":
      return [9, 12];
    case "14+":
      return [14, Infinity];
    default:
      return null;
  }
};

// đoán số ngày của tour từ time / startDate-endDate / itinerary
const getDurationDays = (t: any): number | undefined => {
  if (t.time && typeof t.time === "string") {
    const m = t.time.match(/(\d+)\s*ngày/i);
    if (m) {
      const d = Number(m[1]);
      if (Number.isFinite(d) && d > 0) return d;
    }
  }

  if (t.startDate && t.endDate) {
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (Number.isFinite(diff) && diff > 0) return Math.round(diff);
  }

  if (Array.isArray(t.itinerary) && t.itinerary.length > 0) {
    return t.itinerary.length;
  }

  return undefined;
};

const PAGE_SIZE = 12;
const DEFAULT_PERCENT = 0;

type SearchQuery = {
  q?: string;
  destination?: string;
  from?: string; // YYYY-MM-DD
  budgetMin?: number;
  budgetMax?: number;
};

export default function DestinationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // ===== 1. Init từ URL =====
  const initialPage = Math.max(1, Number(sp.get("page") || 1));
  const qFromUrl = sp.get("q") || "";
  const destFromUrl = sp.get("destination") || "";
  const fromDateUrl = sp.get("from") || undefined;
  const budgetMinUrl = Number(sp.get("budgetMin") || 0);
  const budgetMaxUrl = Number(sp.get("budgetMax") || 1_000_000_000);
  const daysFromUrl = (sp.get("days") || "") as DayBucket | "";

  // UI filter state
  const [filters, setFilters] = useState<TourFilterValue>({
    from: undefined,
    to: destFromUrl || undefined, // hiển thị text trong dropdown
    date: fromDateUrl,
    days: daysFromUrl,
    keyword: qFromUrl,
    budget: [budgetMinUrl, budgetMaxUrl],
  });

  // Query thực gửi BE
  const [apiQuery, setApiQuery] = useState<SearchQuery>({
    q: normalizeForSearch(qFromUrl) || undefined,
    destination: normalizeForSearch(destFromUrl) || undefined,
    from: fromDateUrl,
    budgetMin: budgetMinUrl || 0,
    budgetMax: budgetMaxUrl || 1_000_000_000,
  });

  // Phân trang
  const [page, setPage] = useState<number>(initialPage);

  // ===== 2. GỌI API /api/tours/search cho list bên phải =====
  const { data, isLoading, isError } = useGetTours(page, PAGE_SIZE, apiQuery);

  const tours = data?.data ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  // ===== 3. Lấy danh sách điểm khởi hành / điểm đến từ BE (full hơn) =====
  const [fromOptions, setFromOptions] = useState<string[]>([]);
  const [toOptions, setToOptions] = useState<string[]>([]);

  useEffect(() => {
    // fetch 1 lần đủ nhiều tour để build options
    (async () => {
      try {
        const res = await getTours(1, 200, {}); // tuỳ backend max limit
        const depSet = new Set<string>();
        const destSet = new Set<string>();

        res.data.forEach((t: any) => {
          if (t.departure) depSet.add(String(t.departure));
          if (t.destination) destSet.add(String(t.destination));
          else if (t.destinationSlug)
            destSet.add(titleFromSlug(t.destinationSlug));
        });

        setFromOptions(Array.from(depSet));
        setToOptions(Array.from(destSet));
      } catch (err) {
        console.error("Không tải được danh sách điểm đi/điểm đến", err);
      }
    })();
  }, []);

  // ===== 4. Lọc theo Số ngày ở phía client =====
  const visibleTours = useMemo(() => {
    const range = bucketToRange(filters.days as DayBucket | "");
    if (!range) return tours;
    const [minDays, maxDays] = range;

    return tours.filter((t: any) => {
      const d = getDurationDays(t);
      if (!d) return false; // không biết số ngày thì cho out luôn
      if (!Number.isFinite(maxDays)) return d >= minDays; // 14+
      return d >= minDays && d <= maxDays;
    });
  }, [tours, filters.days]);

  const visibleCount = visibleTours.length;

  // ===== 5. Đồng bộ URL với apiQuery + days =====
  useEffect(() => {
    const params = new URLSearchParams();

    params.set("page", String(currentPage));

    if (apiQuery.q) params.set("q", apiQuery.q);
    if (apiQuery.destination) params.set("destination", apiQuery.destination);
    if (apiQuery.from) params.set("from", apiQuery.from);

    params.set("budgetMin", String(apiQuery.budgetMin ?? 0));
    params.set("budgetMax", String(apiQuery.budgetMax ?? 1_000_000_000));

    if (filters.days) params.set("days", String(filters.days));
    else params.delete("days");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, currentPage, apiQuery, filters.days]);

  // ===== 6. Pagination numbers =====
  const pageNumbers = useMemo(() => {
    const arr: (number | "...")[] = [];
    const win = 1;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
      return arr;
    }
    arr.push(1);
    if (currentPage - win > 2) arr.push("...");
    for (
      let i = Math.max(2, currentPage - win);
      i <= Math.min(totalPages - 1, currentPage + win);
      i++
    )
      arr.push(i);
    if (currentPage + win < totalPages - 1) arr.push("...");
    arr.push(totalPages);
    return arr;
  }, [currentPage, totalPages]);

  const goToPage = (n: number) => {
    const next = Math.min(Math.max(1, n), totalPages);
    if (next !== page) {
      setPage(next);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // ===== 7. Khi bấm nút "TÌM KIẾM TOUR" bên trái =====
  const handleSubmitFilter = () => {
    const nextQuery: SearchQuery = {
      q: normalizeForSearch(filters.keyword),
      destination: normalizeForSearch(filters.to),
      from: filters.date || undefined, // map sang param "from"
      budgetMin: filters.budget?.[0] ?? 0,
      budgetMax: filters.budget?.[1] ?? 1_000_000_000,
    };

    setApiQuery(nextQuery);
    setPage(1);
  };

  // ===== 8. Render =====
  return (
    <div className="relative min-h-screen">
      {/* bg nhẹ */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_10%_-10%,rgba(16,185,129,0.10),transparent_60%)]" />
        <div className="absolute -top-24 -left-24 h-[24rem] w-[24rem] rounded-full bg-emerald-200/25 blur-3xl" />
      </div>

      {/* Hero */}
      <header className="mx-auto w-[92%] max-w-6xl pb-4 pt-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-700/80">
              AHH Travel
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Danh sách tour
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Chọn tour ưng ý và đặt ngay.
            </p>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto grid w-[92%] max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Sidebar filter */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <TourFilter
            value={filters}
            onChange={(v) => setFilters(v)}
            onSubmit={handleSubmitFilter}
            fromOptions={fromOptions}
            toOptions={toOptions}
          />
        </aside>

        {/* Grid kết quả */}
        <main id="list" className="pb-14">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-semibold">Tour nổi bật</h2>
            <span className="text-sm text-slate-600">
              Trang {currentPage}/{totalPages} · Hiển thị{" "}
              {visibleCount.toLocaleString("vi-VN")} tour trên trang này · Tổng{" "}
              {total.toLocaleString("vi-VN")} tour trong hệ thống
            </span>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur">
              Đang tải…
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur">
              Không tải được dữ liệu tour.
            </div>
          ) : visibleTours.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur">
              Không tìm thấy tour khớp bộ lọc.
            </div>
          ) : (
            <>
              <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTours.map((t: any) => {
                  const percent = computePercent(t) ?? DEFAULT_PERCENT;
                  const id = t._id ?? t.id ?? "";
                  const slug = t.destinationSlug ?? slugify(t.title);

                  return (
                    <CardHot
                      key={id || t.title}
                      image={pickTourImage(t)}
                      title={t.title}
                      href={`/user/destination/${slug}/${id}`}
                      originalPrice={toNum(t.priceAdult)}
                      salePrice={toNum(t.salePrice)}
                      discountPercent={percent}
                      discountAmount={t.discountAmount}
                      time={t.time}
                      destination={
                        t.destination ?? titleFromSlug(t.destinationSlug)
                      }
                      seats={t.quantity ?? t.seats ?? 0}
                      schedule={
                        t.startText ??
                        (t.startDate
                          ? `Khởi hành: ${fmtDate(t.startDate)}`
                          : undefined)
                      }
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  Trước
                </button>

                {pageNumbers.map((n, idx) =>
                  n === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className="select-none px-2 text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => goToPage(n as number)}
                      className={`rounded-2xl px-3 py-2 text-sm transition ${
                        n === currentPage
                          ? "bg-[var(--primary,#16a34a)] text-white shadow"
                          : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-emerald-500 hover:text-emerald-600"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Sau
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
