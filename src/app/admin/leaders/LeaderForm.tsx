"use client";

import { useState } from "react";
import { LeaderData, UpdateLeaderBody } from "@/lib/admin/adminLeaderApi";

interface LeaderFormProps {
  leader?: LeaderData | null;
  onSuccess?: () => void;
  onSubmit: (data: UpdateLeaderBody) => void;
}

export default function LeaderForm({ leader, onSubmit }: LeaderFormProps) {
  const [formData, setFormData] = useState({
    fullName: leader?.fullName || "",
    username: leader?.username || "",
    email: leader?.email || "",
    phoneNumber: leader?.phoneNumber || "",
    address: leader?.address || "",
    status: (leader?.status || "active") as "active" | "inactive",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Tài khoản là bắt buộc";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: UpdateLeaderBody = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      status: formData.status,
    };

    // Only include password if it's provided
    if (formData.password.trim()) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Họ tên *
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            errors.fullName ? "border-red-500" : "border-slate-300"
          }`}
          placeholder="Nhập họ tên"
        />
        {errors.fullName && (
          <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tài khoản *
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.username ? "border-red-500" : "border-slate-300"
            }`}
            placeholder="Nhập tài khoản"
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.email ? "border-red-500" : "border-slate-300"
            }`}
            placeholder="Nhập email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Điện thoại
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Nhập số điện thoại"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Trạng thái
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Vô hiệu</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Địa chỉ
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Nhập địa chỉ"
        />
      </div>

      {/* Password - only for edit mode */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mật khẩu {leader ? "(để trống nếu không thay đổi)" : "*"}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder={
            leader ? "Nhập mật khẩu mới (nếu muốn đổi)" : "Nhập mật khẩu"
          }
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          {leader ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
