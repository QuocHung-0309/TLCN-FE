"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plane, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { getMyFavorites, toggleFavorite, type FavoriteItem } from "@/lib/favorite/favoriteApi";

const vnd = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0,
      }).format(n) + "đ"
    : "—";

export default function FavoritesTab() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getMyFavorites();
      setFavorites(res.data || []);
    } catch (error) {
      console.error("Lỗi tải tour yêu thích:", error);
      toast.error("Không tải được danh sách tour yêu thích");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (e: React.MouseEvent, tourId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Optimistic update: remove instantly from UI
      setFavorites((prev) => prev.filter((item) => item.tourId?._id !== tourId));
      
      const res = await toggleFavorite(tourId);
      if (res.isFavorite) {
        // Should not happen, but if it reverts, reload
        fetchFavorites();
      }
    } catch (error) {
      toast.error("Lỗi khi bỏ yêu thích");
      fetchFavorites(); // Reload if failed
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Tour Yêu Thích</h2>
            <p className="text-sm text-slate-500">
              Danh sách các chuyến đi mà bạn đang quan tâm.
            </p>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-10 text-slate-500">
              <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent flex rounded-full mx-auto mb-3"></div>
              Đang tải danh sách...
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                <Heart className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa có tour yêu thích nào</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Bạn chưa lưu tour nào vào danh sách yêu thích. Hãy khám phá và lưu lại những điểm đến tuyệt vời nhé!
              </p>
              <Link 
                href="/user/tour-list" 
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 active:scale-95"
              >
                Khám phá tour ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {favorites.map((item) => {
                  const tour = item.tourId;
                  if (!tour) return null; // Handle edge case where tour might be deleted

                  return (
                    <motion.div
                      layout
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3 }}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                    >
                      <Link href={`/user/destination/slug/${tour._id}`} className="block relative aspect-video overflow-hidden">
                        <Image
                          src={tour.images?.[0] || "/placeholder-tour.jpg"}
                          alt={tour.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        
                        {/* Remove Favorite Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleRemoveFavorite(e, tour._id)}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-500 shadow-sm hover:bg-white transition-colors"
                          aria-label="Bỏ yêu thích"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </motion.button>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                           <h3 className="font-bold text-sm line-clamp-2 leading-snug drop-shadow-md">
                             {tour.title}
                           </h3>
                        </div>
                      </Link>

                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 mb-3">
                          {tour.destination && (
                            <div className="flex items-center gap-1.5">
                              <Plane className="w-3.5 h-3.5 text-orange-400" />
                              <span className="line-clamp-1">{tour.destination}</span>
                            </div>
                          )}
                          {tour.time && (
                            <div className="flex items-center gap-1.5">
                              <Clock3 className="w-3.5 h-3.5 text-orange-400" />
                              <span className="line-clamp-1">{tour.time}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                           <div className="text-sm font-semibold text-slate-800">
                             {tour.priceAdult ? (
                               <span className="text-orange-600 font-bold text-base">{vnd(tour.priceAdult)}</span>
                             ) : "Liên hệ"}
                           </div>
                           <Link 
                             href={`/user/destination/slug/${tour._id}`}
                             className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                           >
                             Xem chi tiết &rarr;
                           </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
