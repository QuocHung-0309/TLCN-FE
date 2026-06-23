"use client";

import React, { useMemo } from "react";
import BlogCard from "@/components/cards/BlogCard";
import BlogCardFeatured from "@/components/cards/BlogCardFeatured";
import SectionHeader from "@/components/ui/SectionHeader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useGetBlogs } from "#/hooks/blogs-hook/useBlogs";

import "swiper/css";
import "swiper/css/autoplay";

// Slugify helper
const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Strip HTML helper
const stripHtml = (content: any) => {
  if (!content) return "";
  let rawText = "";
  if (Array.isArray(content)) {
    const firstBlock = content.find((b: any) => b.type === "text" || b.type === "html")?.value ?? "";
    rawText = firstBlock;
  } else if (typeof content === "string") {
    rawText = content;
  }
  return String(rawText)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// SỬA: Định nghĩa các trường là bắt buộc (string) để khớp với component con
type BlogPost = {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  featured: boolean;
};

export default function BlogSection() {
  const { data, isLoading, isError } = useGetBlogs(1, 12) ?? {
    data: undefined,
    isLoading: false,
    isError: false,
  };

  const list: BlogPost[] = useMemo(() => {
    if (!data || !Array.isArray(data.data)) return [];
    return data.data.map((blog: any, index: number) => ({
      _id: blog._id,
      slug: blog.slug || slugify(blog.title),
      title: blog.title || "Bài viết mới",
      // Đảm bảo luôn trả về string và không chứa thẻ HTML
      excerpt: blog.summary ? stripHtml(blog.summary) : (stripHtml(blog.content)?.substring(0, 150) + "..." || ""),
      image: blog.coverImageUrl || "/hot1.jpg",
      // 2 bài đầu tiên là featured
      featured: index < 2,
    }));
  }, [data]);

  const [featured, posts] = useMemo(() => {
    const f = list.filter((p) => p.featured).slice(0, 2);
    const rest = list.filter((p) => !p.featured).slice(0, 12);
    return [f, rest];
  }, [list]);

  const makeKey = (p: BlogPost, idx: number) => {
    const base = p.slug || slugify(p.title);
    const id = p._id || String(idx);
    return `${base}-${id}`;
  };

  const toHref = (p: BlogPost) => `/user/blog/${encodeURIComponent(p.slug || slugify(p.title))}`;

  // Không có bài viết thật (đang lỗi hoặc danh sách trống) -> ẩn cả section,
  // tránh hiển thị bài viết giả dẫn tới link chết.
  if (isLoading) return null;
  if (isError || (featured.length === 0 && posts.length === 0)) return null;

  return (
    <section className="py-14 sm:py-16 px-4">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeader
          title="Cẩm nang du lịch"
          subtitle="Kinh nghiệm, mẹo hay và câu chuyện từ các chuyến đi thực tế"
        />

        {/* Featured Grid */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {featured.map((b, i) => (
            <BlogCardFeatured
              key={makeKey(b, i)}
              slug={b.slug || ""}
              title={b.title || ""}
              excerpt={b.excerpt || ""} // Thêm || "" để chắc chắn là string
              image={b.image || "/hot1.jpg"}
              href={toHref(b)} // Bây giờ component con đã nhận prop này
            />
          ))}
        </div>

        {/* Swiper List */}
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={posts.length > 3} // Chỉ loop nếu đủ items
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
            <SwiperSlide key={makeKey(p, i)} className="!h-auto flex">
              <BlogCard
                slug={p.slug || ""}
                title={p.title || ""}
                excerpt={p.excerpt || ""}
                image={p.image || "/hot1.jpg"}
                href={toHref(p)}
                className="w-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
