// src/app/user/blog/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGetBlogs } from "#/hooks/blogs-hook/useBlogs"; // đổi path cho đúng alias

export default function BlogListPage() {
  const [page, setPage] = useState(1);
  const limit = 9; // 3 cột x 3 hàng

  const { data, isLoading, isError } = useGetBlogs(page, limit);

  const blogs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data
    ? Math.max(1, Math.ceil(total / (data.limit || limit)))
    : 1;

  return (
    <main className="relative min-h-screen bg-[#fff7ec]">
      {/* nền mờ nhẹ, muốn thì chỉnh/bỏ */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 lg:px-0">
        {/* header */}
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-900">
            Bài viết du lịch
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Những kinh nghiệm, cẩm nang và review tour thực tế cho chuyến đi của
            bạn.
          </p>
        </header>

        {/* STATE: loading / error / empty */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-md animate-pulse"
              >
                <div className="h-52 bg-slate-200" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-full rounded bg-slate-200" />
                  <div className="h-3 w-2/3 rounded bg-slate-200" />
                  <div className="mt-4 h-9 w-28 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-red-600">
            Không tải được danh sách bài viết. Vui lòng thử lại.
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-10 text-center text-slate-600">
            Hiện chưa có bài viết nào. Hãy đăng bài để hiển thị tại đây.
          </div>
        ) : (
          <>
            {/* GRID 3 CỘT: layout giống ảnh bạn gửi */}
            <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((post) => {
                const href = `/user/blog/${post.slug}`;
                const img = post.cover || post.thumbnail || "/hot1.jpg";
                const created =
                  post.createdAt &&
                  new Date(post.createdAt).toLocaleDateString("vi-VN");

                return (
                  <article
                    key={post.slug}
                    className="flex h-full flex-col overflow-hidden rounded-[32px] bg-white shadow-md shadow-black/5 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative h-56 w-full">
                      <Image
                        src={post.cover || post.thumbnail || "/hot1.jpg"}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                      {/* Categories */}
                      {(() => {
                        const categories = post.categories ?? [];
                        if (!categories.length) return null;
                        return (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {categories.map((c) => (
                              <span
                                key={c}
                                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Title */}
                      <h2 className="mb-2 text-lg font-extrabold uppercase leading-snug text-slate-900 line-clamp-3">
                        {post.title}
                      </h2>

                      {/* Date */}
                      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                        <span className="text-[18px]">📅</span>
                        {post.createdAt &&
                          new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </div>

                      {/* Excerpt */}
                      <p className="mb-4 text-[15px] leading-relaxed text-slate-700 line-clamp-3">
                        {post.excerpt ||
                          "Bài viết chia sẻ kinh nghiệm, mẹo du lịch, lịch trình và những điều thú vị trong chuyến đi của bạn."}
                      </p>

                      {/* Button */}
                      <div className="mt-auto">
                        <Link
                          href={`/user/blog/${post.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-900 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-slate-900 hover:bg-slate-900 hover:text-white transition"
                        >
                          Xem thêm
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* PAGINATION dưới lưới */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm disabled:opacity-40"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const num = i + 1;
                  const active = num === page;
                  return (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        active
                          ? "bg-orange-500 text-white shadow"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-orange-500"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
