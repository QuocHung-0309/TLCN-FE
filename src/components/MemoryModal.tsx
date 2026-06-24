"use client";

import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaGlobe,
  FaImage,
  FaLink,
  FaLock,
  FaMapMarkerAlt,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import { travelMemoryApi } from "@/lib/checkin/travelMemoryApi";
import { toast } from "react-hot-toast";
import { VIETNAM_PATHS } from "./VietnamMapPaths";

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Bỏ trống khi mở từ Bảng tin (không có tỉnh chọn trước) - khi đó hiện dropdown để tự chọn tỉnh */
  provinceName?: string;
  onSuccess: (provinceUnlocked: boolean) => void;
  bookingId?: string;
  /** Chế độ hiển thị mặc định. Mặc định "private" (giữ hành vi cũ khi tạo từ bản đồ) */
  defaultPrivacy?: "private" | "public";
}

export default function MemoryModal({
  isOpen,
  onClose,
  provinceName,
  onSuccess,
  bookingId,
  defaultPrivacy = "private",
}: MemoryModalProps) {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<"private" | "public">(defaultPrivacy);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const effectiveProvince = provinceName || selectedProvince;
  const provinceOptions = useMemo(
    () => Array.from(new Set(VIETNAM_PATHS.map((p) => p.title))).sort((a, b) => a.localeCompare(b, "vi")),
    []
  );

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
    if (!bookingId && !effectiveProvince) {
      toast.error("Vui lòng chọn tỉnh/thành");
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
          provinceName: effectiveProvince,
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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/25"
          >
            <div className="relative border-b border-slate-200 bg-white px-5 py-5 text-slate-900 sm:px-7">
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
              >
                <FaTimes size={18} />
              </button>

              <div className="flex items-start gap-4 pr-12">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 ring-1 ring-orange-100">
                  <FaMapMarkerAlt className="text-2xl" />
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
                    Nhật ký hành trình
                  </p>
                  <h3 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                    {provinceName ? `Lưu kỷ niệm tại ${provinceName}` : "Lưu kỷ niệm"}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Lưu lại ngày đi, ảnh và vài dòng cảm nhận để bản đồ của bạn
                    có thêm một câu chuyện đáng nhớ.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-600 ring-1 ring-orange-100">
                  1-3 ảnh
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 ring-1 ring-blue-100">
                  Riêng tư hoặc công khai
                </span>
                {bookingId && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
                    Xác thực qua tour
                  </span>
                )}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto bg-slate-50 px-5 py-5 sm:px-7 sm:py-6"
            >
              <div className="space-y-5">
                {!provinceName && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <FaMapMarkerAlt className="text-orange-500" />
                      Tỉnh/thành <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="" disabled>
                        Chọn tỉnh/thành bạn đã đến
                      </option>
                      {provinceOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </section>
                )}

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <FaCalendarAlt className="text-orange-500" />
                    Ngày đi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      min="2000-01-01"
                      value={visitedAt}
                      onChange={(e) => setVisitedAt(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <FaImage className="text-orange-500" />
                        Ảnh kỷ niệm <span className="text-rose-500">*</span>
                      </label>
                      <p className="mt-1 text-xs text-slate-500">
                        Tải ảnh từ máy hoặc dán link ảnh. Tối đa 3 ảnh.
                      </p>
                    </div>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                      {images.length}/3 ảnh
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[0.95fr_1.05fr]">
                    <label
                      className={`flex min-h-[132px] flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-center transition ${
                        remainingImageSlots <= 0 || isUploadingImage
                          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                          : "cursor-pointer border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400 hover:bg-orange-100 hover:shadow-md hover:shadow-orange-100"
                      }`}
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
                        {isUploadingImage ? (
                          <FaSpinner className="animate-spin text-xl" />
                        ) : (
                          <FaCloudUploadAlt className="text-2xl" />
                        )}
                      </div>
                      <span className="text-sm font-black">
                        {isUploadingImage ? "Đang tải ảnh..." : "Tải ảnh lên"}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        JPG, PNG, WEBP. Còn {remainingImageSlots} vị trí.
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleUploadImages}
                        disabled={remainingImageSlots <= 0 || isUploadingImage}
                        className="hidden"
                      />
                    </label>

                    <div className="flex flex-col justify-center gap-3">
                      <div className="relative">
                        <FaLink className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="url"
                          placeholder="Dán link ảnh vào đây..."
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddImage();
                            }
                          }}
                          disabled={remainingImageSlots <= 0 || isUploadingImage}
                          className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:text-slate-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddImage}
                        disabled={remainingImageSlots <= 0 || isUploadingImage}
                        className="h-12 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        Thêm link ảnh
                      </button>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {images.map((img, i) => (
                        <div
                          key={`${img}-${i}`}
                          className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                        >
                          <img
                            src={img}
                            alt={`Ảnh kỷ niệm ${i + 1}`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-950/65 px-2 py-2 text-[11px] font-bold text-white">
                            Ảnh {i + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            aria-label={`Xóa ảnh ${i + 1}`}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-rose-500 hover:text-white"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-sm font-bold text-slate-800">
                      Cảm nhận
                    </label>
                    <span className="text-xs font-semibold text-slate-400">
                      {caption.length}/500
                    </span>
                  </div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Vài dòng đáng nhớ về chuyến đi..."
                    maxLength={500}
                    rows={4}
                    className="min-h-[118px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
                  <label className="mb-3 block text-sm font-bold text-slate-800">
                    Chế độ hiển thị
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`relative cursor-pointer rounded-2xl border p-4 transition ${
                        privacy === "private"
                          ? "border-indigo-400 bg-indigo-50 shadow-sm shadow-indigo-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
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
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            privacy === "private"
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <FaLock />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                            Chỉ mình tôi
                            {privacy === "private" && (
                              <FaCheckCircle className="text-indigo-600" />
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Lưu trong dòng thời gian cá nhân.
                          </p>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`relative cursor-pointer rounded-2xl border p-4 transition ${
                        privacy === "public"
                          ? "border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
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
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            privacy === "public"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <FaGlobe />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                            Chia sẻ cộng đồng
                            {privacy === "public" && (
                              <FaCheckCircle className="text-emerald-600" />
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Hiển thị ở bảng tin và popup tỉnh.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </section>
              </div>

              <div className="sticky bottom-0 -mx-5 mt-6 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-base font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Đang lưu...
                    </>
                  ) : isUploadingImage ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Đang tải ảnh...
                    </>
                  ) : (
                    "Lưu kỷ niệm"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
