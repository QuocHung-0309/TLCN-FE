"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Globe, Lock, MessageSquare, MapPin, Calendar, ImageIcon } from "lucide-react";
import { travelMemoryApi } from "@/lib/checkin/travelMemoryApi";
import { toast } from "react-hot-toast";

type MemoryItem = {
  _id: string;
  provinceName: string;
  visitedAt: string;
  caption: string;
  images: string[];
  privacy: "private" | "public";
  source: "manual" | "tour";
  commentsCount?: number;
};

export default function MyMemoriesPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editPrivacy, setEditPrivacy] = useState<"private" | "public">("public");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const res = await travelMemoryApi.getMyMemories(undefined, 1, 100);
      setMemories(res.data || []);
    } catch (error) {
      console.error("Lỗi tải kỷ niệm:", error);
      toast.error("Không tải được danh sách kỷ niệm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await travelMemoryApi.deleteMemory(id);
      toast.success("Đã xóa kỷ niệm");
      setMemories((prev) => prev.filter((m) => m._id !== id));
    } catch {
      toast.error("Lỗi khi xóa kỷ niệm");
    }
  };

  const openEditModal = (item: MemoryItem) => {
    setEditingItem(item);
    setEditCaption(item.caption || "");
    setEditPrivacy(item.privacy);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSavingEdit(true);
    try {
      await travelMemoryApi.updateMemory(editingItem._id, {
        caption: editCaption,
        privacy: editPrivacy,
      });
      setMemories((prev) =>
        prev.map((m) =>
          m._id === editingItem._id ? { ...m, caption: editCaption, privacy: editPrivacy } : m
        )
      );
      toast.success("Đã cập nhật kỷ niệm");
      setEditingItem(null);
    } catch {
      toast.error("Lỗi khi cập nhật kỷ niệm");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleTogglePrivacy = async (item: MemoryItem) => {
    const newPrivacy = item.privacy === "public" ? "private" : "public";
    try {
      await travelMemoryApi.updateMemory(item._id, { privacy: newPrivacy });
      setMemories((prev) =>
        prev.map((m) => (m._id === item._id ? { ...m, privacy: newPrivacy } : m))
      );
      toast.success(`Đã chuyển sang chế độ ${newPrivacy === "public" ? "Công khai" : "Riêng tư"}`);
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (filter === "all") return true;
    return m.privacy === filter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Kỷ niệm của tôi</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Quản lý các kỷ niệm du lịch bạn đã lưu trên Hành trình.
          </p>
        </div>
        <Link
          href="/user/map"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Lưu kỷ niệm mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: "all", label: "Tất cả" },
          { id: "public", label: "Công khai" },
          { id: "private", label: "Riêng tư" },
        ].map((f) => (
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse h-80">
              <div className="bg-slate-200 h-40 rounded-xl mb-4"></div>
              <div className="bg-slate-200 h-6 w-3/4 rounded mb-2"></div>
              <div className="bg-slate-200 h-4 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <ImageIcon className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có kỷ niệm nào</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Bạn chưa có kỷ niệm nào trong danh mục này. Hãy lưu lại dấu chân đầu tiên trên bản đồ!
          </p>
          <Link
            href="/user/map"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus size={18} />
            Đi tới Bản đồ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.images?.[0] || "/hot1.jpg"}
                  alt={item.provinceName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <button
                  onClick={() => handleTogglePrivacy(item)}
                  className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
                  title="Nhấn để đổi trạng thái"
                >
                  {item.privacy === "public" ? <Globe size={12} /> : <Lock size={12} />}
                  {item.privacy === "public" ? "Công khai" : "Riêng tư"}
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                    <MapPin size={12} /> {item.provinceName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Calendar size={12} /> {new Date(item.visitedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <p className="text-slate-700 text-sm line-clamp-2 mb-4 flex-1 font-medium">
                  {item.caption || "(Không có cảm nhận)"}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} /> {item.commentsCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(item._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa"
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

      {/* Edit Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setEditingItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">Sửa kỷ niệm</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cảm nhận</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Vài dòng đáng nhớ về chuyến đi..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none resize-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Chế độ hiển thị</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPrivacy("private")}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${
                      editPrivacy === "private"
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Lock size={15} /> Chỉ mình tôi
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPrivacy("public")}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${
                      editPrivacy === "public"
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Globe size={15} /> Công khai
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 transition"
              >
                {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Xóa kỷ niệm này?</h3>
            <p className="text-center text-slate-500 mb-8 text-sm">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa kỷ niệm này không?
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
