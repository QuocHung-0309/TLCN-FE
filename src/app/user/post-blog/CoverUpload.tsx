"use client";

import { useRef } from "react";
import { FiPlus, FiX } from "react-icons/fi";

interface CoverUploadProps {
  cover: string | null;
  onCoverChange: (file: File) => void;
  onRemove?: () => void;
}

export default function CoverUpload({ cover, onCoverChange, onRemove }: CoverUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onCoverChange(event.target.files[0]);
    }
  };

  return (  
    <div className="w-full p-6 flex items-center justify-center h-[348px] border border-[var(--gray-5)] rounded-lg bg-[var(--background)]">
      {!cover ? (
        <div
        className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--gray-5)] rounded-lg cursor-pointer bg-[#F9F9FC]"
        onClick={() => fileInputRef.current?.click()}
        >
        <div className="relative flex items-center justify-center w-16 h-16 border border-[var(--gray-5)] rounded-lg bg-[var(--background)]">
            <FiPlus size={28} className="text-[var(--gray-2)]" />
        </div>
        <p className="mt-4 font-medium text-[var(--foreground)] mr-3">Thêm hình cover bài viết</p>
        </div>
      ) : (
        <div className="relative w-full">
          <img
            src={cover}
            alt="Cover"
            className="rounded-xl object-cover w-full max-h-[300px]"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-3 right-3 bg-[var(--gray-3)] hover:bg-[var(--gray-2)] text-[var(--white)] p-1 rounded-full"
            >
              <FiX/>
            </button>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
