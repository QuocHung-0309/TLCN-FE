"use client";

import Link from "next/link";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Home, History } from "lucide-react";

/**
 * Trang xác nhận đặt tour thành công
 */
export default function BookingSuccessPage() {
  const searchParams = useSearchParams();

  // Tự động đọc 'bookingId' và 'email' từ thanh URL
  // Ví dụ: .../success?bookingId=BK12345&email=user@example.com
  const bookingId = searchParams.get("bookingId");
  const email = searchParams.get("email");

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-20 min-h-screen">
      <div className="mx-auto max-w-2xl">
        {/* Card thông báo chính */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_30px_-15px_rgba(2,6,23,0.18)]"
        >
          <div className="text-center">
            {/* 1. Icon Success (với hiệu ứng "nảy") */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              <CheckCircle className="mx-auto h-20 w-20 text-emerald-500" />
            </motion.div>

            {/* 2. Tiêu đề và lời nhắn */}
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
              Đặt tour thành công!
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi.
              {email ? (
                <>
                  <br />
                  Thông tin xác nhận đã được gửi đến email <b>{email}</b>.
                </>
              ) : (
                " Vui lòng kiểm tra email để xem thông tin xác nhận."
              )}
            </p>

            {/* 3. Chi tiết đơn hàng (nếu có) */}
            {bookingId && (
              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
                <h3 className="font-semibold text-slate-800">
                  Chi tiết đặt chỗ:
                </h3>
                <div className="mt-4 space-y-2">
                  <Row label="Mã đặt chỗ:" value={bookingId} isMono />
                  {email && <Row label="Email:" value={email} />}
                  <Row
                    label="Tình trạng:"
                    value="Đã xác nhận"
                    valueClass="font-semibold text-emerald-600"
                  />
                </div>
              </div>
            )}

            {/* 4. Nút hành động */}
            <div className="mt-10 flex flex-col sm:flex-row sm:justify-center sm:gap-4">
              <ButtonPrimary href="/">
                <Home size={18} className="mr-2" />
                Về trang chủ
              </ButtonPrimary>
              <ButtonSecondary href="/user/history">
                <History size={18} className="mr-2" />
                Xem lịch sử đặt tour
              </ButtonSecondary>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

/** * ======================================================
 * UI Components (Helper) - Giúp code ở trên sạch sẽ hơn
 * ======================================================
 */

// Component Row để hiển thị thông tin
function Row({
  label,
  value,
  isMono,
  valueClass = "",
}: {
  label: string;
  value: string;
  isMono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <span className="text-slate-600">{label}</span>
      <span
        className={`font-medium text-slate-900 ${
          isMono ? "font-mono" : ""
        } ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

// Nút chính (Button Primary)
function ButtonPrimary({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold transition bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      {children}
    </Link>
  );
}

// Nút phụ (Button Secondary)
function ButtonSecondary({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mt-3 sm:mt-0 relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold transition border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      {children}
    </Link>
  );
}
