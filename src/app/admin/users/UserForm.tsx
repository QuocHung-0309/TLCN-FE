"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateUser, useUpdateUser, useUserDetail } from "../hooks/useUsers";
import { validatePassword, validateEmail, validateRequired } from "@/utils/validation";
import { Toast, useToast } from "@/components/ui/Toast";

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

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string | string[]> = {};

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    // Username validation
    const usernameError = validateRequired(formData.username, "Tên đăng nhập");
    if (usernameError) newErrors.username = usernameError;

    // FullName validation
    const fullNameError = validateRequired(formData.fullName, "Họ tên");
    if (fullNameError) newErrors.fullName = fullNameError;

    // Password validation (only for create mode)
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

  return (
    <>
      <Toast {...toast} onClose={hideToast} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {mode === "create" ? "Thêm Người Dùng Mới" : "Chỉnh Sửa Người Dùng"}
            </h1>
            <p className="text-slate-600">
              {mode === "create" 
                ? "Thêm một người dùng mới vào hệ thống" 
                : "Cập nhật thông tin người dùng"}
            </p>
          </div>

          <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8">
            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={isPending}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.fullName ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Nhập họ tên"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isPending}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.email ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Nhập email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isPending}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.username ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Nhập tên đăng nhập"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  disabled={isPending}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Địa Chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={isPending}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

            {/* Password (create only) */}
            {mode === "create" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mật Khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isPending}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.password ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="Nhập mật khẩu"
                  />
                  {errors.password && (
                    <div className="mt-2">
                      {Array.isArray(errors.password) ? (
                        <ul className="text-red-500 text-sm space-y-1">
                          {errors.password.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-red-500 text-sm">{errors.password}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Password Requirements */}
                  <div className="mt-2 text-xs text-slate-500">
                    <p className="font-medium mb-1">Yêu cầu mật khẩu:</p>
                    <ul className="space-y-1 ml-2">
                      <li>• Ít nhất 8 ký tự</li>
                      <li>• Có ít nhất 1 chữ thường (a-z)</li>
                      <li>• Có ít nhất 1 chữ hoa (A-Z)</li>
                      <li>• Có ít nhất 1 chữ số (0-9)</li>
                      <li>• Có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Xác Nhận Mật Khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isPending}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.confirmPassword ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="Xác nhận mật khẩu"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition font-medium"
              >
                {isPending
                  ? "Đang xử lý..."
                  : mode === "create"
                  ? "Tạo Người Dùng"
                  : "Cập Nhật"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
