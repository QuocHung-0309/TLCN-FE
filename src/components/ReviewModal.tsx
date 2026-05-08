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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="bg-orange-50 p-6 border-b border-orange-100">
          <h3 className="text-xl font-bold text-blue-950">
            {initialData ? "Chỉnh sửa đánh giá" : "Đánh giá chuyến đi"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">{tour.title}</p>
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
              className="flex-1 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all disabled:opacity-70"
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
