"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Camera,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Lock,
  Globe,
  Heart,
  MessageCircle,
  Send,
  Share2,
  Trash2,
  X,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { travelMemoryApi } from "@/lib/checkin/travelMemoryApi";
import useUser from "#/src/hooks/useUser";
import { toast } from "react-hot-toast";
import { formatTimeAgo } from "@/lib/utils";
import { getAchievementById } from "@/lib/achievements";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import MemoryModal from "@/components/MemoryModal";

// Thanh "đăng kỷ niệm mới" ở đầu Bảng tin, để người dùng không cần qua tab
// Bản đồ rồi bấm đúng 1 tỉnh mới thấy nút tạo bài.
function ComposeBar({
  user,
  onClick,
}: {
  user: { fullName?: string; avatar?: string } | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 text-left hover:border-indigo-200 hover:shadow-md transition-all"
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.fullName || "Bạn"}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {(user?.fullName || "U").charAt(0).toUpperCase()}
        </div>
      )}
      <span className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 text-sm text-slate-500">
        Chia sẻ kỷ niệm du lịch của bạn...
      </span>
      <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition">
        <Camera size={16} /> Đăng kỷ niệm
      </span>
    </button>
  );
}

interface TimelineItem {
  _id: string;
  provinceName: string;
  visitedAt: string;
  createdAt: string;
  caption: string;
  images: string[];
  privacy: "private" | "public";
  source: "manual" | "tour";
  userId?: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isLikedByMe?: boolean;
  earnedAchievementId?: string | null;
  posterAchievementId?: string | null;
}

interface CommentItem {
  _id: string;
  content: string;
  createdAt: string;
  parentCommentId?: string | null;
  userId?: {
    _id: string;
    fullName: string;
    avatar: string;
  };
}

export default function JourneyTimeline({
  mode = "me",
  filterProvince,
  highlightId,
  targetUserId,
}: {
  mode?: "me" | "community" | "user";
  filterProvince?: string;
  /** id bài viết cần cuộn tới + highlight, dùng khi mở từ link chia sẻ */
  highlightId?: string | null;
  /** id người dùng cần xem bài viết, dùng khi mode="user" (trang cá nhân công khai) */
  targetUserId?: string;
}) {
  const { user, isAuthenticated } = useUser();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 10;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; name: string } | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const didScrollToHighlight = useRef(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editPrivacy, setEditPrivacy] = useState<"private" | "public">("public");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);
  const showPrevImage = () =>
    setLightbox((prev) =>
      prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : prev
    );
  const showNextImage = () =>
    setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev));

  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrevImage();
      if (e.key === "ArrowRight") showNextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  const fetchTimeline = async (pageToLoad = 1) => {
    if (!isAuthenticated) return;
    if (mode === "user" && !targetUserId) return;

    if (pageToLoad === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let res;
      if (mode === "me") {
        res = await travelMemoryApi.getMyMemories(filterProvince, pageToLoad, PAGE_SIZE);
      } else if (mode === "user" && targetUserId) {
        res = await travelMemoryApi.getUserPublicMemories(targetUserId, pageToLoad, PAGE_SIZE);
      } else {
        res = await travelMemoryApi.getPublicMemories(filterProvince, pageToLoad, PAGE_SIZE);
      }

      setTimeline((prev) => (pageToLoad === 1 ? res.data || [] : [...prev, ...(res.data || [])]));
      setPage(pageToLoad);
      setHasMore(pageToLoad < (res.pagination?.totalPages || 1));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTimeline(1);
  }, [isAuthenticated, mode, filterProvince, targetUserId]);

  const handleLoadMore = () => fetchTimeline(page + 1);

  const handleMemoryCreated = () => {
    setIsComposeOpen(false);
    toast.success("Đã lưu kỷ niệm!");
    fetchTimeline();
  };

  // Mở từ link chia sẻ: nếu bài chưa nằm trong trang đầu của feed, tải
  // riêng bài đó bằng id rồi gắn lên đầu danh sách để có thể cuộn tới.
  useEffect(() => {
    if (mode !== "community" || !highlightId || loading || didScrollToHighlight.current) return;

    const exists = timeline.some((t) => t._id === highlightId);
    if (exists) return;

    travelMemoryApi
      .getMemoryById(highlightId)
      .then((res) => {
        if (res.data) {
          setTimeline((prev) => [res.data, ...prev.filter((t) => t._id !== res.data._id)]);
        }
      })
      .catch(() => {
        toast.error("Không tìm thấy bài viết được chia sẻ");
        didScrollToHighlight.current = true;
      });
  }, [mode, highlightId, loading, timeline]);

  // Cuộn tới + highlight tạm thời bài viết được mở từ link chia sẻ.
  useEffect(() => {
    if (mode !== "community" || !highlightId || didScrollToHighlight.current) return;
    const el = itemRefs.current[highlightId];
    if (!el) return;

    didScrollToHighlight.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(highlightId);
    const timer = setTimeout(() => setHighlightedId(null), 2500);
    return () => clearTimeout(timer);
  }, [mode, highlightId, timeline]);

  const handleLike = async (id: string, isLiked: boolean) => {
    if (!isAuthenticated) return;
    try {
      setTimeline((prev) =>
        prev.map((item) => {
          if (item._id === id) {
            return {
              ...item,
              isLikedByMe: !isLiked,
              likesCount: (item.likesCount || 0) + (isLiked ? -1 : 1),
            };
          }
          return item;
        })
      );

      if (isLiked) {
        await travelMemoryApi.unlikeMemory(id);
      } else {
        await travelMemoryApi.likeMemory(id);
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  const toggleComments = async (id: string) => {
    setReplyTarget(null);
    setReplyInput("");
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (commentsMap[id]) return;

    setLoadingComments((prev) => new Set(prev).add(id));
    try {
      const res = await travelMemoryApi.getComments(id, 1, 20);
      setCommentsMap((prev) => ({ ...prev, [id]: res.data || [] }));
    } catch {
      toast.error("Không tải được bình luận");
    } finally {
      setLoadingComments((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSubmitComment = async (id: string) => {
    const content = (commentInputs[id] || "").trim();
    if (!content) return;

    setSubmittingComment((prev) => new Set(prev).add(id));
    try {
      const res = await travelMemoryApi.addComment(id, content);
      setCommentsMap((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), res.comment],
      }));
      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
      setTimeline((prev) =>
        prev.map((item) =>
          item._id === id
            ? { ...item, commentsCount: (item.commentsCount || 0) + 1 }
            : item
        )
      );
    } catch {
      toast.error("Không gửi được bình luận, vui lòng thử lại.");
    } finally {
      setSubmittingComment((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSubmitReply = async (memoryId: string) => {
    const content = replyInput.trim();
    if (!content || !replyTarget) return;

    setSubmittingReply(true);
    try {
      const res = await travelMemoryApi.addComment(memoryId, content, replyTarget.commentId);
      setCommentsMap((prev) => ({
        ...prev,
        [memoryId]: [...(prev[memoryId] || []), res.comment],
      }));
      setReplyInput("");
      setReplyTarget(null);
      setTimeline((prev) =>
        prev.map((item) =>
          item._id === memoryId
            ? { ...item, commentsCount: (item.commentsCount || 0) + 1 }
            : item
        )
      );
    } catch {
      toast.error("Không gửi được trả lời, vui lòng thử lại.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleShare = async (item: TimelineItem) => {
    const link = `${window.location.origin}/user/map?tab=newsfeed&postId=${item._id}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Đã sao chép liên kết!");
    } catch {
      toast.error("Không thể sao chép liên kết");
    }

    setTimeline((prev) =>
      prev.map((t) =>
        t._id === item._id ? { ...t, sharesCount: (t.sharesCount || 0) + 1 } : t
      )
    );
    try {
      await travelMemoryApi.shareMemory(item._id);
    } catch {
      // Không quan trọng với chia sẻ nhẹ, bỏ qua lỗi đếm lượt chia sẻ.
    }
  };

  const openEditModal = (item: TimelineItem) => {
    setOpenMenuId(null);
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
      setTimeline((prev) =>
        prev.map((item) =>
          item._id === editingItem._id
            ? { ...item, caption: editCaption, privacy: editPrivacy }
            : item
        )
      );
      toast.success("Đã cập nhật bài viết");
      setEditingItem(null);
    } catch {
      toast.error("Không cập nhật được bài viết, vui lòng thử lại.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await travelMemoryApi.deleteMemory(deletingId);
      setTimeline((prev) => prev.filter((item) => item._id !== deletingId));
      toast.success("Đã xóa bài viết");
    } catch {
      toast.error("Không xóa được bài viết, vui lòng thử lại.");
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  const handleDeleteComment = async (memoryId: string, commentId: string) => {
    try {
      await travelMemoryApi.deleteComment(memoryId, commentId);
      setCommentsMap((prev) => ({
        ...prev,
        // Xoá luôn các reply thuộc comment này để tránh hiển thị reply "mồ côi"
        [memoryId]: (prev[memoryId] || []).filter(
          (c) => c._id !== commentId && c.parentCommentId !== commentId
        ),
      }));
      setTimeline((prev) =>
        prev.map((item) =>
          item._id === memoryId
            ? { ...item, commentsCount: Math.max(0, (item.commentsCount || 0) - 1) }
            : item
        )
      );
    } catch {
      toast.error("Không xoá được bình luận.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {mode === "community" && (
          <ComposeBar user={user} onClick={() => setIsComposeOpen(true)} />
        )}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {mode === "me" ? "Chưa có kỷ niệm nào" : "Chưa có bài đăng nào"}
          </h3>
          <p className="text-slate-500 text-sm">
            {mode === "me"
              ? "Hãy bắt đầu chinh phục Việt Nam bằng cách lưu lại kỷ niệm tại địa điểm đầu tiên!"
              : mode === "user"
                ? "Người này chưa chia sẻ bài viết công khai nào."
                : "Hãy là người đầu tiên chia sẻ kỷ niệm tại đây!"}
          </p>
        </div>
        {mode === "community" && (
          <MemoryModal
            isOpen={isComposeOpen}
            onClose={() => setIsComposeOpen(false)}
            onSuccess={handleMemoryCreated}
            defaultPrivacy="public"
          />
        )}
      </div>
    );
  }

  // ===== Bảng tin cộng đồng / Trang cá nhân: hiển thị dạng feed Facebook/Instagram =====
  if (mode === "community" || mode === "user") {
    return (
      <>
      <div className="max-w-3xl mx-auto space-y-6">
        {mode === "community" && (
          <ComposeBar user={user} onClick={() => setIsComposeOpen(true)} />
        )}
        {timeline.map((item, index) => {
          const isExpanded = expandedId === item._id;
          const comments = commentsMap[item._id] || [];
          const rootComments = comments.filter((c) => !c.parentCommentId);
          const repliesByParent = comments.reduce<Record<string, CommentItem[]>>((acc, c) => {
            if (c.parentCommentId) {
              (acc[c.parentCommentId] ||= []).push(c);
            }
            return acc;
          }, {});
          const achievement = getAchievementById(item.earnedAchievementId);
          const AchievementIcon = achievement?.icon;
          const posterRank = getAchievementById(item.posterAchievementId);
          const PosterRankIcon = posterRank?.icon;
          const isHighlighted = highlightedId === item._id;

          return (
            <motion.article
              key={item._id}
              ref={(el) => {
                itemRefs.current[item._id] = el;
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-shadow duration-500 ${
                isHighlighted
                  ? "border-orange-400 ring-2 ring-orange-300 ring-offset-2"
                  : "border-slate-100"
              }`}
            >
              {/* Banner thành tựu: nổi bật khi bài đăng vừa giúp người dùng đạt mốc mới,
                  để khuyến khích người xem cũng check-in thêm */}
              {achievement && AchievementIcon && (
                <div
                  className={`flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r ${achievement.color} text-white`}
                >
                  <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                    <AchievementIcon size={15} />
                  </div>
                  <p className="text-sm font-bold truncate">
                    Vừa đạt thành tựu “{achievement.name}”!
                  </p>
                </div>
              )}

              {/* Header: avatar + tên + thời gian */}
              <div className="flex items-center gap-3.5 px-5 pt-4 pb-3">
                <Link href={`/user/traveler/${item.userId?._id}`} className="flex-shrink-0">
                  {item.userId?.avatar ? (
                    <img
                      src={item.userId.avatar}
                      alt={item.userId.fullName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-base text-white font-bold">
                      {(item.userId?.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Link
                      href={`/user/traveler/${item.userId?._id}`}
                      className="text-base font-bold text-slate-800 truncate hover:underline"
                    >
                      {item.userId?.fullName || "Người dùng"}
                    </Link>
                    {posterRank && PosterRankIcon && (
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 bg-gradient-to-r ${posterRank.color} text-white`}
                      >
                        <PosterRankIcon size={10} />
                        {posterRank.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{formatTimeAgo(item.createdAt)}</span>
                    <span>•</span>
                    <MapPin size={11} />
                    <span className="truncate">{item.provinceName}</span>
                    {item.source === "tour" && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
                        <Sparkles size={11} /> Tour
                      </span>
                    )}
                    {item.privacy === "private" && (
                      <span className="inline-flex items-center gap-0.5 text-slate-400">
                        <Lock size={11} /> Riêng tư
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu chủ bài: chỉ hiện cho người đăng bài, cho phép Sửa/Xoá */}
                {user && item.userId?._id === user.id && (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                      className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === item._id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-9 z-20 w-40 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                          <button
                            onClick={() => openEditModal(item)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Pencil size={15} /> Sửa bài
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setDeletingId(item._id);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 size={15} /> Xóa bài
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Caption */}
              {item.caption && (
                <p className="px-5 pb-3 text-[15px] text-slate-700 whitespace-pre-line">
                  {item.caption}
                </p>
              )}

              {/* Ảnh: bố cục lưới kiểu Facebook tùy theo số lượng ảnh */}
              {item.images && item.images.length === 1 && (
                <div
                  className="relative w-full aspect-[4/3] bg-slate-100 cursor-pointer"
                  onClick={() => openLightbox(item.images, 0)}
                >
                  <Image src={item.images[0]} alt={item.provinceName} fill className="object-cover" />
                </div>
              )}
              {item.images && item.images.length === 2 && (
                <div className="grid grid-cols-2 gap-1">
                  {item.images.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square bg-slate-100 cursor-pointer"
                      onClick={() => openLightbox(item.images, i)}
                    >
                      <Image src={src} alt={item.provinceName} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {item.images && item.images.length >= 3 && (
                <div className="grid grid-cols-2 grid-rows-2 gap-1 h-96">
                  <div
                    className="relative row-span-2 bg-slate-100 cursor-pointer"
                    onClick={() => openLightbox(item.images, 0)}
                  >
                    <Image src={item.images[0]} alt={item.provinceName} fill className="object-cover" />
                  </div>
                  {item.images.slice(1, 3).map((src, i) => (
                    <div
                      key={i}
                      className="relative bg-slate-100 cursor-pointer"
                      onClick={() => openLightbox(item.images, i + 1)}
                    >
                      <Image src={src} alt={item.provinceName} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions: like + comment */}
              <div className="flex items-center gap-2.5 px-5 py-3">
                <button
                  onClick={() => handleLike(item._id, !!item.isLikedByMe)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                    item.isLikedByMe
                      ? "bg-rose-50 text-rose-600"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <Heart size={16} className={item.isLikedByMe ? "fill-rose-500" : ""} />
                  {item.likesCount || 0}
                </button>
                <button
                  onClick={() => toggleComments(item._id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                    isExpanded
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <MessageCircle size={16} />
                  {item.commentsCount || 0}
                </button>
                <button
                  onClick={() => handleShare(item)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <Share2 size={16} />
                  {item.sharesCount || 0}
                </button>
              </div>

              {/* Bình luận */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-100"
                  >
                    <div className="px-5 py-3.5 space-y-3">
                      {loadingComments.has(item._id) ? (
                        <p className="text-sm text-slate-400">Đang tải bình luận...</p>
                      ) : comments.length === 0 ? (
                        <p className="text-sm text-slate-400">Chưa có bình luận nào.</p>
                      ) : (
                        rootComments.map((c) => {
                          const isOwner = user && c.userId?._id === user.id;
                          const replies = repliesByParent[c._id] || [];
                          return (
                            <div key={c._id}>
                              <div className="flex items-start gap-2 group">
                                {c.userId?.avatar ? (
                                  <img
                                    src={c.userId.avatar}
                                    alt={c.userId.fullName}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                                    {(c.userId?.fullName || "U").charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="bg-slate-100 rounded-xl px-3 py-2">
                                    <p className="text-xs font-bold text-slate-800">
                                      {c.userId?.fullName || "Người dùng"}
                                    </p>
                                    <p className="text-sm text-slate-700">{c.content}</p>
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5 ml-1">
                                    <p className="text-xs text-slate-400">{formatTimeAgo(c.createdAt)}</p>
                                    <button
                                      onClick={() =>
                                        setReplyTarget({
                                          commentId: c._id,
                                          name: c.userId?.fullName || "Người dùng",
                                        })
                                      }
                                      className="text-xs font-semibold text-slate-500 hover:text-indigo-600"
                                    >
                                      Trả lời
                                    </button>
                                  </div>
                                </div>
                                {isOwner && (
                                  <button
                                    onClick={() => handleDeleteComment(item._id, c._id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>

                              {/* Reply: 1 cấp, hiển thị thu nhỏ dưới comment gốc */}
                              {replies.length > 0 && (
                                <div className="mt-2 ml-9 space-y-2">
                                  {replies.map((r) => {
                                    const isReplyOwner = user && r.userId?._id === user.id;
                                    return (
                                      <div key={r._id} className="flex items-start gap-1.5 group">
                                        {r.userId?.avatar ? (
                                          <img
                                            src={r.userId.avatar}
                                            alt={r.userId.fullName}
                                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                                            {(r.userId?.fullName || "U").charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="bg-slate-50 rounded-xl px-2.5 py-1.5">
                                            <p className="text-[11px] font-bold text-slate-800">
                                              {r.userId?.fullName || "Người dùng"}
                                            </p>
                                            <p className="text-xs text-slate-700">{r.content}</p>
                                          </div>
                                          <p className="text-[11px] text-slate-400 mt-0.5 ml-1">
                                            {formatTimeAgo(r.createdAt)}
                                          </p>
                                        </div>
                                        {isReplyOwner && (
                                          <button
                                            onClick={() => handleDeleteComment(item._id, r._id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Ô nhập trả lời, chỉ hiện cho comment gốc đang được trả lời */}
                              {replyTarget?.commentId === c._id && (
                                <div className="mt-2 ml-9 flex items-center gap-2">
                                  <input
                                    type="text"
                                    autoFocus
                                    value={replyInput}
                                    onChange={(e) => setReplyInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSubmitReply(item._id);
                                      if (e.key === "Escape") {
                                        setReplyTarget(null);
                                        setReplyInput("");
                                      }
                                    }}
                                    placeholder={`Trả lời ${replyTarget.name}...`}
                                    maxLength={500}
                                    className="flex-1 px-3 py-1.5 rounded-full bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                  />
                                  <button
                                    onClick={() => handleSubmitReply(item._id)}
                                    disabled={submittingReply || !replyInput.trim()}
                                    className="p-1.5 rounded-full bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition"
                                  >
                                    <Send size={13} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReplyTarget(null);
                                      setReplyInput("");
                                    }}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}

                      {/* Input bình luận */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <input
                          type="text"
                          value={commentInputs[item._id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [item._id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmitComment(item._id);
                          }}
                          placeholder="Viết bình luận..."
                          maxLength={500}
                          className="flex-1 px-3.5 py-2 rounded-full bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        />
                        <button
                          onClick={() => handleSubmitComment(item._id)}
                          disabled={
                            submittingComment.has(item._id) || !(commentInputs[item._id] || "").trim()
                          }
                          className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}

        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-bold shadow-sm hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 transition"
            >
              {loadingMore ? "Đang tải..." : "Tải thêm bài viết"}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox: xem ảnh phóng to kiểu Facebook */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
            >
              <X size={24} />
            </button>

            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrevImage();
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <motion.div
              key={lightbox.index}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="relative w-full h-full max-w-5xl max-h-[88vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.images[lightbox.index]}
                alt="Ảnh kỷ niệm"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>

            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNextImage();
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
              >
                <ChevronRight size={28} />
              </button>
            )}

            {lightbox.images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-semibold">
                {lightbox.index + 1}/{lightbox.images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sửa bài: chỉ cảm nhận + chế độ hiển thị, giữ nguyên ảnh/tỉnh/ngày đi */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Sửa bài viết</h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
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
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold shadow-lg shadow-indigo-200 hover:brightness-105 disabled:opacity-50 transition"
                >
                  {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Xóa bài viết"
        message="Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText={deleting ? "Đang xóa..." : "Xóa"}
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />

      {mode === "community" && (
        <MemoryModal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          onSuccess={handleMemoryCreated}
          defaultPrivacy="public"
        />
      )}
      </>
    );
  }

  // ===== Hành trình cá nhân: timeline dọc theo ngày đi =====
  return (
    <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-bold text-slate-800">Hành trình của tôi</h3>
      </div>

      <div className="relative mt-4">
        <div className="absolute left-[39px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-emerald-200 to-slate-200" />

        <div className="space-y-6">
          {timeline.map((item, index) => {
            const date = (() => {
              const d = new Date(item.visitedAt);
              return {
                day: d.getDate(),
                month: d.toLocaleDateString("vi-VN", { month: "short" }),
              };
            })();

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-4 group"
              >
                <div className="flex-shrink-0 w-20 text-center">
                  <div
                    className={`relative z-10 w-12 h-12 mx-auto rounded-xl flex flex-col items-center justify-center shadow-md ${
                      item.source === "tour"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                        : "bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                    }`}
                  >
                    <span className="text-lg font-black leading-none">{date.day}</span>
                    <span className="text-[10px] font-medium opacity-90">{date.month}</span>
                  </div>
                </div>

                <div className="flex-1 bg-slate-50 rounded-2xl p-4 group-hover:bg-slate-100 transition-colors overflow-hidden">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={(item.images && item.images.length > 0) ? item.images[0] : "/hot1.jpg"}
                        alt={item.provinceName}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                        <Camera size={12} className="text-slate-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 truncate">{item.provinceName}</h4>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.source === "tour"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.source === "tour" ? (
                              <>
                                <Sparkles size={10} /> Đã xác thực qua tour
                              </>
                            ) : (
                              <>
                                <MapPin size={10} /> Tự đánh dấu
                              </>
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-600">
                            {item.privacy === "public" ? <Globe size={10} /> : <Lock size={10} />}
                            {item.privacy === "public" ? "Công khai" : "Chỉ mình tôi"}
                          </span>
                        </div>
                      </div>

                      {item.caption && (
                        <p className="text-sm text-slate-600 mt-2 italic border-l-2 border-indigo-200 pl-2">
                          &quot;{item.caption.length > 80 ? item.caption.substring(0, 80) + "..." : item.caption}&quot;
                        </p>
                      )}

                      {item.source === "tour" && (!item.images || item.images.length === 0) && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <Link href="/user/bookings" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                            Thêm hình ảnh kỷ niệm <ChevronRight size={12} />
                          </Link>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                        <Calendar size={12} />
                        {new Date(item.visitedAt).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 transition"
          >
            {loadingMore ? "Đang tải..." : "Tải thêm"}
          </button>
        </div>
      )}
    </section>
  );
}
