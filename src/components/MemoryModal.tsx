import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Lock, Globe, Camera, CalendarDays } from "lucide-react";
import { travelMemoryApi } from "@/lib/checkin/travelMemoryApi";
import { toast } from "react-hot-toast";

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  provinceName: string;
  onSuccess: (provinceUnlocked: boolean) => void;
  bookingId?: string;
}

export default function MemoryModal({
  isOpen,
  onClose,
  provinceName,
  onSuccess,
  bookingId,
}: MemoryModalProps) {
  const [visitedAt, setVisitedAt] = useState("");
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<"private" | "public">("private");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const remainingImageSlots = 3 - images.length;
  const isBusy = isLoading || isUploadingImage;
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = "";

    if (!selectedFiles.length) return;

    if (remainingImageSlots <= 0) {
      toast.error("Tối đa 3 ảnh");
      return;
    }

    if (selectedFiles.length > remainingImageSlots) {
      toast.error(`Chỉ còn ${remainingImageSlots} vị trí ảnh`);
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !allowedImageTypes.includes(file.type)
    );
    if (invalidFile) {
      toast.error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP");
      return;
    }

    setIsUploadingImage(true);
    try {
      const res = await travelMemoryApi.uploadImages(selectedFiles);
      const uploadedImages = res.images || [];

      if (!uploadedImages.length) {
        toast.error("Không nhận được link ảnh sau khi upload");
        return;
      }

      setImages((current) => [...current, ...uploadedImages].slice(0, 3));
      toast.success("Upload ảnh thành công");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể upload ảnh");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddImage = () => {
    if (isUploadingImage) {
      toast.error("Vui lòng chờ ảnh upload xong");
      return;
    }

    const imageUrl = imageUrlInput.trim();
    if (!imageUrl) return;

    if (remainingImageSlots <= 0) {
      toast.error("Tối đa 3 ảnh");
      return;
    }

    try {
      const parsedUrl = new URL(imageUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        toast.error("Link ảnh phải bắt đầu bằng http hoặc https");
        return;
      }
    } catch {
      toast.error("Link ảnh không hợp lệ");
      return;
    }

    if (images.includes(imageUrl)) {
      toast.error("Ảnh này đã được thêm");
      return;
    }

    setImages([...images, imageUrl]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingImage) {
      toast.error("Vui lòng chờ ảnh upload xong");
      return;
    }
    if (!visitedAt) {
      toast.error("Vui lòng chọn ngày đi");
      return;
    }
    if (images.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 ảnh");
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (bookingId) {
        res = await travelMemoryApi.createMemoryFromBooking(bookingId, {
          visitedAt,
          caption,
          images,
          privacy,
        });
      } else {
        res = await travelMemoryApi.createMemory({
          provinceName,
          visitedAt,
          caption,
          images,
          privacy,
          source: "manual",
        });
      }

      toast.success("Tạo kỷ niệm thành công!");
      onSuccess(res.provinceUnlocked);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo kỷ niệm");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative shrink-0 bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-5">
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 pr-8">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <Camera size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Lưu kỷ niệm
                  </h3>
                  <p className="text-sm text-indigo-100">tại {provinceName}</p>
                </div>
              </div>
            </div>

            <form
              id="memory-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar"
            >
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
                  <CalendarDays size={15} className="text-indigo-500" />
                  Ngày đi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={visitedAt}
                  onChange={(e) => setVisitedAt(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1">
                  <ImageIcon size={15} className="text-indigo-500" />
                  Ảnh kỷ niệm (1-3 ảnh) <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  Có thể tải ảnh từ máy hoặc dán link ảnh.
                </p>
                <div className="space-y-2 mb-2">
                  <label
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl text-sm font-semibold transition ${
                      remainingImageSlots <= 0 || isUploadingImage
                        ? "cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50"
                        : "cursor-pointer border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 hover:border-indigo-300"
                    }`}
                  >
                    <ImageIcon size={18} />
                    {isUploadingImage ? "Đang tải ảnh..." : "Tải ảnh lên"}
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleUploadImages}
                      disabled={remainingImageSlots <= 0 || isUploadingImage}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Hoặc dán link ảnh..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                      disabled={remainingImageSlots <= 0 || isUploadingImage}
                      className="min-w-0 flex-1 px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      disabled={remainingImageSlots <= 0 || isUploadingImage}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 disabled:opacity-50 transition"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square group">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover rounded-xl border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-sm hover:bg-rose-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Cảm nhận <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Vài dòng đáng nhớ về chuyến đi..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chế độ hiển thị
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition ${
                      privacy === "private"
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={privacy === "private"}
                      onChange={() => setPrivacy("private")}
                      className="sr-only"
                    />
                    <Lock size={16} />
                    <span className="text-sm font-semibold">Chỉ mình tôi</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition ${
                      privacy === "public"
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={privacy === "public"}
                      onChange={() => setPrivacy("public")}
                      className="sr-only"
                    />
                    <Globe size={16} />
                    <span className="text-sm font-semibold">Chia sẻ cộng đồng</span>
                  </label>
                </div>
              </div>
            </form>

            {/* Footer cố định, luôn thấy nút Lưu kể cả khi cuộn nội dung */}
            <div className="shrink-0 p-4 border-t border-slate-100 bg-white">
              <button
                type="submit"
                form="memory-form"
                disabled={isBusy}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold shadow-lg shadow-indigo-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading
                  ? "Đang lưu..."
                  : isUploadingImage
                    ? "Đang tải ảnh..."
                    : "Lưu kỷ niệm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
