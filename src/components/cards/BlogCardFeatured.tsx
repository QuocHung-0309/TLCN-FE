'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export type BlogFeaturedProps = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
};

const BlogCardFeatured: React.FC<BlogFeaturedProps> = ({ slug, title, excerpt, image }) => {
  return (
    <article className="group relative overflow-hidden rounded-2xl ring-1 ring-black/5 shadow hover:shadow-lg transition">
      <div className="relative w-full h-[260px] sm:h-[280px] md:h-[300px]">
        <Image
          src={image}
          alt={title}
          fill
          priority={false}
          sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="text-white font-extrabold text-lg sm:text-xl uppercase leading-tight">
          {title}
        </h3>
        <p className="mt-2 text-slate-200 text-sm line-clamp-2">{excerpt}</p>

        <Link
          href={`/blog/${slug}`}
          className="mt-3 inline-flex items-center rounded-full bg-white/95 px-4 py-1.5 text-sm font-semibold text-black hover:bg-white transition"
        >
          Đọc thêm
        </Link>
      </div>
    </article>
  );
};

export default BlogCardFeatured;
