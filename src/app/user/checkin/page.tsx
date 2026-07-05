"use client";

import Link from "next/link";
import { MapPin, ArrowLeft, Compass } from "lucide-react";

export default function CheckinPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-950 to-indigo-800 flex items-center justify-center shadow-xl shadow-blue-900/20">
          <MapPin className="w-10 h-10 text-white" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-600 mb-4">
          <Compass className="w-3.5 h-3.5" />
          Sắp ra mắt
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Check-in địa điểm du lịch
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Tính năng check-in điểm đến đang được phát triển. Bạn sẽ sớm có thể
          ghi dấu hành trình, chia sẻ kỷ niệm và tích lũy điểm thưởng tại mỗi điểm đến.
        </p>

        <Link
          href="/user/map"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-950 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Về trang bản đồ
        </Link>
      </div>
    </main>
  );
}
