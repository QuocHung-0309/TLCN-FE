"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminLeader, type CreateLeaderBody } from "@/lib/admin/adminLeaderApi";
import { validateEmail, validateRequired } from "@/utils/validation";
import { Toast, useToast } from "@/components/ui/Toast";
import Link from "next/link";

export default function LeaderCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (data: CreateLeaderBody) => createAdminLeader(data),
    onSuccess: () => {
      showSuccess("Tạo hướng dẫn viên thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminLeaders"] });
      setTimeout(() => {
        router.push("/admin/leaders");
      }, 2000);
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.message || "Không thể tạo hướng dẫn viên"
      );
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const fullNameError = validateRequired(formData.fullName, "Họ tên");
    if (fullNameError) newErrors.fullName = fullNameError;

    const usernameError = validateRequired(formData.username, "Tài khoản");
    if (usernameError) newErrors.username = usernameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    createMutation.mutate(formData);
  };

  const inputBase =
    "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none";
  const inputError =
    "w-full pl-10 pr-4 py-2.5 border border-red-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm bg-red-50 transition outline-none";

  return (
    <>
      <Toast {...toast} onClose={hideToast} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Thêm Hướng Dẫn Viên
              </h1>
              <p className="text-slate-600">
                Tạo tài khoản mới cho hướng dẫn viên
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
                  <i className="ri-user-add-line text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="font-semibold text-white text-base">Thông tin tài khoản</h2>
                  <p className="text-orange-100 text-xs">Điền đầy đủ các trường bắt buộc (*)</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <i className="ri-user-line text-lg"></i>
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? inputError : inputBase}
                    placeholder="Nhập họ tên"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>{errors.fullName}
                  </p>
                )}
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Tài khoản <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="ri-at-line text-lg"></i>
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={errors.username ? inputError : inputBase}
                      placeholder="Nhập tài khoản"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>{errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="ri-mail-line text-lg"></i>
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? inputError : inputBase}
                      placeholder="Nhập email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>{errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <i className="ri-lock-line text-lg"></i>
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? inputError : inputBase}
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>{errors.password}
                  </p>
                )}
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Điện thoại
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="ri-phone-line text-lg"></i>
                    </span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={inputBase}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Địa chỉ
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="ri-map-pin-line text-lg"></i>
                    </span>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={inputBase}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line"></i>
                      Thêm Hướng Dẫn Viên
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
