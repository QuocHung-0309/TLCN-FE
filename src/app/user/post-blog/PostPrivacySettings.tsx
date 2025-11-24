"use client";

import { useState, useEffect } from "react";
import { FiGlobe, FiUser, FiUsers, FiX } from "react-icons/fi";
import { FaSquareCheck } from "react-icons/fa6";
import { CiSquareCheck } from "react-icons/ci";
import Button from "@/components/ui/Button";

interface PostPrivacySettingsProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export default function PostPrivacySettings({
  value,
  onChange,
  onClose,
}: PostPrivacySettingsProps) {
  const options = [
    { key: "public", label: "Tất cả mọi người", icon: <FiGlobe /> },
    { key: "private", label: "Chỉ mình bạn", icon: <FiUser /> },
  ];

  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--foreground)]/40 z-50">
      <div className="bg-[var(--background)] rounded-xl shadow-lg w-[360px] p-5 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Cài đặt Bài viết</h2>
          <button
            onClick={onClose}
            className="text-[var(--gray-1)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        <p className="text-sm text-[var(--gray-1)] mb-3">
          Ai có thể thấy bài viết của bạn?
        </p>

        <div className="space-y-2">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTempValue(opt.key)}
              className={`cursor-pointer flex items-center justify-between w-full border rounded-lg px-3 py-2 text-left bg-[#EFF2FC] hover:bg-[#e0e4f3] ${
                tempValue === opt.key ? "border-[var(--primary)] " : "border-none"
              }`}
            >
              <div className="flex items-center gap-2">
                {opt.icon}
                <span>{opt.label}</span>
              </div>
              <span className="text-xl">
                {tempValue === opt.key ? (
                  <FaSquareCheck className="text-[#22C55E]" />
                ) : (
                  <CiSquareCheck className="text-[var(--foreground)]" />
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-5">                   
          <Button
            variant="outline-primary"
            onClick={onClose}
            className="flex-1 flex items-center gap-2 rounded-xl"
          >
            Quay lại
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onChange(tempValue);
              onClose();
            }}
            className="flex-1 flex items-center gap-2 rounded-xl"
          >
            Xong
          </Button>
        </div>
      </div>
    </div>
  );
}
