"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateUser, useUpdateUser, useUserDetail } from "../hooks/useUsers";
import { validatePassword, validateEmail, validateRequired } from "@/utils/validation";
import { Toast, useToast } from "@/components/ui/Toast";
import Link from "next/link";

type UserFormProps = {
  userId?: string;
  mode: "create" | "edit";
};

export default function UserForm({ userId, mode }: UserFormProps) {
  const router = useRouter();
  const { data: user } = useUserDetail(userId || "");
  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser(userId || "");
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    if (mode === "edit" && user) {
      setFormData(f => ({
        ...f,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      }));
    }
  }, [user, mode]);

  const isPending = isCreating || isUpdating;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string | string[]> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const usernameError = validateRequired(formData.username, "Tên đăng nhập");
    if (usernameError) newErrors.username = usernameError;

    const fullNameError = validateRequired(formData.fullName, "Họ tên");
    if (fullNameError) newErrors.fullName = fullNameError;

    if (mode === "create") {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "create") {
        await createUser({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        });
        showSuccess("Tạo người dùng thành công!");
        setTimeout(() => {
          router.push("/admin/users");
        }, 2000);
      } else {
        await updateUser({
          email: formData.email,
          username: formData.username,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        });
        showSuccess("Cập nhật người dùng thành công!");
        setTimeout(() => {
          router.push("/admin/users");
        }, 2000);
      }
    } catch (err: any) {
      showError(err.response?.data?.message || "Có lỗi xảy ra");
    }
  }

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
                {mode === "create" ? "Thêm Người Dùng Mới" : "Chỉnh Sửa Người Dùng"}
              </h1>
              <p className="text-slate-600">
                {mode === "create"
                  ? "Thêm một người dùng mới vào hệ thống"
                  : "Cập nhật thông tin người dùng"}
              </p>
            </div>
            <Link
              href="/admin/users"
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
                  <i className={`${mode === "create" ? "ri-user-add-line" : "ri-user-settings-line"} text-white text-lg`}></i>
                </div>
                <div>
                  <h2 className="font-semibold text-white text-base">
                    {mode === "create" ? "Thông tin người dùng mới" : "Cập nhật thông tin"}
                  </h2>
                  <p className="text-orange-100 text-xs">Điền đầy đủ các trường bắt buộc (*)</p>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-5">
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
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={isPending}
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

              {/* Email & Username */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isPending}
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

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="ri-at-line text-lg"></i>
                    </span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={isPending}
                      className={errors.username ? inputError : inputBase}
                      placeholder="Nhập tên đăng nhập"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>{errors.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="ri-phone-line text-lg"></i>
                    </span>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      disabled={isPending}
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
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={isPending}
                      className={inputBase}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
              </div>

              {/* Password (create only) */}
              {mode === "create" && (
                <>
                  {/* Divider */}
                  <div className="pt-2 pb-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Mật khẩu</span>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <i className="ri-lock-password-line text-lg"></i>
                      </span>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isPending}
                        className={errors.password ? inputError : inputBase}
                        placeholder="Nhập mật khẩu"
                      />
                    </div>
                    {errors.password && (
                      <div className="mt-1.5 ml-1">
                        {Array.isArray(errors.password) ? (
                          <ul className="text-red-500 text-xs space-y-0.5">
                            {errors.password.map((error, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <i className="ri-error-warning-line"></i>{error}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <i className="ri-error-warning-line"></i>{errors.password}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Password Requirements */}
                    <div className="mt-2 p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs text-slate-500">
                      <p className="font-semibold text-orange-600 mb-1.5 flex items-center gap-1">
                        <i className="ri-shield-check-line"></i>Yêu cầu mật khẩu:
                      </p>
                      <ul className="space-y-1 grid grid-cols-2 gap-x-4">
                        <li className="flex items-center gap-1"><i className="ri-checkbox-circle-line text-orange-400"></i>Ít nhất 8 ký tự</li>
                        <li className="flex items-center gap-1"><i className="ri-checkbox-circle-line text-orange-400"></i>Có chữ thường (a-z)</li>
                        <li className="flex items-center gap-1"><i className="ri-checkbox-circle-line text-orange-400"></i>Có chữ hoa (A-Z)</li>
                        <li className="flex items-center gap-1"><i className="ri-checkbox-circle-line text-orange-400"></i>Có chữ số (0-9)</li>
                        <li className="flex items-center gap-1 col-span-2"><i className="ri-checkbox-circle-line text-orange-400"></i>Có ký tự đặc biệt (!@#$%^&*...)</li>
                      </ul>
                    </div>
                  </div>

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
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        disabled={isPending}
                        className={errors.confirmPassword ? inputError : inputBase}
                        placeholder="Xác nhận mật khẩu"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i>{errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className={mode === "create" ? "ri-user-add-line" : "ri-save-line"}></i>
                      {mode === "create" ? "Tạo Người Dùng" : "Lưu Thay Đổi"}
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
