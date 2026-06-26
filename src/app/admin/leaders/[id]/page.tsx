"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  updateAdminLeader,
  getAdminLeaderById,
  type UpdateLeaderBody,
} from "@/lib/admin/adminLeaderApi";
import { validateEmail, validateRequired } from "@/utils/validation";
import { Toast, useToast } from "@/components/ui/Toast";
import Link from "next/link";

export default function LeaderEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leader data
  useEffect(() => {
    (async () => {
      try {
        const leader = await getAdminLeaderById(id);
        setFormData({
          fullName: leader.fullName || "",
          username: leader.username,
          email: leader.email,
          phoneNumber: leader.phoneNumber || "",
          address: leader.address || "",
        });
      } catch {
        showError("Lỗi tải dữ liệu hướng dẫn viên");
        router.push("/admin/leaders");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, router]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLeaderBody) => updateAdminLeader(id, data),
    onSuccess: () => {
      showSuccess("Cập nhật hướng dẫn viên thành công!");
      setTimeout(() => {
        router.push("/admin/leaders");
      }, 2000);
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.message || "Không thể cập nhật hướng dẫn viên"
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

    const updateData: UpdateLeaderBody = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
    };
    updateMutation.mutate(updateData);
  };

  const inputBase =
    "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-slate-50 transition outline-none";
  const inputError =
    "w-full pl-10 pr-4 py-2.5 border border-red-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-sm bg-red-50 transition outline-none";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast {...toast} onClose={hideToast} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Chỉnh Sửa Hướng Dẫn Viên
              </h1>
              <p className="text-slate-600">
                Cập nhật thông tin của:{" "}
                <span className="font-semibold text-orange-600">{formData.fullName}</span>
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
                  <i className="ri-user-settings-line text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="font-semibold text-white text-base">Thông tin hướng dẫn viên</h2>
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
                  disabled={updateMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line"></i>
                      Lưu Thay Đổi
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
