"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export type BlogCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  href?: string; // Thêm href (optional)
  className?: string; // Thêm className
};

const BlogCard: React.FC<BlogCardProps> = ({
  slug,
  title,
  excerpt,
  image,
  href,
  className = "",
}) => {
  // Ưu tiên dùng href truyền vào, nếu không có thì tự tạo từ slug
  const linkUrl = href || `/user/blog/${slug}`;

  return (
    <article
      className={`group overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm hover:shadow-md transition flex flex-col h-full ${className}`}
    >
      <div className="relative w-full h-[170px] flex-shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h4 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2">
          {title}
        </h4>
        <p className="mt-2 text-[13px] text-slate-600 line-clamp-3 mb-4">
          {excerpt}
        </p>

        <div className="mt-auto">
          <Link
            href={linkUrl}
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            XEM THÊM
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
