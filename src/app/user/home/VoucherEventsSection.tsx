"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Copy, TicketPercent } from "lucide-react";
import { voucherApi, type PublicVoucher } from "@/lib/voucher/voucherApi";
import SectionHeader from "@/components/ui/SectionHeader";

const vnd = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value)
    : "0đ";

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Đang cập nhật";

const discountLabel = (voucher: PublicVoucher) =>
  voucher.discountType === "percent"
    ? `Giảm ${voucher.discountValue}%`
    : `Giảm ${vnd(voucher.discountValue)}`;

function SkeletonCard() {
  return (
    <div className="flex h-[110px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="w-[100px] animate-pulse bg-slate-200 flex-shrink-0" />
      <div className="flex flex-1 flex-col justify-between px-4 py-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-full animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

function VoucherCard({
  voucher,
  copiedCode,
  onCopy,
}: {
  voucher: PublicVoucher;
  copiedCode: string | null;
  onCopy: (code: string) => void;
}) {
  const copied = copiedCode === voucher.code;

  return (
    <article className="group relative flex overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/60">

      {/* Left — discount highlight */}
      <Link
        href={`/user/vouchers/${voucher._id}`}
        className="relative flex w-[100px] flex-shrink-0 flex-col items-center justify-center bg-gradient-to-b from-orange-500 to-amber-500 px-3 py-5 text-white"
      >
        {/* Notch circles */}
        <span className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white/90 border border-orange-100 z-10" />

        <TicketPercent className="h-5 w-5 opacity-70 mb-2" />
        <span className="text-2xl font-black tabular-nums leading-none">
          {voucher.discountType === "percent"
            ? `${voucher.discountValue}%`
            : vnd(voucher.discountValue)}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">
          {voucher.discountType === "percent" ? "Giảm" : "Tiết kiệm"}
        </span>
      </Link>

      {/* Dashed separator */}
      <div className="flex flex-col justify-center px-0.5">
        <div className="h-full w-px border-l-2 border-dashed border-orange-100" />
      </div>

      {/* Right — info */}
      <div className="flex flex-1 flex-col justify-between gap-2 px-4 py-4">
        <div>
          <Link href={`/user/vouchers/${voucher._id}`}>
            <h3 className="line-clamp-1 text-[14px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
              {voucher.name}
            </h3>
          </Link>
          <p className="mt-0.5 line-clamp-1 text-[12px] text-slate-400">
            {voucher.description || "Ưu đãi đặc biệt dành cho khách hàng Travela"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3 text-orange-400" />
            HSD: {formatDate(voucher.validUntil)}
          </span>
          <span className="inline-flex items-center gap-1">
            <TicketPercent className="h-3 w-3 text-orange-400" />
            Tối thiểu {vnd(voucher.minOrderValue || 0)}
          </span>
        </div>

        {/* Code bar */}
        <button
          type="button"
          onClick={() => onCopy(voucher.code)}
          className="flex w-full items-center justify-between rounded-lg border border-dashed border-orange-300 bg-orange-50 px-3 py-2 transition hover:bg-orange-100"
        >
          <span className="font-mono text-[13px] font-bold tracking-widest text-orange-700">
            {voucher.code}
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${copied ? "text-blue-950" : "text-orange-500"}`}>
            <Copy className="h-3 w-3" />
            {copied ? "Đã copy!" : "Copy"}
          </span>
        </button>
      </div>
    </article>
  );
}

export default function VoucherEventsSection() {
  const [vouchers, setVouchers] = useState<PublicVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    voucherApi
      .getPublicVouchers(6)
      .then((data) => {
        if (mounted) setVouchers(data);
      })
      .catch(() => {
        if (mounted) setVouchers([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      setCopiedCode(null);
    }
  };

  if (!loading && vouchers.length === 0) return null;

  return (
    <section className="px-4 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeader
          title="Voucher du lịch"
          subtitle="Lưu mã ưu đãi và dùng ngay khi đặt tour phù hợp"
        />

        <div className="grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : vouchers.slice(0, 6).map((voucher) => (
                <VoucherCard
                  key={voucher._id}
                  voucher={voucher}
                  copiedCode={copiedCode}
                  onCopy={copyCode}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
