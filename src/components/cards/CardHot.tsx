// components/cards/CardHot.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Clock3, Plane, CalendarDays, Users2 } from "lucide-react";

export type CardHotProps = {
  image: string;
  title: string;
  subtitle?: string;
  badgeText?: string;

  originalPrice?: number | string;
  salePrice?: number | string;
  discountPercent?: number;
  discountAmount?: number;

  href?: string;

  // Thông tin tour
  time?: string;
  destination?: string;
  schedule?: string; // ví dụ "Khởi hành: 11/9/2025"
  seats?: number | string; // 👈 còn bao nhiêu chỗ

  // Giữ tương thích cũ
  meta?: {
    duration?: string;
    destination?: string;
    schedule?: string;
    seats?: number | string;
  };
};

/* ============== helpers ============== */
const toNumber = (v?: number | string) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d]/g, ""));
    return Number.isNaN(n) ? undefined : n;
  }
};
const vnd = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) +
      "đ"
    : "—";

/* ============== component ============== */
export default function CardHot(props: CardHotProps) {
  const {
    image,
    title,
    subtitle,
    badgeText,
    originalPrice,
    salePrice,
    discountPercent,
    discountAmount,
    href = "#",
  } = props;

  // ---- pricing ----
  const originalNum = toNumber(originalPrice);
  let saleNum = toNumber(salePrice);

  if (saleNum == null && originalNum != null) {
    if (typeof discountPercent === "number") {
      saleNum = Math.max(
        0,
        Math.round(originalNum * (1 - discountPercent / 100))
      );
    } else if (typeof discountAmount === "number") {
      saleNum = Math.max(0, Math.round(originalNum - discountAmount));
    }
  }
  const hasSale =
    originalNum != null && saleNum != null && saleNum < originalNum;
  const priceToShow = hasSale ? saleNum : saleNum ?? originalNum;

  // ---- tour info (ưu tiên meta nếu có) ----
  const durationText = props.meta?.duration ?? props.time;
  const destinationTxt = props.meta?.destination ?? props.destination;
  const scheduleText = props.meta?.schedule ?? props.schedule;
  const seatsText = props.meta?.seats ?? props.seats;

  return (
    <article
      className="
        group flex h-full flex-col overflow-hidden
        rounded-[20px] border border-orange-300/60 bg-white
        shadow-sm transition hover:-translate-y-[2px] hover:shadow-md
      "
    >
      {/* media */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {badgeText && (
          <div className="absolute left-3 top-3 rounded-full bg-orange-500/95 px-3 py-1 text-[12px] font-semibold text-white shadow">
            {badgeText}
          </div>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
        <h3 className="line-clamp-2 text-[18px] sm:text-[19px] font-extrabold leading-snug text-[#1e429f]">
          {title}
        </h3>
        {subtitle && (
          <p className="line-clamp-1 text-[13px] text-slate-500">{subtitle}</p>
        )}

        {/* tour info */}
        {(durationText || destinationTxt || scheduleText || seatsText) && (
          <ul className="mt-1 space-y-1.5 text-[14px] text-slate-800">
            {durationText && (
              <li className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#1e429f]" />
                <span className="font-semibold">{durationText}</span>
              </li>
            )}
            {destinationTxt && (
              <li className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-[#1e429f]" />
                <span className="font-semibold lowercase first-letter:uppercase">
                  {destinationTxt}
                </span>
              </li>
            )}
            {scheduleText && (
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#1e429f]" />
                <span className="font-semibold">{scheduleText}</span>
              </li>
            )}
            {seatsText != null && seatsText !== "" && (
              <li className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-[#1e429f]" />
                <span className="font-semibold">Còn {seatsText} chỗ</span>
              </li>
            )}
          </ul>
        )}

        {/* footer */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="min-w-0 leading-none">
            {hasSale && (
              <div className="text-[12px] text-slate-500">
                <span className="whitespace-nowrap tabular-nums line-through">
                  {vnd(originalNum)}
                </span>
              </div>
            )}
            <div
              className="
                whitespace-nowrap tabular-nums font-extrabold text-[#1e429f]
                text-[20px] sm:text-[22px] md:text-[24px] lg:text-[26px]
              "
            >
              {vnd(priceToShow)}
            </div>
          </div>

          <Link
            href={props.href ?? "#"}
            className="
              inline-flex items-center justify-center
              rounded-full border border-[#ea580c]
              px-4 py-2 text-[13px] font-semibold text-[#ea580c]
              transition hover:bg-[#ea580c] hover:text-white
            "
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
