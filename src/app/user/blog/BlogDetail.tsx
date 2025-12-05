// /app/user/blog/BlogDetail.tsx
"use client";

import { CalendarDays, User2, Tag, Star } from "lucide-react";
import Image from "next/image";
import {
  BlogDetail as BlogDetailType,
  BlogContentBlock,
} from "@/lib/blog/blogApi";

type Props = {
  post: BlogDetailType;
};

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const calcReadingTime = (text: string): number => {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return minutes;
};

export default function BlogDetail({ post }: Props) {
  const cover =
    post.cover ||
    post.coverImageUrl ||
    post.thumbnail ||
    post.mediaUrls?.[0] ||
    "/blog-placeholder.jpg";

  const date =
    (post as any).publishedAt || post.createdAt || post.updatedAt || undefined;

  const tags = post.tags || [];

  // Lấy plain text để tính read time
  let rawText = "";
  if (Array.isArray(post.content)) {
    const joined = (post.content as BlogContentBlock[])
      .map((b) => b.value)
      .join(" ");
    rawText = stripHtml(joined);
  } else if (typeof post.content === "string") {
    rawText = stripHtml(post.content);
  } else if (post.summary || (post as any).excerpt) {
    rawText = stripHtml(post.summary || (post as any).excerpt || "");
  }
  const readingMinutes = calcReadingTime(rawText);

  // Render phần nội dung
  const renderContent = () => {
    if (Array.isArray(post.content)) {
      return post.content.map((block, idx) => {
        if (block.type === "text" || block.type === "html") {
          return (
            <div
              key={idx}
              className="prose prose-sm max-w-none text-slate-800 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_p]:my-4 [&_ul]:my-4 [&_li]:my-1"
              dangerouslySetInnerHTML={{ __html: block.value }}
            />
          );
        }
        if (block.type === "image") {
          return (
            <div key={idx} className="my-6 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.value}
                alt={post.title ?? "blog image"}
                className="h-auto w-full rounded-2xl object-cover"
              />
            </div>
          );
        }
        if (block.type === "video") {
          return (
            <div key={idx} className="my-6 overflow-hidden rounded-2xl">
              <video
                src={block.value}
                controls
                className="h-auto w-full rounded-2xl"
              />
            </div>
          );
        }
        return null;
      });
    }

    // content là HTML string
    if (typeof post.content === "string") {
      return (
        <div
          className="prose prose-sm max-w-none text-slate-800 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_p]:my-4 [&_ul]:my-4 [&_li]:my-1"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      );
    }

    // fallback: chỉ có summary
    if (post.summary) {
      return (
        <p className="mt-4 text-[15px] leading-relaxed text-slate-800">
          {post.summary}
        </p>
      );
    }

    return (
      <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
        Nội dung bài viết đang được cập nhật.
      </p>
    );
  };

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      {/* Hero cover */}
      <div className="relative h-[260px] w-full overflow-hidden rounded-t-3xl md:h-[320px]">
        <Image
          src={cover}
          alt={post.title ?? "Cover image"}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 800px, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Travel Blog
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-snug text-white md:text-3xl">
              {post.title}
            </h1>
          </div>
          {post.ratingAvg != null && (
            <div className="flex items-center rounded-full bg-black/60 px-3 py-1 text-xs text-amber-200">
              <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{post.ratingAvg.toFixed(1)}</span>
              <span className="ml-1 opacity-80">
                ({post.ratingCount ?? 0} đánh giá)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-8 pt-5 md:px-8 md:pt-6">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 md:text-sm">
          {date && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>
                {new Date(date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <User2 className="h-4 w-4" />
            <span>{post.author?.name ?? "Admin"}</span>
          </div>
          {readingMinutes > 0 && (
            <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 md:text-xs">
              ~ {readingMinutes} phút đọc
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 md:text-xs"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Summary ngắn */}
        {(post.summary || (post as any).excerpt) && (
          <p className="mt-5 text-[15px] leading-relaxed text-slate-700">
            {post.summary || (post as any).excerpt}
          </p>
        )}

        {/* Content chính */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          {renderContent()}
        </div>
      </div>
    </article>
  );
}
