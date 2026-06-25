"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import DestinationCard from "@/components/cards/DestinationCard";
import Button from "@/components/ui/Button";
import { useRecommendedTours } from "#/hooks/tours-hook/useRecommendedTours";
import useUser from "@/hooks/useUser";
import { trackImpressions, trackClick } from "@/utils/tracking";

function getSlug(tour: any): string {
  if (tour.destinationSlug) return tour.destinationSlug;
  return (tour.destination || tour.title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function RecommendedPlaces() {
  const router = useRouter();
  const { user } = useUser();
  const { data: result, isLoading } = useRecommendedTours(user?.id);
  const tours = result?.data ?? [];

  useEffect(() => {
    if (tours.length > 0) {
      trackImpressions(
        tours.map((t: any) => t._id || t.id),
        { userId: user?.id, source: "homepage", model: result?.model as any }
      );
    }
  }, [tours.length, user?.id]);

  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <section className="py-12 px-4 select-none">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#144d7e] uppercase tracking-wide">
              Tour Gợi Ý Cho Bạn
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Những hành trình phù hợp với bạn nhất
            </p>
          </div>

          <Button
            variant="outline-primary"
            onClick={() => router.push("/user/search")}
            className="text-xs sm:text-sm px-5 py-2.5 rounded-xl border-slate-200 hover:border-[#144d7e] hover:text-[#144d7e] transition-all"
          >
            Xem tất cả tour
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-slate-100 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {tours.map((tour: any, index: number) => {
              const id = tour._id || tour.id;
              const slug = getSlug(tour);
              const href = `/user/destination/${slug}/${id}`;
              const thumb =
                tour.image ||
                (Array.isArray(tour.images) ? tour.images[0] : null) ||
                tour.cover ||
                "/hot-destination.svg";

              return (
                <div
                  key={id}
                  onClick={() => {
                    trackClick(id, {
                      userId: user?.id,
                      source: "homepage",
                      model: result?.model as any,
                      position: index,
                    });
                    router.push(href);
                  }}
                  className="cursor-pointer group"
                >
                  <DestinationCard
                    image={thumb}
                    title={tour.title}
                    duration={tour.time || "Liên hệ"}
                    price={formatPrice(tour.priceAdult)}
                    href={href}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400">Chưa có tour nào để hiển thị.</p>
          </div>
        )}
      </div>
    </section>
  );
}
