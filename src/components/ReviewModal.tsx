"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { createReview } from "@/lib/reviews/reviewApi";
import toast from "react-hot-toast";

interface ReviewModalProps {
  tour: { id: string; title: string };
  initialData?: { rating: number; comment: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  tour,
  initialData,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await createReview({
        tourId: tour.id,
        rating,
        comment: comment.trim(),
      });
      toast.success(initialData ? "Đã cập nhật đánh giá!" : "Cảm ơn bạn đã đánh giá tour!");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl shadow-slate-900/15 border border-slate-100 w-full max-w-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-white">
              {initialData ? "Chỉnh sửa đánh giá" : "Đánh giá chuyến đi"}
            </h3>
            <p className="text-sm text-white/75 mt-0.5 line-clamp-1">{tour.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-semibold text-slate-600">
              Bạn thấy chuyến đi thế nào?
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={`${
                      s <= (hover || rating)
                        ? "fill-orange-400 text-orange-400"
                        : "text-slate-200"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1">
              {rating === 5
                ? "Tuyệt vời"
                : rating === 4
                ? "Rất tốt"
                : rating === 3
                ? "Bình thường"
                : rating === 2
                ? "Tệ"
                : "Rất tệ"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Chia sẻ thêm cảm nhận
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tour rất tuyệt vời, hướng dẫn viên nhiệt tình..."
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:bg-white focus:border-orange-400 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
