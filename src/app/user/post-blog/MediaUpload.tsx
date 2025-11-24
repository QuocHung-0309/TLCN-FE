"use client";

import { useRef } from "react";
import { FiX, FiPlus } from "react-icons/fi";

interface MediaUploadProps {
  images: string[];
  videos: string[];
  onImagesChange: (files: File[]) => void;
  onVideosChange: (files: File[]) => void;
  removeImage: (index: number) => void;
  removeVideo: (index: number) => void;
}

export default function MediaUpload({
  images,
  videos,
  onImagesChange,
  onVideosChange,
  removeImage,
  removeVideo,
}: MediaUploadProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="bg-[var(--background)] rounded-lg border border-[var(--gray-5)] p-5">
      <h3 className="font-bold mb-8 text-[var(--foreground)]">PHƯƠNG TIỆN</h3>

      <div className="mb-5">
        <div className="flex items-center mb-3">
          <p className="font-medium text-[var(--foreground)] mr-3">Hình ảnh</p>
          {images.length > 0 && (
            <span className="text-sm text-[var(--gray-3)]">
              Đã chọn {images.length} hình ảnh
            </span>
          )}
        </div>

        {images.length === 0 ? (
          <div
            className="border-2 border-dashed border-[var(--gray-5)] rounded-lg p-6 text-center cursor-pointer bg-[#F9F9FC]"
            onClick={() => imageInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={imageInputRef}
              onChange={(e) =>
                onImagesChange(Array.from(e.target.files || []))
              }
            />
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-10 h-10 text-[var(--gray-3)] mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-[var(--gray-3)] mb-1">
                Chọn hình ảnh để tải lên
              </p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[var(--gray-5)] rounded-lg p-4 bg-[#F9F9FC] flex gap-3 flex-wrap">
            {images.map((src, idx) => (
              <div
                key={idx}
                className="w-38 h-38 md:w-38.5 md:h-38.5 max-[424px]:w-full max-[424px]:h-auto aspect-square rounded-lg overflow-hidden border border-[var(--gray-5)] relative group"
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-[var(--gray-3)] text-[var(--white)] rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}

            <div
              className="w-38 h-38 md:w-38.5 md:h-38.5 max-[424px]:w-full max-[424px]:h-auto aspect-square flex items-center justify-center border-2 border-dashed border-[var(--gray-5)] rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => imageInputRef.current?.click()}
            >
              <FiPlus size={24} className="text-[var(--gray-3)]" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={imageInputRef}
                onChange={(e) =>
                  onImagesChange(Array.from(e.target.files || []))
                }
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center mb-3">
          <p className="font-medium text-[var(--foreground)] mr-3">Video</p>
          {videos.length > 0 && (
            <span className="text-sm text-[var(--gray-3)]">
              Đã chọn {videos.length} video
            </span>
          )}
        </div>

        {videos.length === 0 ? (
          <div
            className="border-2 border-dashed border-[var(--gray-5)] rounded-lg p-6 text-center cursor-pointer bg-[#F9F9FC]"
            onClick={() => videoInputRef.current?.click()}
          >
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              ref={videoInputRef}
              onChange={(e) =>
                onVideosChange(Array.from(e.target.files || []))
              }
            />
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-10 h-10 text-[var(--gray-3)] mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-[var(--gray-3)]">Chọn video để tải lên</p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[var(--gray-5)] rounded-lg p-4 bg-[#F9F9FC] flex gap-3 flex-wrap">
            {videos.map((src, idx) => (
              <div
                key={idx}
                className="w-38 h-38 md:w-38.5 md:h-38.5 max-[424px]:w-full max-[424px]:h-auto aspect-square rounded-lg overflow-hidden border border-[var(--gray-5)] relative group"
              >
                <video
                  src={src}
                  className="w-full h-full object-cover"
                  controls
                />
                <button
                  onClick={() => removeVideo(idx)}
                  className="absolute top-1 right-1 bg-[var(--gray-3)] text-[var(--white)] rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}

            <div
              className="w-38 h-38 md:w-38.5 md:h-38.5 max-[424px]:w-full max-[424px]:h-auto aspect-square flex items-center justify-center border-2 border-dashed border-[var(--gray-5)] rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => videoInputRef.current?.click()}
            >
              <FiPlus size={24} className="text-[var(--gray-3)]" />
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                ref={videoInputRef}
                onChange={(e) =>
                  onVideosChange(Array.from(e.target.files || []))
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
