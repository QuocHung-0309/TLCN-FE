"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "#/stores/auth";
import { authApi } from "@/lib/auth/authApi";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

// URL BE – nhớ để NEXT_PUBLIC_API_URL = http://localhost:4000
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/$/, "");

// 1. Mở rộng Type để chứa dữ liệu mới
type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: string;
  city?: string;
  emails?: { email: string; isVerified: boolean; isPrimary: boolean }[];
  phoneNumbers?: { phone: string; isVerified: boolean; isPrimary: boolean }[];
  avatarUrl?: string;
  avatar?: string; // phòng trường hợp BE trả field này
};

// --- Tabs ---
function ProfileTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="mb-6 flex border-b border-gray-200">
      <button
        onClick={() => onTabChange("info")}
        className={`px-4 py-2 font-semibold transition-colors duration-150 ${
          activeTab === "info"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Thông tin tài khoản
      </button>
      <button
        onClick={() => onTabChange("password")}
        className={`px-4 py-2 font-semibold transition-colors duration-150 ${
          activeTab === "password"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Mật khẩu & Bảo mật
      </button>
    </div>
  );
}

// --- 2. Thông tin tài khoản ---
function InfoTab({ user }: { user: UserProfile }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [gender, setGender] = useState(user.gender || "Male");
  const [city, setCity] = useState(user.city || "");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (user.dob) {
      const date = new Date(user.dob);
      if (!Number.isNaN(date.getTime())) {
        setDay(String(date.getDate()));
        setMonth(String(date.getMonth() + 1));
        setYear(String(date.getFullYear()));
      }
    }
  }, [user.dob]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dob =
        day && month && year
          ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
          : undefined;

      const profileData = { fullName, gender, city, dob };

      // TODO: call API update profile khi BE có
      console.log("Dữ liệu cập nhật:", profileData);
      toast.success("Cập nhật thông tin (demo)");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại!");
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: "Tháng Một" },
    { value: 2, label: "Tháng Hai" },
    { value: 3, label: "Tháng Ba" },
    { value: 4, label: "Tháng Tư" },
    { value: 5, label: "Tháng Năm" },
    { value: 6, label: "Tháng Sáu" },
    { value: 7, label: "Tháng Bảy" },
    { value: 8, label: "Tháng Tám" },
    { value: 9, label: "Tháng Chín" },
    { value: 10, label: "Tháng Mười" },
    { value: 11, label: "Tháng Mười Một" },
    { value: 12, label: "Tháng Mười Hai" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <>
      {/* Card Dữ liệu cá nhân */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Dữ liệu cá nhân
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Tên đầy đủ */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Tên đầy đủ
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Tên trong hồ sơ được rút ngắn từ họ tên của bạn.
            </p>
          </div>

          {/* Giới tính & Ngày sinh */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="gender"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Giới tính
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Khác</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ngày sinh
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Ngày</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Tháng</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Năm</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Thành phố cư trú */}
          <div>
            <label
              htmlFor="city"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Thành phố cư trú
            </label>
            <input
              type="text"
              id="city"
              placeholder="Thành phố cư trú"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Nút Lưu */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Có lẽ để sau
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>

      {/* Card Email */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Email</h2>
          <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Plus size={16} /> Thêm email
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          Chỉ có thể sử dụng tối đa 3 email
        </p>
        <div className="font-medium text-gray-800">
          1. {user.email}{" "}
          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">
            Nơi nhận thông báo
          </span>
        </div>
      </div>

      {/* Card Số di động */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Số di động</h2>
          <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Plus size={16} /> Thêm số di động
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          Chỉ có thể sử dụng tối đa 3 số di động
        </p>
        <div className="font-medium text-gray-800">1. {user.phone}</div>
      </div>
    </>
  );
}

// --- 3. Mật khẩu & bảo mật ---
function PasswordTab() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.changePassword(oldPassword, newPassword);
      toast.success("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error(error);
      toast.error("Đổi mật khẩu thất bại!");
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Đổi mật khẩu</h2>
      <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
        <div>
          <label
            htmlFor="oldPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Mật khẩu cũ
          </label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Mật khẩu mới
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}

// --- 4. Trang chính ---
export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const accessToken = useAuthStore((s) => s.token.accessToken);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // load profile
  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await authApi.getProfile(accessToken);
        setUser(userData as UserProfile);
      } catch (error) {
        console.error("Lỗi tải profile:", error);
        toast.error("Không tải được thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [accessToken]);

  // upload avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    try {
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        console.error(await res.text());
        toast.error("Upload avatar thất bại!");
        return;
      }

      const data = await res.json(); // { message, avatarPath, avatarUrl }

      setUser((prev) =>
        prev
          ? {
              ...prev,
              avatarUrl: data.avatarUrl ?? prev.avatarUrl ?? prev.avatar,
              avatar: data.avatarUrl ?? prev.avatar ?? prev.avatarUrl,
            }
          : prev
      );

      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi khi upload avatar!");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return <div>Đang tải thông tin người dùng...</div>;
  }

  if (!accessToken) {
    return <div>Bạn cần đăng nhập để xem trang này.</div>;
  }

  if (!user) {
    return <div>Không thể tải thông tin người dùng.</div>;
  }

  const avatarSrc = user.avatarUrl || user.avatar || "/default-avatar.png";

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Avatar + tiêu đề */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          <img
            src={avatarSrc}
            alt={user.fullName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-sm text-gray-600">
            Quản lý thông tin cá nhân và bảo mật tài khoản.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
            >
              {uploadingAvatar ? "Đang cập nhật..." : "Đổi ảnh đại diện"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </div>

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "info" && <InfoTab user={user} />}
      {activeTab === "password" && <PasswordTab />}
    </div>
  );
}
