"use client";

import React from "react";

export type DayBucket = "1-4" | "5-8" | "9-12" | "14+";

export type TourFilterValue = {
  from?: string;
  to?: string;
  date?: string; // yyyy-mm-dd
  days?: DayBucket | "";
  keyword?: string;
  budget: [number, number]; // VND
};

type Props = {
  value: TourFilterValue;
  onChange: (v: TourFilterValue) => void;
  onSubmit: () => void;
  fromOptions: string[]; // danh sách điểm khởi hành
  toOptions: string[]; // danh sách điểm đến
};

const currency = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  })
    .format(n)
    .replace(/\s?₫$/, " đ");

export default function TourFilter({
  value,
  onChange,
  onSubmit,
  fromOptions,
  toOptions,
}: Props) {
  const set = (patch: Partial<TourFilterValue>) =>
    onChange({ ...value, ...patch });

  // slider kép: 2 input range phối hợp
  const min = 0;
  const max = 1_000_000_000;
  const step = 50_000;

  const [minVal, maxVal] = value.budget;

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      {/* FROM */}
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1d4ed8]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className="text-[#1d4ed8]"
        >
          <path
            fill="currentColor"
            d="m21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8L2 13v2l8-2.5V19l-2 1.5V22l3-1l3 1v-1.5L11 19v-5.5z"
          />
        </svg>
        Điểm khởi hành
      </label>
      <select
        value={value.from ?? ""}
        onChange={(e) => set({ from: e.target.value || undefined })}
        className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Chọn</option>
        {fromOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* TO */}
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1d4ed8]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className="rotate-180 text-[#1d4ed8]"
        >
          <path
            fill="currentColor"
            d="m21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8L2 13v2l8-2.5V19l-2 1.5V22l3-1l3 1v-1.5L11 19v-5.5z"
          />
        </svg>
        Điểm đến
      </label>
      <select
        value={value.to ?? ""}
        onChange={(e) => set({ to: e.target.value || undefined })}
        className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Chọn</option>
        {toOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* DATE */}
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1d4ed8]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className="text-[#1d4ed8]"
        >
          <path
            fill="currentColor"
            d="M7 2v2H5a2 2 0 0 0-2 2v1h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zM3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9zm2 2h4v4H5zm6 0h4v4h-4zm6 0h2v2h-2zm0 4h2v2h-2zM5 17h4v3H5zm6 0h4v3h-4z"
          />
        </svg>
        Ngày khởi hành
      </label>
      <input
        type="date"
        value={value.date ?? ""}
        onChange={(e) => set({ date: e.target.value || undefined })}
        className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="dd/mm/yyyy"
      />

      {/* DAYS */}
      <div className="mb-2 text-sm font-semibold text-[#1d4ed8] flex items-center gap-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className="text-[#1d4ed8]"
        >
          <path fill="currentColor" d="M15 11V4H9v7H4v6h5v7h6v-7h5v-6z" />
        </svg>
        Số ngày
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {(["1-4", "5-8", "9-12", "14+"] as DayBucket[]).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => set({ days: value.days === b ? "" : b })}
            className={`rounded-lg border px-3 py-2 text-sm ${
              value.days === b
                ? "border-blue-600 text-blue-700 bg-blue-50"
                : "border-slate-300 text-slate-700 hover:border-blue-400"
            }`}
          >
            {b === "14+" ? "Trên 14 ngày" : `${b} ngày`}
          </button>
        ))}
      </div>
      <input
        value={value.keyword ?? ""}
        onChange={(e) => set({ keyword: e.target.value || undefined })}
        placeholder="Khác…"
        className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* BUDGET */}
      <div className="mb-2 text-sm font-semibold text-[#1d4ed8]">
        Ngân sách của quý khách
      </div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-700">
        <span>
          Giá từ: <b>{currency(minVal)}</b>
        </span>
        <span>
          đến: <b>{currency(maxVal)}</b>
        </span>
      </div>

      {/* twin range sliders */}
      <div className="relative my-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), maxVal - step);
            set({ budget: [v, maxVal] });
          }}
          className="pointer-events-auto absolute z-10 h-2 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), minVal + step);
            set({ budget: [minVal, v] });
          }}
          className="pointer-events-auto absolute z-10 h-2 w-full appearance-none bg-transparent"
        />
        {/* track */}
        <div className="h-2 w-full rounded-full bg-blue-100 shadow-inner" />
        {/* active range */}
        <div
          className="pointer-events-none absolute top-0 h-2 rounded-full bg-blue-500/70 blur-[1px]"
          style={{
            left: `${((minVal - min) / (max - min)) * 100}%`,
            width: `${((maxVal - minVal) / (max - min)) * 100}%`,
          }}
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="mt-4 w-full rounded-lg bg-[#ea580c] px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white shadow hover:brightness-110"
      >
        Tìm kiếm tour
      </button>
    </aside>
  );
}
