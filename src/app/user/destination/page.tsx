"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CardHot from "@/components/cards/CardHot";
import TourFilter, { type TourFilterValue } from "@/components/TourFilter";
import { useGetTours } from "#/hooks/tours-hook/useTours";

/* Helpers */
const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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

const PAGE_SIZE = 12;
const DEFAULT_PERCENT = 0;

export default function DestinationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // URL -> state
  const initialPage = Math.max(1, Number(sp.get("page") || 1));
  const qFromUrl = sp.get("q") || "";
  const destFromUrl = sp.get("destination") || ""; // có thể đã là slug hoặc chưa
  const fromDateUrl = sp.get("from") || undefined;
  const budgetMinUrl = Number(sp.get("budgetMin") || 0);
  const budgetMaxUrl = Number(sp.get("budgetMax") || 1_000_000_000);

  const [page, setPage] = useState<number>(initialPage);
  const [filters, setFilters] = useState<TourFilterValue>({
    from: undefined,
    to: destFromUrl || undefined, // dropdown hiển thị dạng text
    date: fromDateUrl,
    days: "",
    keyword: qFromUrl,
    budget: [budgetMinUrl, budgetMaxUrl],
  });

  // debounce keyword
  const [kwDebounced, setKwDebounced] = useState(qFromUrl);
  useEffect(() => {
    const t = setTimeout(
      () => setKwDebounced((filters.keyword || "").trim()),
      350
    );
    return () => clearTimeout(t);
  }, [filters.keyword]);

  // đổi filter -> về trang 1
  useEffect(() => {
    setPage(1);
  }, [kwDebounced, filters.to, filters.date, filters.days, filters.budget]);

  // Query gửi API (slug destination và đẩy nhiều key đồng nghĩa)
  const queryForApi = useMemo(() => {
    const destSlug = filters.to ? slugify(filters.to) : undefined;
    return {
      q: kwDebounced || undefined, // giữ keyword gốc
      destination: destSlug || undefined, // chuẩn hoá slug
      from: filters.date || undefined, // YYYY-MM-DD
      budgetMin: filters.budget?.[0] ?? 0,
      budgetMax: filters.budget?.[1] ?? 1_000_000_000,
    };
  }, [kwDebounced, filters.to, filters.date, filters.budget]);

  // gọi API (server-side pagination)
  const { data, isLoading, isError } = useGetTours(
    page,
    PAGE_SIZE,
    queryForApi
  );

  const tours = data?.data ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  // Đồng bộ URL
  useEffect(() => {
    const params = new URLSearchParams(sp.toString());

    params.set("page", String(currentPage));
    queryForApi.q ? params.set("q", String(queryForApi.q)) : params.delete("q");
    // luôn lưu destination là slug trong URL
    queryForApi.destination
      ? params.set("destination", String(queryForApi.destination))
      : params.delete("destination");
    queryForApi.from
      ? params.set("from", String(queryForApi.from))
      : params.delete("from");
    params.set("budgetMin", String(queryForApi.budgetMin ?? 0));
    params.set("budgetMax", String(queryForApi.budgetMax ?? 1_000_000_000));

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    queryForApi.q,
    queryForApi.destination,
    queryForApi.from,
    queryForApi.budgetMin,
    queryForApi.budgetMax,
  ]);

  // Options dropdown
  const fromOptions = useMemo(() => {
    const set = new Set<string>();
    tours.forEach((t: any) => t?.departure && set.add(String(t.departure)));
    if (set.size === 0)
      ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"].forEach((s) => set.add(s));
    return Array.from(set);
  }, [tours]);

  const toOptions = useMemo(() => {
    const set = new Set<string>();
    tours.forEach((t: any) => {
      if (t?.destination) set.add(String(t.destination));
      else if (t?.destinationSlug) set.add(titleFromSlug(t.destinationSlug));
    });
    if (filters.to && !set.has(filters.to)) set.add(filters.to);
    return Array.from(set);
  }, [tours, filters.to]);

  // pagination numbers
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
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
          <Link
            href="#list"
            className="rounded-2xl bg-[var(--primary,#16a34a)] px-5 py-2.5 text-white shadow-lg shadow-emerald-600/20 transition hover:brightness-110"
          >
            Xem tour
          </Link>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto grid w-[92%] max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <TourFilter
            value={filters}
            onChange={(v) => setFilters(v)}
            onSubmit={() => setPage(1)}
            fromOptions={fromOptions}
            toOptions={toOptions}
          />
        </aside>

        {/* Grid */}
        <main id="list" className="pb-14">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-semibold">Tour nổi bật</h2>
            <span className="text-sm text-slate-600">
              Trang {currentPage}/{totalPages} · Tổng{" "}
              {total.toLocaleString("vi-VN")} tour
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
          ) : tours.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur">
              Không tìm thấy tour khớp bộ lọc.
            </div>
          ) : (
            <>
              <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tours.map((t: any) => {
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
                      badgeText="Khởi hành hàng tuần"
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
