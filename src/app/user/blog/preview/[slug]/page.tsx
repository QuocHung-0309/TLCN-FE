// /app/user/blog/preview/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { blogApi, type BlogDetail, type BlogComment } from "@/lib/blog/blogApi";
import { Star, AlertCircle, Clock, Lock } from "lucide-react";
import { useAuthStore } from "#/stores/auth";
import { toast } from "react-hot-toast";
import { sanitizeBlogHtml } from "@/lib/blog/sanitizeHtml";

const renderBlock = (block: any, idx: number) => {
  if (!block) return null;
  switch (block.type) {
    case "image":
      return (
        <div key={idx} className="my-4 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.value} alt="" className="w-full object-cover" />
        </div>
      );
    case "video":
      return (
        <div key={idx} className="my-4 overflow-hidden rounded-2xl">
          <video src={block.value} controls className="w-full rounded-2xl" />
        </div>
      );
    case "html":
      return (
        <div
          key={idx}
          className="prose prose-sm max-w-none prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(block.value) }}
        />
      );
    case "text":
    default:
      return (
        <p
          key={idx}
          className="mb-3 text-[15px] leading-relaxed text-slate-800"
        >
          {block.value}
        </p>
      );
  }
};

export default function BlogPreviewPage() {
  const { slug } = useParams<{ slug: string }>();

  const { user, token } = useAuthStore();
  const isLoggedIn = !!(token?.accessToken || user);

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await blogApi.previewOwnPost(slug);
        setBlog(data);
      } catch (err) {
        console.error("previewOwnPost error", err);
        setError("Không tải được bài viết hoặc bạn không có quyền xem.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-slate-600">
        Đang tải bài viết…
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-rose-700">
        {error || "Không tìm thấy bài viết."}
      </div>
    );
  }

  const cover = blog.cover || blog.thumbnail || "/blog-placeholder.jpg";

  return (
    <div className="bg-slate-50 pb-16">
      <article className="mx-auto max-w-4xl px-4 pt-8">
        {/* Status Banner */}
        {blog.status === "rejected" && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold">Bài viết bị từ chối</h3>
                <p className="text-sm mt-1">{blog.rejectReason || "Không có lý do cụ thể."}</p>
              </div>
            </div>
        )}
        {blog.status === "pending" && blog.privacy === "public" && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm flex items-center gap-3">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold text-sm">Bài viết này đang chờ Admin duyệt trước khi được công khai.</p>
            </div>
        )}
        {blog.privacy === "private" && blog.status !== "rejected" && (
            <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white shadow-sm flex items-center gap-3">
              <Lock className="w-5 h-5 flex-shrink-0 text-slate-300" />
              <p className="font-semibold text-sm">Đây là bài viết <span className="text-orange-400">Riêng tư</span>. Chỉ bạn mới có thể thấy bài viết này trên public.</p>
            </div>
        )}

        {/* Cover */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
          <Image
            src={cover}
            alt={blog.title}
            width={1200}
            height={600}
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>

        {/* Meta */}
        <header className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700">
            {blog.categories?.map((c) => (
              <span
                key={c}
                className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium"
              >
                {c}
              </span>
            ))}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>
              {blog.author?.name ? `Bởi ${blog.author.name}` : "Ẩn danh"}
            </span>
            {blog.createdAt && (
              <span>
                {new Date(blog.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            )}
            {blog.wardName && (
              <span>
                {blog.wardName +
                  (blog.locationDetail ? ` – ${blog.locationDetail}` : "")}
              </span>
            )}

            {ratingAvg != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                <Star className="h-3 w-3 fill-current" />
                {ratingAvg.toFixed(1)} ({ratingCount || 0})
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          {blog.content && Array.isArray(blog.content) && blog.content.length > 0 ? (
            blog.content.map((b, i) => renderBlock(b, i))
          ) : typeof blog.content === "string" && blog.content ? (
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(blog.content) }} />
          ) : (
            <p className="text-sm text-slate-600">
              Bài viết này chưa có nội dung chi tiết.
            </p>
          )}
        </section>

      </article>
    </div>
  );
}
