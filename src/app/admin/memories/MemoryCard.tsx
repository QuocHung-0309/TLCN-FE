import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MapPin, Heart, MessageCircle, EyeOff, Trash2, Eye } from "lucide-react";
import { AdminMemory } from "@/lib/admin/adminMemoryApi";

interface Props {
  memory: AdminMemory;
  onModerate: (id: string) => void;
  onDelete: (id: string, userName: string) => void;
  onViewComments?: (id: string) => void;
  isModerating: boolean;
  isDeleting: boolean;
}

export const MemoryCard = ({ memory, onModerate, onDelete, onViewComments, isModerating, isDeleting }: Props) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === memory.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? memory.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      {/* Header: User Info & Status */}
      <div className="p-4 flex items-start justify-between gap-2 border-b border-slate-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
            {memory.userId?.avatar ? (
              <img
                src={memory.userId.avatar}
                alt={memory.userId.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-bold">
                {memory.userId?.fullName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-800 text-sm truncate">
              {memory.userId?.fullName || "Người dùng ẩn"}
            </h4>
            <p className="text-xs text-slate-500 truncate">{memory.userId?.email}</p>
          </div>
        </div>
        
        {memory.privacy === "public" ? (
          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
            <Eye className="w-3 h-3" /> Công khai
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <EyeOff className="w-3 h-3" /> Riêng tư
          </span>
        )}
      </div>

      {/* Images Carousel */}
      <div className="relative aspect-square bg-slate-100">
        {memory.images && memory.images.length > 0 ? (
          <>
            <img
              src={memory.images[currentImageIndex]}
              alt={`Memory image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {memory.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                >
                  <i className="ri-arrow-left-s-line text-xl"></i>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                >
                  <i className="ri-arrow-right-s-line text-xl"></i>
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {memory.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <i className="ri-image-line text-4xl"></i>
            <span className="text-sm">Không có ảnh</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 text-orange-600 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" />
          {memory.provinceName}
        </div>
        
        <p className="text-slate-700 text-sm line-clamp-3 mb-3 flex-1">
          {memory.caption || <span className="text-slate-400 italic">Không có nội dung</span>}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <span>
            {format(new Date(memory.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> {memory.likesCount || 0}
            </span>
            <button
              onClick={() => onViewComments && onViewComments(memory._id)}
              className="flex items-center gap-1 hover:text-orange-500 transition"
              title="Xem bình luận"
            >
              <MessageCircle className="w-3.5 h-3.5" /> {memory.commentsCount || 0}
            </button>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => onModerate(memory._id)}
            disabled={isModerating || memory.privacy === "private"}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50
              bg-orange-50 text-orange-600 hover:bg-orange-100"
          >
            <EyeOff className="w-4 h-4" />
            {memory.privacy === "private" ? "Đã ẩn" : "Ẩn bài"}
          </button>
          <button
            onClick={() => onDelete(memory._id, memory.userId?.fullName || "Người dùng ẩn")}
            disabled={isDeleting}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50
              bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
