"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  Camera,
  CheckCircle2,
  Globe2,
  Heart,
  ImageIcon,
  Lock,
  MapPin,
  MessageCircle,
  MoreVertical,
  Pencil,
  Send,
  Share2,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  travelMemoryApi,
  TravelMemoryComment,
} from "@/lib/checkin/travelMemoryApi";
import useUser from "#/src/hooks/useUser";
import { toast } from "react-hot-toast";
import MemoryModal from "@/components/MemoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface TimelineItem {
  _id: string;
  provinceName: string;
  visitedAt: string;
  caption: string;
  images: string[];
  privacy: "private" | "public";
  source: "manual" | "tour";
  userId?: {
    _id: string;
    fullName?: string;
    avatar?: string;
  };
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isLikedByMe?: boolean;
}

const DEFAULT_IMAGE = "/hot1.jpg";

const cleanCaption = (caption = "", provinceName = "") => {
  let text = caption.replace(/^\[Seed Journey\]\s*/i, "").trim();
  const provincePrefix = `${provinceName}:`;

  if (text.toLowerCase().startsWith(provincePrefix.toLowerCase())) {
    text = text.slice(provincePrefix.length).trim();
  }

  return text;
};

const getDisplayName = (item: TimelineItem) =>
  item.userId?.fullName || "Người dùng AHH";

const getInitials = (name = "AHH") =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có ngày";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatLongDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có ngày";

  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa xong";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatDate(value);
};

const sourceMeta = (source?: TimelineItem["source"]) => {
  if (source === "tour") {
    return {
      label: "Đã xác thực qua tour",
      shortLabel: "Qua tour AHH",
      icon: BadgeCheck,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
  }

  return {
    label: "Tự đánh dấu",
    shortLabel: "Tự đánh dấu",
    icon: MapPin,
    className: "bg-blue-50 text-blue-700 ring-blue-100",
  };
};

const Avatar = ({
  src,
  name,
  size = "md",
}: {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-sm"
        : "h-10 w-10 text-sm";

  if (src) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full bg-slate-100 ${sizeClass}`}>
        <Image src={src} alt={name || "Avatar"} fill sizes="48px" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white ${sizeClass}`}
    >
      {getInitials(name)}
    </div>
  );
};

const ImageGrid = ({ images, title }: { images?: string[]; title: string }) => {
  const safeImages = images?.length ? images.slice(0, 3) : [DEFAULT_IMAGE];

  if (safeImages.length === 1) {
    return (
      <div className="relative h-52 overflow-hidden rounded-xl bg-slate-100 sm:h-60">
        <Image
          src={safeImages[0]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 680px"
          className="object-cover"
        />
      </div>
    );
  }

  if (safeImages.length === 2) {
    return (
      <div className="grid h-52 grid-cols-2 gap-1.5 sm:h-60">
        {safeImages.map((image, index) => (
          <div key={image + index} className="relative overflow-hidden rounded-xl bg-slate-100">
            <Image src={image} alt={title} fill sizes="340px" className="object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-60 grid-cols-[1.25fr_0.9fr] gap-1.5 sm:h-64">
      <div className="relative overflow-hidden rounded-xl bg-slate-100">
        <Image src={safeImages[0]} alt={title} fill sizes="430px" className="object-cover" />
      </div>
      <div className="grid gap-1.5">
        {safeImages.slice(1).map((image, index) => (
          <div key={image + index} className="relative overflow-hidden rounded-xl bg-slate-100">
            <Image src={image} alt={title} fill sizes="250px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

const CompactImageGrid = ({
  images,
  title,
}: {
  images?: string[];
  title: string;
}) => {
  const safeImages = images?.length ? images.slice(0, 3) : [DEFAULT_IMAGE];
  const layoutClass =
    safeImages.length === 1
      ? ""
      : safeImages.length === 2
        ? "grid grid-cols-2 gap-1"
        : "grid grid-cols-2 grid-rows-2 gap-1";

  return (
    <div
      className={`relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:w-44 ${layoutClass}`}
    >
      {safeImages.map((image, index) => (
        <div
          key={image + index}
          className={`relative overflow-hidden ${
            safeImages.length === 1
              ? "h-full w-full"
              : index === 0 && safeImages.length === 3
                ? "row-span-2"
                : ""
          }`}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="176px"
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute bottom-2 right-2 rounded-full bg-slate-950/70 px-2 py-1 text-xs font-bold text-white">
        <Camera size={12} className="mr-1 inline" />
        {Math.max(images?.length || 1, 1)}
      </div>
    </div>
  );
};

export default function JourneyTimeline({
  initialTab = "me",
  filterProvince,
  mode,
  targetUserId,
}: {
  initialTab?: "me" | "community";
  filterProvince?: string;
  mode?: "user" | "normal";
  targetUserId?: string;
}) {
  const { user, isAuthenticated } = useUser();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentsByMemory, setCommentsByMemory] = useState<
    Record<string, TravelMemoryComment[]>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [postingComment, setPostingComment] = useState<Record<string, boolean>>({});
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; name: string } | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editPrivacy, setEditPrivacy] = useState<"private" | "public">("public");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  const isCommunity = initialTab === "community" || mode === "user";

  const fetchTimeline = async (pageToLoad = 1) => {
    // If fetching "me" tab and not authenticated, return
    if (!isCommunity && !isAuthenticated) return;
    if (pageToLoad === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let res;
      if (mode === "user" && targetUserId) {
        res = await travelMemoryApi.getUserPublicMemories(targetUserId, pageToLoad, PAGE_SIZE);
      } else {
        res = isCommunity
          ? await travelMemoryApi.getPublicMemories(filterProvince, pageToLoad, PAGE_SIZE)
          : await travelMemoryApi.getMyMemories(filterProvince, pageToLoad, PAGE_SIZE);
      }

      setTimeline((prev) => (pageToLoad === 1 ? res.data || [] : [...prev, ...(res.data || [])]));
      setPage(pageToLoad);
      setHasMore(pageToLoad < (res.pagination?.totalPages || 1));
    } catch {
      toast.error("Không thể tải dữ liệu hành trình.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTimeline(1);
  }, [isAuthenticated, isCommunity, filterProvince, mode, targetUserId]);

  const handleLoadMore = () => fetchTimeline(page + 1);

  const handleMemoryCreated = () => {
    setIsComposeOpen(false);
    toast.success("Đã lưu kỷ niệm!");
    fetchTimeline(1);
  };

  const communityStats = useMemo(() => {
    const provinceSet = new Set(timeline.map((item) => item.provinceName));
    return {
      posts: timeline.length,
      provinces: provinceSet.size,
      likes: timeline.reduce((total, item) => total + (item.likesCount || 0), 0),
      comments: timeline.reduce(
        (total, item) => total + (item.commentsCount || 0),
        0
      ),
      verified: timeline.filter((item) => item.source === "tour").length,
    };
  }, [timeline]);

  const handleLike = async (id: string, isLiked: boolean) => {
    if (!isAuthenticated) return;

    setTimeline((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              isLikedByMe: !isLiked,
              likesCount: Math.max((item.likesCount || 0) + (isLiked ? -1 : 1), 0),
            }
          : item
      )
    );

    try {
      if (isLiked) {
        await travelMemoryApi.unlikeMemory(id);
      } else {
        await travelMemoryApi.likeMemory(id);
      }
    } catch {
      toast.error("Không thể cập nhật lượt thích.");
      setTimeline((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                isLikedByMe: isLiked,
                likesCount: Math.max(
                  (item.likesCount || 0) + (isLiked ? 1 : -1),
                  0
                ),
              }
            : item
        )
      );
    }
  };

  const loadComments = async (memoryId: string) => {
    if (commentsByMemory[memoryId]) return;

    setLoadingComments((prev) => ({ ...prev, [memoryId]: true }));
    try {
      const res = await travelMemoryApi.getComments(memoryId, 1, 20);
      setCommentsByMemory((prev) => ({
        ...prev,
        [memoryId]: res.data || [],
      }));
    } catch {
      toast.error("Không thể tải bình luận.");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [memoryId]: false }));
    }
  };

  const toggleComments = async (memoryId: string) => {
    const willOpen = !openComments[memoryId];
    setOpenComments((prev) => ({ ...prev, [memoryId]: willOpen }));
    if (willOpen) await loadComments(memoryId);
  };

  const handleSubmitComment = async (
    event: FormEvent<HTMLFormElement>,
    memoryId: string
  ) => {
    event.preventDefault();
    const content = (commentInputs[memoryId] || "").trim();

    if (!content) return;

    setPostingComment((prev) => ({ ...prev, [memoryId]: true }));
    try {
      const res = await travelMemoryApi.createComment(memoryId, content);
      setCommentsByMemory((prev) => ({
        ...prev,
        [memoryId]: [...(prev[memoryId] || []), res.comment],
      }));
      setTimeline((prev) =>
        prev.map((item) =>
          item._id === memoryId
            ? { ...item, commentsCount: (item.commentsCount || 0) + 1 }
            : item
        )
      );
      setCommentInputs((prev) => ({ ...prev, [memoryId]: "" }));
      setOpenComments((prev) => ({ ...prev, [memoryId]: true }));
    } catch {
      toast.error("Không thể gửi bình luận.");
    } finally {
      setPostingComment((prev) => ({ ...prev, [memoryId]: false }));
    }
  };

  const handleDeleteComment = async (memoryId: string, commentId: string) => {
    try {
      await travelMemoryApi.deleteComment(memoryId, commentId);
      setCommentsByMemory((prev) => ({
        ...prev,
        // Xoá luôn các reply thuộc comment này để tránh hiển thị reply "mồ côi"
        [memoryId]: (prev[memoryId] || []).filter(
          (comment) => comment._id !== commentId && comment.parentCommentId !== commentId
        ),
      }));
      setTimeline((prev) =>
        prev.map((item) =>
          item._id === memoryId
            ? {
                ...item,
                commentsCount: Math.max((item.commentsCount || 0) - 1, 0),
              }
            : item
        )
      );
    } catch {
      toast.error("Không thể xóa bình luận.");
    }
  };

  const handleShare = async (memoryId: string) => {
    const shareUrl = `${window.location.origin}/user/map?tab=newsfeed&postId=${memoryId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Kỷ niệm du lịch trên AHH Travel",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Đã sao chép liên kết bài viết.");
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Đã sao chép liên kết bài viết.");
    }

    setTimeline((prev) =>
      prev.map((item) =>
        item._id === memoryId ? { ...item, sharesCount: (item.sharesCount || 0) + 1 } : item
      )
    );
    try {
      await travelMemoryApi.shareMemory(memoryId);
    } catch {
      // Chia sẻ nhẹ: không quan trọng nếu đếm lượt chia sẻ lỗi
    }
  };

  const handleSubmitReply = async (memoryId: string) => {
    const content = replyInput.trim();
    if (!content || !replyTarget) return;

    setSubmittingReply(true);
    try {
      const res = await travelMemoryApi.createComment(memoryId, content, replyTarget.commentId);
      setCommentsByMemory((prev) => ({
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
      toast.error("Không thể gửi trả lời.");
    } finally {
      setSubmittingReply(false);
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

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 h-8 w-64 animate-pulse rounded bg-slate-100" />
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-100 p-4">
              <div className="mb-4 flex gap-3">
                <div className="h-11 w-11 animate-pulse rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!timeline.length) {
    return (
      <section className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {isCommunity ? <Users size={30} /> : <ImageIcon size={30} />}
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {mode === "user"
            ? "Người này chưa có bài viết công khai"
            : isCommunity
              ? "Chưa có bài đăng cộng đồng"
              : "Chưa có kỷ niệm nào"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {mode === "user"
            ? "Khi họ chia sẻ kỷ niệm ở chế độ công khai, bài viết sẽ xuất hiện tại đây."
            : isCommunity
              ? "Khi người dùng chia sẻ kỷ niệm ở chế độ công khai, bài viết sẽ xuất hiện tại đây."
              : "Hãy lưu kỷ niệm đầu tiên để dòng thời gian cá nhân bắt đầu có dấu chân của bạn."}
        </p>
      </section>
    );
  }

  if (isCommunity) {
    return (
      <>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,680px)_280px] lg:justify-center">
        <div className="space-y-4">
          {initialTab === "community" && (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                    <Users size={14} />
                    Cộng đồng AHH Travel
                  </p>
                  <h2 className="text-xl font-black text-slate-900 md:text-2xl">
                    Bảng tin cộng đồng
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Những kỷ niệm công khai từ mọi người, có thể thả tim và bình luận.
                  </p>
                </div>
                <div className="w-fit rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                  {communityStats.posts} bài viết mới nhất
                </div>
              </div>
            </div>
          )}

          {initialTab === "community" && (
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <Avatar src={user?.avatar} name={user?.fullName} size="md" />
            <span className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
              Chia sẻ kỷ niệm du lịch của bạn...
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
              <Camera size={16} /> Đăng kỷ niệm
            </span>
          </button>
          )}

          {timeline.map((item, index) => {
            const meta = sourceMeta(item.source);
            const SourceIcon = meta.icon;
            const caption = cleanCaption(item.caption, item.provinceName);
            const comments = commentsByMemory[item._id] || [];
            const rootComments = comments.filter((c) => !c.parentCommentId);
            const repliesByParent = comments.reduce<Record<string, TravelMemoryComment[]>>((acc, c) => {
              if (c.parentCommentId) {
                (acc[c.parentCommentId] ||= []).push(c);
              }
              return acc;
            }, {});
            const displayName = getDisplayName(item);
            const isOwner = !!user && item.userId?._id === user.id;

            return (
              <motion.article
                id={`memory-${item._id}`}
                key={item._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <Link href={`/user/traveler/${item.userId?._id}`} className="shrink-0">
                        <Avatar src={item.userId?.avatar} name={displayName} size="md" />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          href={`/user/traveler/${item.userId?._id}`}
                          className="truncate text-base font-bold text-slate-900 hover:underline"
                        >
                          {displayName}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{formatRelativeTime(item.visitedAt)}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} />
                            {item.provinceName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${meta.className}`}
                      >
                        <SourceIcon size={13} />
                        {meta.shortLabel}
                      </span>

                      {isOwner && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {openMenuId === item._id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Pencil size={15} /> Sửa bài
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setDeletingId(item._id);
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={15} /> Xóa bài
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {caption && (
                    <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {caption}
                    </p>
                  )}
                </div>

                <div className="px-4">
                  <ImageGrid images={item.images} title={item.provinceName} />
                </div>

                <div className="px-4 pb-4 pt-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5">
                        <Heart size={14} className="text-rose-500" />
                        {item.likesCount || 0} lượt thích
                      </span>
                      <button
                        onClick={() => toggleComments(item._id)}
                        className="inline-flex items-center gap-1.5 hover:text-blue-700"
                      >
                        <MessageCircle size={14} />
                        {item.commentsCount || 0} bình luận
                      </button>
                    </div>
                    <span>{formatDate(item.visitedAt)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 border-y border-slate-100 py-1.5">
                    <button
                      onClick={() => handleLike(item._id, !!item.isLikedByMe)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                        item.isLikedByMe
                          ? "bg-rose-50 text-rose-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={item.isLikedByMe ? "fill-rose-500" : ""}
                      />
                      Thích
                    </button>

                    <button
                      onClick={() => toggleComments(item._id)}
                      className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <MessageCircle size={16} />
                      Bình luận
                    </button>

                    <button
                      onClick={() => handleShare(item._id)}
                      className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <Share2 size={16} />
                      Chia sẻ {item.sharesCount ? `(${item.sharesCount})` : ""}
                    </button>
                  </div>

                  {openComments[item._id] && (
                    <div className="mt-3 space-y-3">
                      {loadingComments[item._id] ? (
                        <div className="space-y-3">
                          {Array.from({ length: 2 }).map((_, commentIndex) => (
                            <div key={commentIndex} className="flex gap-2.5">
                              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />
                              <div className="h-12 flex-1 animate-pulse rounded-xl bg-slate-100" />
                            </div>
                          ))}
                        </div>
                      ) : comments.length ? (
                        <div className="space-y-2.5">
                          {rootComments.map((comment) => {
                            const commentOwnerId = comment.userId?._id;
                            const canDelete = commentOwnerId && commentOwnerId === user?.id;
                            const replies = repliesByParent[comment._id] || [];

                            return (
                              <div key={comment._id}>
                                <div className="flex gap-2.5">
                                  <Avatar
                                    src={comment.userId?.avatar}
                                    name={comment.userId?.fullName}
                                    size="sm"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                                      <div className="mb-1 flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-bold text-slate-900">
                                          {comment.userId?.fullName || "Người dùng AHH"}
                                        </p>
                                        {canDelete && (
                                          <button
                                            onClick={() =>
                                              handleDeleteComment(item._id, comment._id)
                                            }
                                            className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-rose-500"
                                            title="Xóa bình luận"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        )}
                                      </div>
                                      <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                                        {comment.content}
                                      </p>
                                    </div>
                                    <div className="mt-1 flex items-center gap-3 px-2">
                                      <p className="text-xs text-slate-400">
                                        {formatRelativeTime(comment.createdAt)}
                                      </p>
                                      <button
                                        onClick={() =>
                                          setReplyTarget({
                                            commentId: comment._id,
                                            name: comment.userId?.fullName || "Người dùng AHH",
                                          })
                                        }
                                        className="text-xs font-semibold text-slate-500 hover:text-blue-700"
                                      >
                                        Trả lời
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {replies.length > 0 && (
                                  <div className="ml-9 mt-2 space-y-2">
                                    {replies.map((reply) => {
                                      const replyOwnerId = reply.userId?._id;
                                      const canDeleteReply = replyOwnerId && replyOwnerId === user?.id;

                                      return (
                                        <div key={reply._id} className="flex gap-2">
                                          <Avatar
                                            src={reply.userId?.avatar}
                                            name={reply.userId?.fullName}
                                            size="sm"
                                          />
                                          <div className="min-w-0 flex-1">
                                            <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                                              <div className="mb-0.5 flex items-center justify-between gap-2">
                                                <p className="truncate text-xs font-bold text-slate-900">
                                                  {reply.userId?.fullName || "Người dùng AHH"}
                                                </p>
                                                {canDeleteReply && (
                                                  <button
                                                    onClick={() =>
                                                      handleDeleteComment(item._id, reply._id)
                                                    }
                                                    className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-rose-500"
                                                    title="Xóa trả lời"
                                                  >
                                                    <Trash2 size={12} />
                                                  </button>
                                                )}
                                              </div>
                                              <p className="whitespace-pre-line text-xs leading-5 text-slate-700">
                                                {reply.content}
                                              </p>
                                            </div>
                                            <p className="mt-0.5 px-2 text-[11px] text-slate-400">
                                              {formatRelativeTime(reply.createdAt)}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {replyTarget?.commentId === comment._id && (
                                  <div className="ml-9 mt-2 flex items-center gap-2">
                                    <input
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
                                      maxLength={500}
                                      placeholder={`Trả lời ${replyTarget.name}...`}
                                      className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-300 focus:bg-white"
                                    />
                                    <button
                                      onClick={() => handleSubmitReply(item._id)}
                                      disabled={submittingReply || !replyInput.trim()}
                                      className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40"
                                    >
                                      <Send size={12} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReplyTarget(null);
                                        setReplyInput("");
                                      }}
                                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                          Chưa có bình luận nào. Hãy là người mở lời cho chuyến đi này.
                        </p>
                      )}

                      <form
                        onSubmit={(event) => handleSubmitComment(event, item._id)}
                        className="flex gap-2.5"
                      >
                        <Avatar src={user?.avatar} name={user?.fullName} size="sm" />
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-blue-300 focus-within:bg-white">
                          <input
                            value={commentInputs[item._id] || ""}
                            onChange={(event) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [item._id]: event.target.value,
                              }))
                            }
                            maxLength={500}
                            placeholder="Viết bình luận..."
                            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                          />
                          <button
                            type="submit"
                            disabled={postingComment[item._id]}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <Send size={15} />
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
              >
                {loadingMore ? "Đang tải..." : "Tải thêm bài viết"}
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-base font-black text-slate-900">
              <TrendingUp size={18} className="text-blue-600" />
              Hoạt động cộng đồng
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Bài viết", value: communityStats.posts },
                { label: "Tỉnh/thành", value: communityStats.provinces },
                { label: "Lượt thích", value: communityStats.likes },
                { label: "Bình luận", value: communityStats.comments },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-black text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
              <Sparkles size={16} className="text-blue-600" />
              Cách đăng lên cộng đồng
            </h3>
            <p className="text-xs leading-5 text-slate-600">
              Khi lưu kỷ niệm, chọn chế độ công khai. Bài viết sẽ xuất hiện ở bảng
              tin để mọi người có thể thả tim và bình luận.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">
              {communityStats.verified} bài viết đã xác thực qua tour
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Các bài này đến từ hành trình đã đặt trên hệ thống AHH Travel.
            </p>
          </div>
        </aside>
      </section>

      <MemoryModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSuccess={handleMemoryCreated}
        defaultPrivacy="public"
      />

      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setEditingItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="font-bold text-slate-800">Sửa bài viết</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cảm nhận</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Vài dòng đáng nhớ về chuyến đi..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Chế độ hiển thị</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPrivacy("private")}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
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
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      editPrivacy === "public"
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Globe2 size={15} /> Công khai
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 p-4">
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 py-2.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:brightness-105 disabled:opacity-50"
              >
                {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            <Calendar size={14} />
            Nhật ký cá nhân
          </p>
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
            Dòng thời gian của tôi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Các kỷ niệm bạn đã lưu, sắp xếp theo ngày đi mới nhất.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
          {timeline.length} kỷ niệm
        </div>
      </div>

      <div className="relative">
        <div className="absolute bottom-0 left-[24px] top-0 w-0.5 bg-slate-100" />

        <div className="space-y-5">
          {timeline.map((item, index) => {
            const meta = sourceMeta(item.source);
            const SourceIcon = meta.icon;
            const caption = cleanCaption(item.caption, item.provinceName);

            return (
              <motion.article
                key={item._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="relative flex gap-4"
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                  <CheckCircle2 size={22} />
                </div>

                <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <CompactImageGrid
                      images={item.images}
                      title={item.provinceName}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {item.provinceName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${meta.className}`}
                        >
                          <SourceIcon size={13} />
                          {meta.shortLabel}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-100">
                          {item.privacy === "public" ? (
                            <Globe2 size={13} />
                          ) : (
                            <Lock size={13} />
                          )}
                          {item.privacy === "public" ? "Công khai" : "Chỉ mình tôi"}
                        </span>
                      </div>

                      {caption && (
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                          {caption}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} />
                          {formatLongDate(item.visitedAt)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Heart size={13} />
                          {item.likesCount || 0} lượt thích
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle size={13} />
                          {item.commentsCount || 0} bình luận
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-full border border-slate-200 bg-slate-50 px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
          >
            {loadingMore ? "Đang tải..." : "Tải thêm"}
          </button>
        </div>
      )}
    </section>
  );
}
