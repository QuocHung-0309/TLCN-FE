"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  Globe2,
  ImageIcon,
  Lock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { travelMemoryApi } from "@/lib/checkin/travelMemoryApi";

type TravelMemory = {
  _id: string;
  provinceName: string;
  visitedAt: string;
  caption?: string;
  images?: string[];
  privacy?: "private" | "public";
  source?: "manual" | "tour";
  likesCount?: number;
  commentsCount?: number;
};

type MemoryGroup = {
  provinceName: string;
  memories: TravelMemory[];
};

const DEFAULT_IMAGE = "/hot-destination.svg";

const formatDate = (value?: string) => {
  if (!value) return "Chưa có ngày";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có ngày";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatLongDate = (value?: string) => {
  if (!value) return "Chưa có ngày đi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có ngày đi";

  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const cleanCaption = (caption = "", provinceName = "") => {
  let text = caption.replace(/^\[Seed Journey\]\s*/i, "").trim();
  const provincePrefix = `${provinceName}:`;

  if (text.toLowerCase().startsWith(provincePrefix.toLowerCase())) {
    text = text.slice(provincePrefix.length).trim();
  }

  return text || `Kỷ niệm tại ${provinceName}`;
};

const sourceMeta = (source?: TravelMemory["source"]) => {
  if (source === "tour") {
    return {
      label: "Qua tour AHH",
      icon: BadgeCheck,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
  }

  return {
    label: "Tự đánh dấu",
    icon: MapPin,
    className: "bg-blue-50 text-blue-700 ring-blue-100",
  };
};

const MemoryImageGrid = ({
  images,
  title,
  date,
}: {
  images?: string[];
  title: string;
  date: string;
}) => {
  const safeImages = images?.length ? images.slice(0, 3) : [DEFAULT_IMAGE];
  const layoutClass =
    safeImages.length === 1
      ? "aspect-[16/10]"
      : safeImages.length === 2
        ? "grid h-48 grid-cols-2 gap-1"
        : "grid h-48 grid-cols-2 grid-rows-2 gap-1";

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 ${layoutClass}`}
    >
      {safeImages.map((image, index) => (
        <div
          key={image + index}
          className={`relative overflow-hidden bg-slate-100 ${
            index === 0 && safeImages.length === 3 ? "row-span-2" : ""
          }`}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ))}

      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
        <CalendarDays size={13} />
        {date}
      </div>

      <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
        <Camera size={13} />
        {Math.max(images?.length || 1, 1)} ảnh
      </div>
    </div>
  );
};

const MemoryCard = ({ memory }: { memory: TravelMemory }) => {
  const meta = sourceMeta(memory.source);
  const SourceIcon = meta.icon;
  const images = memory.images || [];
  const caption = cleanCaption(memory.caption, memory.provinceName);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
      <MemoryImageGrid
        images={images}
        title={caption}
        date={formatDate(memory.visitedAt)}
      />

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.className}`}
          >
            <SourceIcon size={13} />
            {meta.label}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">
            {memory.privacy === "public" ? <Globe2 size={13} /> : <Lock size={13} />}
            {memory.privacy === "public" ? "Công khai" : "Chỉ mình tôi"}
          </span>
        </div>

        <p className="line-clamp-3 min-h-[60px] text-sm font-semibold leading-relaxed text-slate-800">
          {caption}
        </p>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} />
            {memory.provinceName}
          </span>
          <span>{formatLongDate(memory.visitedAt)}</span>
        </div>
      </div>
    </article>
  );
};

const CheckinAccordion = () => {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<MemoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await travelMemoryApi.getMyMemories(undefined, 1, 100);
        const memories = (res.data || []) as TravelMemory[];
        const groupMap: Record<string, MemoryGroup> = {};

        memories.forEach((memory) => {
          const provinceName = memory.provinceName || "Khác";
          if (!groupMap[provinceName]) {
            groupMap[provinceName] = { provinceName, memories: [] };
          }

          groupMap[provinceName].memories.push(memory);
        });

        const nextGroups = Object.values(groupMap)
          .map((group) => ({
            ...group,
            memories: group.memories.sort(
              (a, b) =>
                new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()
            ),
          }))
          .sort((a, b) => {
            const firstA = a.memories[0]?.visitedAt;
            const firstB = b.memories[0]?.visitedAt;
            return new Date(firstB || 0).getTime() - new Date(firstA || 0).getTime();
          });

        setGroups(nextGroups);
        setOpenGroup((current) => current || nextGroups[0]?.provinceName || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalMemories = useMemo(
    () => groups.reduce((total, group) => total + group.memories.length, 0),
    [groups]
  );

  const toggleGroup = (group: string) => {
    setOpenGroup((current) => (current === group ? null : group));
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-100" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  if (groups.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ImageIcon size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Chưa có nhật ký hành trình</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Khi bạn lưu kỷ niệm ở một tỉnh, ảnh và ghi chú sẽ xuất hiện tại đây.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CheckCircle2 size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
              Nhật ký hành trình
            </h2>
            <p className="mt-1 text-sm text-slate-500 md:text-base">
              {totalMemories} kỷ niệm đã lưu tại {groups.length} tỉnh/thành.
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
          <Sparkles size={16} className="text-orange-500" />
          Mới nhất hiển thị trước
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((group) => {
          const isOpen = openGroup === group.provinceName;
          const tourCount = group.memories.filter((memory) => memory.source === "tour").length;
          const manualCount = group.memories.length - tourCount;

          return (
            <div
              key={group.provinceName}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                onClick={() => toggleGroup(group.provinceName)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {group.provinceName}
                    </h3>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {group.memories.length} kỷ niệm
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                    {tourCount > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <BadgeCheck size={13} className="text-emerald-600" />
                        {tourCount} qua tour
                      </span>
                    )}
                    {manualCount > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="text-blue-600" />
                        {manualCount} tự đánh dấu
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                    isOpen
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-4 md:p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.memories.map((memory) => (
                      <MemoryCard key={memory._id} memory={memory} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CheckinAccordion;
