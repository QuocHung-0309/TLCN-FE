"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CardHot from "./cards/CardHot";
import SectionHeader from "./ui/SectionHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Departure {
  _id: string;
  startDate: string;
  max_guests: number;
  current_guests: number;
  priceAdult: number;
}

interface Tour {
  _id: string;
  title: string;
  destination: string;
  destinationSlug?: string;
  priceAdult: number;
  salePrice?: number;
  discountPercent?: number;
  time?: string;
  images: string[];
  upcomingDepartures?: Departure[];
  bookingCount?: number;
}

interface Props {
  limit?: number;
  showViewAll?: boolean;
}

const getSlug = (tour: Tour) => {
  if (tour.destinationSlug) return tour.destinationSlug;
  return (tour.destination || tour.title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export default function PopularTours({ limit = 6, showViewAll = true }: Props) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/tours/popular?limit=${limit}`)
      .then((r) => r.json())
      .then((json) => setTours(json.data ?? []))
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <section className="px-4 pb-14 pt-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-slate-200" />
                <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tours.length === 0) return null;

  return (
    <section className="px-4 pb-14 pt-10">
      <div className="mx-auto w-full max-w-7xl">

        <div className="mb-6 flex items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Phổ biến"
            title="Tour được đặt nhiều nhất"
            subtitle="Những hành trình được hàng nghìn du khách tin chọn"
            className="mb-0"
          />
          {showViewAll && (
            <Link
              href="/user/destination"
              className="flex-shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Xem tất cả <ChevronRight size={15} />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, i) => (
            <CardHot
              key={tour._id}
              id={tour._id}
              image={tour.images?.[0] || ""}
              title={tour.title}
              originalPrice={tour.priceAdult}
              salePrice={tour.salePrice}
              discountPercent={tour.discountPercent}
              href={`/user/destination/${getSlug(tour)}/${tour._id}`}
              time={tour.time}
              destination={tour.destination}
              upcomingDepartures={tour.upcomingDepartures}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
