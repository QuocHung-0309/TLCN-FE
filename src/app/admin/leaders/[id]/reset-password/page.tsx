"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { updateAdminLeader, type UpdateLeaderBody } from "@/lib/admin/adminLeaderApi";
import { Toast, useToast } from "@/components/ui/Toast";
import Link from "next/link";

export default function LeaderResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới là bắt buộc";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutation
  const resetMutation = useMutation({
    mutationFn: (password: string) =>
      updateAdminLeader(id, { password }),
    onSuccess: () => {
      showSuccess("Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        router.push("/admin/leaders");
      }, 2000);
    },
    onError: (error: any) => {
      showError(
        error?.response?.data?.message || "Không thể đặt lại mật khẩu"
      );
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    resetMutation.mutate(formData.newPassword);
  };

  const inputBase =
    "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none";
  const inputError =
    "w-full pl-10 pr-4 py-2.5 border border-red-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm bg-red-50 transition outline-none";

  return (
    <>
      <Toast {...toast} onClose={hideToast} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="mx-auto max-w-lg">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Đặt Lại Mật Khẩu
              </h1>
              <p className="text-slate-600">
                Thiết lập mật khẩu mới cho hướng dẫn viên
              </p>
            </div>
            <Link
              href="/admin/leaders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition shadow-sm shrink-0"
            >
              <i className="ri-arrow-left-line"></i>
              Quay lại
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <i className="ri-key-2-line text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="font-semibold text-white text-base">Mật khẩu mới</h2>
                  <p className="text-orange-100 text-xs">Mật khẩu phải đáp ứng các yêu cầu bảo mật</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <i className="ri-lock-password-line text-lg"></i>
                  </span>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={errors.newPassword ? inputError : inputBase}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                {errors.newPassword && (
                  <div className="mt-1.5 ml-1">
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>{errors.newPassword}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <i className="ri-lock-2-line text-lg"></i>
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? inputError : inputBase}
                    placeholder="Xác nhận mật khẩu mới"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resetMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="ri-key-2-line"></i>
                      Đặt Lại Mật Khẩu
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition font-medium text-sm flex items-center gap-2"
                >
                  <i className="ri-close-line"></i>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
