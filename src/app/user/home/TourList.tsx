'use client';

import React, { useMemo } from 'react';
import CardTourList from '@/components/cards/CardTourList';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useGetTours } from '#/hooks/tours-hook/useTours';

import 'swiper/css';
import 'swiper/css/autoplay';

/* ===== helpers ===== */
// slug tiếng Việt an toàn (không cần @ts-ignore)
const slugify = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type GroupedDest = {
  title: string;   // điểm đến (VD: "ĐÀ LẠT")
  total: number;   // số tour thuộc điểm đến đó
  image: string;   // ảnh đại diện
  slug: string;    // slug cho route
};

/* ===== Skeleton card (khi loading) ===== */
function Skeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 p-3 shadow-sm bg-white">
      <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

const TourList = () => {
  // Lấy nhiều tour để đủ dữ liệu group theo destination
  const { data, isLoading, isError } = useGetTours(1, 100);
  const list = data?.data ?? [];

  // Gom nhóm theo destination
  const groups: GroupedDest[] = useMemo(() => {
    if (!list || list.length === 0) return [];
    
    const map = new Map<string, GroupedDest>();

    list.forEach((t: any) => {
      const title = (t.destination as string) || (t.title as string) || 'Khác';
      const titleUpper = title.toUpperCase();
      
      if (map.has(titleUpper)) {
        const existing = map.get(titleUpper)!;
        existing.total += 1;
        // Cập nhật ảnh nếu tour hiện tại có ảnh tốt hơn
        if (t.image || t.cover) {
          existing.image = t.image || t.cover;
        }
      } else {
        map.set(titleUpper, {
          title: titleUpper,
          total: 1,
          image: t.image || t.cover || '/default-tour.jpg',
          slug: slugify(title),
        });
      }
    });

    return Array.from(map.values()).slice(0, 8);
  }, [list]);

  return (
    <section className="py-14 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#144d7e] mb-8">
          ĐIỂM ĐẾN HOT NHẤT
        </h2>

        {/* Thông báo lỗi */}
        {isError && !isLoading && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Không tải được dữ liệu điểm đến. Vui lòng thử lại sau.
          </div>
        )}

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          grabCursor
          spaceBetween={16}
          breakpoints={{
            0:   { slidesPerView: 1.2, spaceBetween: 12 },
            480: { slidesPerView: 2,   spaceBetween: 14 },
            768: { slidesPerView: 3,   spaceBetween: 16 },
            1024:{ slidesPerView: 4,   spaceBetween: 18 },
            1280:{ slidesPerView: 5,   spaceBetween: 20 },
          }}
          className="!pb-8"
        >
          {/* Loading skeletons */}
          {isLoading &&
            Array.from({ length: 8 }).map((_, idx) => (
              <SwiperSlide key={`sk-${idx}`} className="!h-auto">
                <Skeleton />
              </SwiperSlide>
            ))}

          {/* Data */}
          {!isLoading &&
            !isError &&
            groups.map((item, idx) => (
              <SwiperSlide key={`${slugify(item.title)}-${idx}`} className="!h-auto">
                <CardTourList
                  title={item.title}
                  total={item.total}
                  image={item.image}
                  // Nếu CardTourList hỗ trợ chuyển trang, truyền thêm href:
                  // href={`/user/destination/${item.slug}`}
                />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TourList;
