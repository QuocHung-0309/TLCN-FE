"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import useUser from "@/hooks/useUser";
import {
  trackClick,
  trackImpressions,
  SourceType,
  ModelType,
} from "@/utils/tracking";
import CardHot from "./cards/CardHot";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
  priceChild?: number;
  salePrice?: number;
  discountPercent?: number;
  time?: string;
  description?: string;
  images: string[];
  quantity?: number;
  startDate?: string;
  upcomingDepartures?: Departure[];
}

interface ApiResponse {
  data: Tour[];
  model?: ModelType;
}

interface Props {
  type: "homepage" | "similar" | "post-booking";
  tourId?: string;
  heading?: string;
  limit?: number;
  showViewAll?: boolean;
  /** Skip the component's own outer section/container — use when the parent page already provides max-width and horizontal padding. */
  bare?: boolean;
  /** Số cột hiển thị trên màn hình lớn (mặc định 3). Dùng 4 khi cần bố cục gọn hơn, nhiều tour hơn trên 1 hàng. */
  columns?: 3 | 4;
}

export default function TourRecommendations({
  type,
  tourId,
  heading,
  limit = 6,
  showViewAll = false,
  bare = false,
  columns = 3,
}: Props) {
  const gridClass =
    columns === 4
      ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<ModelType | null>(null);
  const { user } = useUser();

  const getSource = (): SourceType => {
    if (type === "homepage") return "homepage";
    if (type === "similar") return "similar";
    if (type === "post-booking") return "post_booking";
    return "direct";
  };

  useEffect(() => {
    const fetchRec = async () => {
      try {
        let url = "";
        if (type === "homepage") {
          const userId = user?.id || "";
          url = `${API_BASE}/recommendations/homepage?limit=${limit}${userId ? `&userId=${userId}` : ""}`;
        }
        if (type === "similar" && tourId) {
          url = `${API_BASE}/recommendations/similar/${tourId}?limit=${limit}`;
        }
        if (type === "post-booking" && tourId) {
          const userId = user?.id || "";
          url = `${API_BASE}/recommendations/post-booking/${tourId}?limit=${limit}${userId ? `&userId=${userId}` : ""}`;
        }
        if (!url) { setLoading(false); return; }

        const res = await fetch(url, { credentials: "include" });
        const json: ApiResponse = await res.json();
        setTours(json.data ?? []);
        setModel(json.model || null);

        if (json.data?.length > 0) {
          trackImpressions(json.data.map((t) => t._id), {
            userId: user?.id,
            source: getSource(),
            model: json.model || null,
          });
        }
      } catch {
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRec();
  }, [type, tourId, limit, user?.id]);

  const handleTourClick = useCallback(
    (id: string, position: number) => {
      trackClick(id, { userId: user?.id, source: getSource(), model, position });
    },
    [user?.id, model, type],
  );

  const getSlug = (tour: Tour) => {
    if (tour.destinationSlug) return tour.destinationSlug;
    return (tour.destination || tour.title || "")
      .toLowerCase().normalize("NFD")
      .replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  if (loading) {
    const skeleton = (
      <>
        <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className={gridClass}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </>
    );
    if (bare) return skeleton;
    return (
      <section className="px-4 pb-14 pt-10">
        <div className="mx-auto w-full max-w-7xl">{skeleton}</div>
      </section>
    );
  }

  if (tours.length === 0) return null;

  const content = (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          {model === "deepfm" && (
            <p className="mb-1 text-[12px] font-semibold uppercase tracking-widest text-orange-500">
              Gợi ý riêng cho bạn
            </p>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)]">
            {heading ?? "Tour gợi ý cho bạn"}
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            {model === "deepfm"
              ? "Cá nhân hóa dựa trên sở thích của bạn"
              : "Những hành trình được nhiều du khách lựa chọn"}
          </p>
        </div>
        {showViewAll && (
          <Link
            href="/user/destination"
            className="flex-shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            Xem tất cả <ChevronRight size={15} />
          </Link>
        )}
      </div>

      <div className={gridClass}>
        {tours.map((tour, index) => (
          <CardHot
            key={tour._id}
            id={tour._id}
            image={tour.images?.[0] || ""}
            title={tour.title}
            badgeText={
              tour.discountPercent
                ? `Giảm ${tour.discountPercent}%`
                : model === "deepfm"
                  ? "Gợi ý cho bạn"
                  : undefined
            }
            originalPrice={tour.priceAdult}
            salePrice={tour.salePrice}
            discountPercent={tour.discountPercent}
            href={`/user/destination/${getSlug(tour)}/${tour._id}`}
            time={tour.time}
            destination={tour.destination}
            upcomingDepartures={tour.upcomingDepartures}
            onClick={() => handleTourClick(tour._id, index)}
          />
        ))}
      </div>
    </>
  );

  if (bare) return content;

  return (
    <section className="px-4 pb-14 pt-10">
      <div className="mx-auto w-full max-w-7xl">{content}</div>
    </section>
  );
}
