'use client';

import React, { useMemo } from 'react';
import BlogCard from '@/components/cards/BlogCard';
import BlogCardFeatured from '@/components/cards/BlogCardFeatured';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
// Nếu bạn đã có react-query cho blogs:
import { useGetBlogs } from "#/hooks/blogs-hook/useBlogs";

import 'swiper/css';
import 'swiper/css/autoplay';

// slug an toàn (không cần ts-ignore)
const slugify = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type BlogPost = {
  _id?: string;
  slug?: string;
  title: string;
  excerpt?: string;
  image?: string;
  featured?: boolean;
};

export default function BlogSection() {
  // Fetch published blogs only
  const { data, isLoading, isError } = useGetBlogs(1, 12) ?? { data: undefined, isLoading: false, isError: false };
  
  const list: BlogPost[] = useMemo(() => {
    if (!data || !Array.isArray(data.data)) return [];
    return data.data.map((blog: any) => ({
      _id: blog._id,
      slug: blog.slug || slugify(blog.title),
      title: blog.title,
      excerpt: blog.summary || blog.content?.substring(0, 150) + '...' || '',
      image: blog.coverImageUrl || '/hot1.jpg',
      featured: false // Backend không có field này, tạm set false
    }));
  }, [data]);

  // ===== Fallback khi chưa có API (xài data cứng để không gãy)
  const fallbackFeatured: BlogPost[] = [
    {
      slug: 'cam-nang-du-lich',
      title: 'CẨM NANG DU LỊCH',
      excerpt: 'Những ai đã trải nghiệm mùa nước nổi ở miền Tây hẳn sẽ không thể nào quên…',
      image: '/hot1.jpg',
      featured: true,
    },
    {
      slug: 'dac-san-mien-tay',
      title: 'ĐẶC SẢN MIỀN TÂY',
      excerpt: 'Cá linh, bông điên điển và nhiều món đặc trưng thiên nhiên ban tặng…',
      image: '/hot1.jpg',
      featured: true,
    },
  ];
  const fallbackPosts: BlogPost[] = [
    {
      slug: 'phong-tuc-ngay-tet-mien-tay-1', // 👈 sửa cho unique
      title: 'PHONG TỤC NGÀY TẾT MIỀN TÂY',
      excerpt: 'Khám phá phong tục ngày Tết miền Tây…',
      image: '/hot1.jpg',
    },
    {
      slug: 'kinh-nghiem-di-tour-mien-tay-2n1d-1',
      title: 'KINH NGHIỆM ĐI TOUR MIỀN TÂY 2N1Đ',
      excerpt: 'Lịch trình ngắn nhưng đầy trải nghiệm…',
      image: '/hot1.jpg',
    },
    {
      slug: 'tour-mien-tay-2n1d-my-tho-ben-tre-can-tho-1',
      title: 'TOUR MIỀN TÂY 2N1Đ | MỸ THO - BẾN TRE - CẦN THƠ',
      excerpt: 'Khám phá Mỹ Tho – Bến Tre – Cần Thơ…',
      image: '/hot1.jpg',
    },
  ];

  // ===== Chia nhóm featured / normal
  const [featured, posts] = useMemo(() => {
    const src = list.length ? list : []; // nếu có API, dùng API
    if (!src.length) return [fallbackFeatured, fallbackPosts]; // nếu chưa có API
    const f = src.filter((p) => p.featured).slice(0, 2);
    const rest = src.filter((p) => !p.featured).slice(0, 12);
    // Nếu thiếu featured thì bù fallback
    const featuredFilled = f.length ? f : fallbackFeatured;
    const postsFilled = rest.length ? rest : fallbackPosts;
    return [featuredFilled, postsFilled];
  }, [list]);

  // ===== Helper tạo key/href an toàn
  const makeKey = (p: BlogPost, idx: number) => {
    const base = p.slug || slugify(p.title);
    const id = p._id || String(idx);
    return `${base}-${id}`; // 👈 key đảm bảo unique
  };
  const toHref = (p: BlogPost) => `/blog/${p.slug || slugify(p.title)}`;

  return (
    <section className="py-14 sm:py-16 px-4">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#144d7e] mb-6">
          BLOG
        </h2>

        {/* Hàng 1: 2 bài nổi bật */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {featured.map((b, i) => (
            <BlogCardFeatured
              key={makeKey(b, i)}
              slug={b.slug || slugify(b.title)}
              title={b.title}
              excerpt={b.excerpt}
              image={b.image || '/hot1.jpg'}
              href={toHref(b)}
            />
          ))}
        </div>

        {/* Hàng 2: danh sách posts */}
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          grabCursor
          spaceBetween={16}
          breakpoints={{
            0: { slidesPerView: 1.05, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 14 },
            1024: { slidesPerView: 3, spaceBetween: 16 },
            1280: { slidesPerView: 3.2, spaceBetween: 18 },
          }}
          className="!pb-8"
        >
          {posts.map((p, i) => (
            <SwiperSlide key={makeKey(p, i)} className="!h-auto">
              <BlogCard
                slug={p.slug || slugify(p.title)}
                title={p.title}
                excerpt={p.excerpt}
                image={p.image || '/hot1.jpg'}
                href={toHref(p)}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Lỗi API */}
        {isError && (
          <p className="mt-4 text-center text-sm text-red-600">
            Không tải được bài viết mới. Đang hiển thị nội dung mặc định.
          </p>
        )}
      </div>
    </section>
  );
}
