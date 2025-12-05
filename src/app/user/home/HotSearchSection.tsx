"use client";

import React, { useMemo } from "react";
import CardHot, { CardHotProps } from "@/components/cards/CardHot";
import { useGetTours } from "#/hooks/tours-hook/useTours";

/* ===== helpers ===== */
const toNum = (v?: number | string) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d]/g, ""));
    return Number.isNaN(n) ? undefined : n;
  }
};

const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const formatDate = (d?: string) => {
  if (!d) return undefined;
  return new Date(d).toLocaleDateString("vi-VN");
};

/* ===== skeleton card ===== */
function Skeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

const HotSearchSection = () => {
  // gọi API: lấy 12 tour
  const { data, isLoading, isError } = useGetTours(1, 12);
  const list = data?.data ?? [];

  // map sang CardHotProps
  const cards: CardHotProps[] = useMemo(
    () =>
      list.map((t) => {
        const id = t._id ?? (t as any).id ?? "";
        const slug = t.destinationSlug ?? slugify(t.title);
        const href = `/user/destination/${slug}/${id}`;

        const originalPrice = toNum(t.salePrice ?? t.priceAdult);
        const image =
          (Array.isArray((t as any).images) && (t as any).images[0]) ||
          t.image ||
          t.cover ||
          "/hot1.jpg";

        // Lấy ngày khởi hành (giả sử API trả về field startDate hoặc start_date)
        const startDateRaw = (t as any).startDate ?? (t as any).start_date;

        return {
          title: t.title,
          image,
          href,

          // --- GIÁ ---
          originalPrice,
          salePrice: (t as any).salePrice,
          discountPercent: (t as any).discountPercent,
          // discountAmount: (t as any).discountAmount, // Nếu có thì uncomment

          // --- THÔNG TIN CHI TIẾT (SỬA PHẦN NÀY) ---
          // Mapping trực tiếp vào các props mà CardHot yêu cầu
          time: t.time ?? "—",
          destination: t.destination ?? "—",
          seats: t.quantity, // Truyền số lượng chỗ còn lại
          schedule: startDateRaw
            ? `Khởi hành: ${formatDate(startDateRaw)}`
            : undefined,

          // Badge (Ví dụ: Giảm giá hoặc tour hot)
          badgeText: (t as any).discountPercent
            ? `Giảm ${(t as any).discountPercent}%`
            : undefined,
        } as CardHotProps;
      }),
    [list]
  );

  return (
    <section className="px-4 pb-12 pt-6">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-5 text-center text-[22px] sm:text-[26px] md:text-[28px] font-extrabold text-[#1b4c75] tracking-wide">
          TOUR CHÍNH
        </h2>

        {/* Error */}
        {isError && !isLoading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Không tải được danh sách tour. Vui lòng thử lại sau.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {/* Loading skeleton */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`sk-${i}`} />
            ))}

          {/* Data */}
          {!isLoading &&
            !isError &&
            cards.map((t) => <CardHot key={`${t.title}-${t.href}`} {...t} />)}
        </div>
      </div>
    </section>
  );
};

export default HotSearchSection;
