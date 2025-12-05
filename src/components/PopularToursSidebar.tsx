"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { getTours, type Tour } from "@/lib/tours/tour";

const formatPrice = (price?: number | string) => {
  if (price == null) return "Giá liên hệ";
  const n =
    typeof price === "number"
      ? price
      : Number(String(price).replace(/[^\d]/g, ""));
  if (Number.isNaN(n)) return "Giá liên hệ";
  return new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";
};

const getTourImage = (tour: Tour) =>
  (tour as any).images?.[0] ||
  tour.image ||
  tour.cover ||
  "/placeholder-tour.jpg";

const buildTourHref = (tour: Tour) => {
  const slug =
    (tour.destinationSlug ??
      (tour.title || "").toLowerCase().replace(/\s+/g, "-")) ||
    "tour";
  return `/user/destination/${slug}/${tour._id}`;
};

export default function PopularToursSidebar() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoading(true);
        // lấy 5 tour đầu, tuỳ BE có “popular” thì sau này thêm query
        const res = await getTours(1, 5, {});
        setTours(res.data || []);
      } catch (err) {
        console.error("Error fetching popular tours:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Tour xem nhiều
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-16 w-24 rounded-md bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && tours.length === 0 && (
            <p className="p-4 text-sm text-slate-500">
              Chưa có tour nổi bật để hiển thị.
            </p>
          )}

          {!loading &&
            tours.map((tour) => (
              <Link
                key={tour._id}
                href={buildTourHref(tour)}
                className="flex gap-3 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={getTourImage(tour)}
                    alt={tour.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <p className="line-clamp-2 text-xs font-semibold text-slate-900 md:text-sm">
                    {tour.title}
                  </p>

                  <div className="mt-1 space-y-0.5 text-xs">
                    <div className="flex items-center text-slate-500">
                      <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {tour.destination || "Đang cập nhật"}
                      </span>
                    </div>
                    <span className="font-semibold text-rose-600">
                      {formatPrice(tour.priceAdult)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </aside>
  );
}
