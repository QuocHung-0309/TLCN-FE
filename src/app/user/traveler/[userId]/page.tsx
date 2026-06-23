"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Lock, MessageCircle, Newspaper } from "lucide-react";
import { travelMemoryApi } from "@/lib/checkin/travelMemoryApi";
import { blogApi, BlogSummary } from "@/lib/blog/blogApi";
import { getAchievementById } from "@/lib/achievements";
import useUser from "#/src/hooks/useUser";
import JourneyTimeline from "../../map/JourneyTimeline";

interface ProfileHeader {
  user: { _id?: string; fullName: string; avatar?: string };
  totalProvinces: number;
  posterAchievementId: string | null;
}

export default function TravelerProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated, loading: userLoading } = useUser();
  const [header, setHeader] = useState<ProfileHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    setLoading(true);
    setNotFound(false);
    travelMemoryApi
      .getUserPublicMemories(userId, 1, 1)
      .then((res: any) => {
        setHeader({
          user: res.user,
          totalProvinces: res.totalProvinces,
          posterAchievementId: res.posterAchievementId,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    blogApi
      .getBlogsByAuthor(userId, 1, 6)
      .then((res) => setBlogs(res.data || []))
      .catch(() => setBlogs([]));
  }, [isAuthenticated, userId]);

  const achievement = getAchievementById(header?.posterAchievementId);
  const AchievementIcon = achievement?.icon;

  if (userLoading) return null;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center max-w-sm">
          <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="font-bold text-slate-800 mb-2">Cần đăng nhập</h2>
          <p className="text-sm text-slate-500 mb-4">
            Đăng nhập để xem trang cá nhân của người dùng này.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition"
          >
            Đăng nhập
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Link
          href="/user/map?tab=newsfeed"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} /> Quay lại Bảng tin
        </Link>

        {loading ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse h-32" />
        ) : notFound || !header ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center text-slate-500">
            Không tìm thấy người dùng này.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5"
          >
            {header.user?.avatar ? (
              <img
                src={header.user.avatar}
                alt={header.user.fullName}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-2xl text-white font-bold flex-shrink-0">
                {(header.user?.fullName || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-900 truncate">
                {header.user?.fullName || "Người dùng"}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  <MapPin size={12} /> {header.totalProvinces} tỉnh đã chinh phục
                </span>
                {achievement && AchievementIcon && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${achievement.color} text-white`}
                  >
                    <AchievementIcon size={12} /> {achievement.name}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!loading && !notFound && header && blogs.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-4">
              <Newspaper size={18} className="text-indigo-500" /> Bài viết đã chia sẻ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blogs.map((b) => (
                <Link
                  key={b.slug}
                  href={`/user/blog/${b.slug}`}
                  className="flex gap-3 rounded-2xl border border-slate-100 p-3 hover:border-indigo-200 hover:bg-slate-50 transition"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <Image
                      src={b.cover || b.coverImageUrl || "/hot1.jpg"}
                      alt={b.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-slate-800 line-clamp-2">{b.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MessageCircle size={11} /> {b.commentsCount || 0} bình luận
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && !notFound && header && (
          <JourneyTimeline mode="user" targetUserId={userId} />
        )}
      </div>
    </main>
  );
}
