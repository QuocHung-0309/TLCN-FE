"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Globe, Lock, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { blogApi, BlogSummary } from "@/lib/blog/blogApi";
import { toast } from "react-hot-toast";

export default function MyPostsPage() {
  const [posts, setPosts] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "published" | "private" | "rejected">("all");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await blogApi.getMyPosts(1, 100);
      setPosts(res.data || []);
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
      toast.error("Không tải được danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await blogApi.deleteBlog(id);
      toast.success("Đã xóa bài viết");
      fetchPosts();
    } catch (err) {
      toast.error("Lỗi khi xóa bài viết");
    }
  };

  const handleTogglePrivacy = async (id: string, currentPrivacy: "public" | "private") => {
    try {
      const newPrivacy = currentPrivacy === "public" ? "private" : "public";
      await blogApi.togglePrivacy(id, newPrivacy);
      toast.success(`Đã chuyển sang chế độ ${newPrivacy === "public" ? "Công khai" : "Riêng tư"}`);
      fetchPosts();
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const filteredPosts = posts.filter(p => {
    if (filter === "all") return true;
    if (filter === "pending") return p.status === "pending";
    if (filter === "published") return p.status === "published" && p.privacy === "public";
    if (filter === "private") return p.privacy === "private";
    if (filter === "rejected") return p.status === "rejected";
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Bài viết của tôi</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Quản lý, chỉnh sửa và theo dõi trạng thái các bài viết chia sẻ hành trình của bạn.
          </p>
        </div>
        <Link 
          href="/user/post-blog" 
          className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Viết bài mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: "all", label: "Tất cả" },
          { id: "pending", label: "Chờ duyệt" },
          { id: "published", label: "Công khai" },
          { id: "private", label: "Riêng tư" },
          { id: "rejected", label: "Bị từ chối" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              filter === f.id 
                ? "bg-slate-800 text-white shadow-md" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse h-80">
              <div className="bg-slate-200 h-40 rounded-xl mb-4"></div>
              <div className="bg-slate-200 h-6 w-3/4 rounded mb-2"></div>
              <div className="bg-slate-200 h-4 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <Edit2 className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có bài viết nào</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Bạn chưa có bài viết nào trong danh mục này. Hãy bắt đầu chia sẻ những trải nghiệm du lịch tuyệt vời của bạn nhé!
          </p>
          <Link 
            href="/user/post-blog"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus size={18} />
            Bắt đầu viết bài
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <div key={post._id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col">
              {/* Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <Image 
                  src={post.thumbnail || "/hot1.jpg"} 
                  alt={post.title} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {post.status === "pending" && (
                    <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                      <Clock size={12} /> Chờ duyệt
                    </span>
                  )}
                  {post.status === "published" && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                      <CheckCircle size={12} /> Đã duyệt
                    </span>
                  )}
                  {post.status === "rejected" && (
                    <span className="inline-flex items-center gap-1 bg-rose-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                      <XCircle size={12} /> Bị từ chối
                    </span>
                  )}
                </div>

                {/* Privacy Toggle Badge */}
                <button
                  onClick={() => handleTogglePrivacy(post._id!, post.privacy || "public")}
                  className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
                  title="Nhấn để đổi trạng thái"
                >
                  {post.privacy === "public" ? <Globe size={12} /> : <Lock size={12} />}
                  {post.privacy === "public" ? "Công khai" : "Riêng tư"}
                </button>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                    {post.categories?.[0] || "Du lịch"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : ""}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                  {post.excerpt || "Không có tóm tắt."}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <span className="flex items-center gap-1"><MessageSquare size={14} /> {post.commentsCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/user/post-blog/edit/${post._id}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => setDeleteTargetId(post._id!)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa bài"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Xóa bài viết này?</h3>
            <p className="text-center text-slate-500 mb-8 text-sm">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bài viết này không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-600/20"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
