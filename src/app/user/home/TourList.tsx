"use client";

import React, { useMemo } from "react";
import CardTourList from "@/components/cards/CardTourList";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useGetTours } from "#/hooks/tours-hook/useTours";

import "swiper/css";
import "swiper/css/autoplay";

type GroupedDest = {
  id: string; // key unique (VD: "NHA TRANG")
  title: string; // Tên hiển thị (VD: "Nha Trang")
  total: number; // Số lượng tour
  image: string; // Ảnh đại diện
};

/* ===== Skeleton ===== */
function Skeleton() {
  return (
    <div className="h-full rounded-2xl border border-slate-200 p-3 shadow-sm bg-white">
      <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

const HotDestinations = () => {
  // Lấy 100 tour để đủ dữ liệu thống kê
  const { data, isLoading, isError } = useGetTours(1, 100);
  const list = data?.data ?? [];

  // Logic gom nhóm (Grouping)
  const groups: GroupedDest[] = useMemo(() => {
    if (!list || list.length === 0) return [];

    // Map dùng để lưu trữ: Key là tên địa điểm viết hoa để tránh trùng
    const map = new Map<string, GroupedDest>();

    list.forEach((t: any) => {
      const rawDest = t.destination;
      if (!rawDest) return; // Bỏ qua tour không có địa điểm

      const key = rawDest.trim().toUpperCase(); // Key chuẩn hóa để group

      // Lấy ảnh (ưu tiên cover -> image -> images[0])
      const img =
        t.cover ||
        t.image ||
        (Array.isArray(t.images) ? t.images[0] : null) ||
        "/hot1.jpg";

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.total += 1;
      } else {
        map.set(key, {
          id: key,
          title: rawDest.trim(), // Giữ nguyên tên gốc (có hoa thường) để search
          total: 1,
          image: img,
        });
      }
    });

    // Sắp xếp: Nhiều tour nhất lên đầu
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [list]);

  // Hàm tạo link theo đúng format của bạn
  const createSearchLink = (destinationName: string) => {
    // Tạo đối tượng params
    const params = new URLSearchParams({
      page: "1",
      destination: destinationName, // VD: "Nha Trang"
      budgetMin: "0",
      budgetMax: "1000000000",
    });

    // Kết quả sẽ là: /user/destination?page=1&destination=Nha+Trang&budgetMin=0...
    return `/user/destination?${params.toString()}`;
  };

  return (
    <section className="py-14 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#144d7e] mb-8">
          ĐIỂM ĐẾN HOT NHẤT
        </h2>

        {isError && !isLoading && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
            Không tải được dữ liệu điểm đến.
          </div>
        )}

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 1000, disableOnInteraction: false }}
          loop={groups.length > 4}
          grabCursor
          spaceBetween={16}
          breakpoints={{
            0: { slidesPerView: 1.5, spaceBetween: 12 },
            480: { slidesPerView: 2.2, spaceBetween: 14 },
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 18 },
            1280: { slidesPerView: 5, spaceBetween: 20 },
          }}
          className="!pb-8"
        >
          {/* Loading */}
          {isLoading &&
            Array.from({ length: 5 }).map((_, idx) => (
              <SwiperSlide key={`sk-${idx}`} className="!h-auto">
                <Skeleton />
              </SwiperSlide>
            ))}

          {/* Data */}
          {!isLoading &&
            !isError &&
            groups.map((item) => (
              <SwiperSlide key={item.id} className="!h-auto">
                <CardTourList
                  image={item.image}
                  title={item.title}
                  total={item.total}
                  // 👇 Tạo link href đúng chuẩn query params
                  href={createSearchLink(item.title)}
                />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </section>
  );
};

export default HotDestinations;
