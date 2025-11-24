// src/app/user/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "#/stores/auth";
import { authApi } from "@/lib/auth/authApi";
import Link from "next/link";
import { Plus } from "lucide-react"; // Icon cho nút "Thêm"

// 1. Mở rộng Type để chứa dữ liệu mới
type UserProfile = {
  fullName: string;
  email: string;
  phone: string; // Giữ lại phone chính
  gender?: string; // "Male", "Female", "Other"
  dob?: string; // "YYYY-MM-DD"
  city?: string;
  emails?: { email: string; isVerified: boolean; isPrimary: boolean }[];
  phoneNumbers?: { phone: string; isVerified: boolean; isPrimary: boolean }[];
};

// --- Component Tabs (Giữ nguyên) ---
function ProfileTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex border-b border-gray-200 mb-6">
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
// --- 2. Component Form Thông Tin (Nâng cấp) ---
function InfoTab({ user }: { user: UserProfile }) {
  // State cho các trường
  const [fullName, setFullName] = useState(user.fullName);
  const [gender, setGender] = useState(user.gender || "Male");
  const [city, setCity] = useState(user.city || "");

  // State cho Ngày, Tháng, Năm
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Tự động điền ngày sinh khi có dữ liệu
  useEffect(() => {
    if (user.dob) {
      const date = new Date(user.dob);
      setDay(date.getDate().toString());
      setMonth((date.getMonth() + 1).toString()); // getMonth() là 0-11
      setYear(date.getFullYear().toString());
    }
  }, [user.dob]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Gộp ngày sinh lại
      const dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      const profileData = { fullName, gender, city, dob };

      // TODO: Gọi API cập nhật profile
      // await authApi.updateProfile(profileData, accessToken);
      console.log("Dữ liệu cập nhật:", profileData);
      alert("Cập nhật thành công! (giả lập)");
    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };

  // Dữ liệu cho dropdown ngày sinh
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
    // Sử dụng Fragment để trả về nhiều card
    <>
      {/* Card Dữ liệu cá nhân */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Dữ liệu cá nhân
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Tên đầy đủ */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Ngày
                  </option>
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
                  <option value="" disabled>
                    Tháng
                  </option>
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
                  <option value="" disabled>
                    Năm
                  </option>
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
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
            >
              Có lẽ để sau
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>

      {/* Card Email */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Email</h2>
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            <Plus size={16} /> Thêm email
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Chỉ có thể sử dụng tối đa 3 email
        </p>
        <div className="font-medium text-gray-800">
          1. {user.email}{" "}
          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            Nơi nhận thông báo
          </span>
        </div>
        {/* TODO: Dùng .map() để render danh sách user.emails */}
      </div>

      {/* Card Số di động */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Số di động</h2>
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            <Plus size={16} /> Thêm số di động
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Chỉ có thể sử dụng tối đa 3 số di động
        </p>
        <div className="font-medium text-gray-800">1. {user.phone}</div>
        {/* TODO: Dùng .map() để render danh sách user.phoneNumbers */}
      </div>
    </>
  );
}

// --- Component Form Mật Khẩu (Giữ nguyên) ---
function PasswordTab() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.changePassword(oldPassword, newPassword);
      alert("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error(error);
      alert("Đổi mật khẩu thất bại!");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>
      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Trang Chính (Page) ---
export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((s) => s.token.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await authApi.getProfile(accessToken); // <-- đã là UserProfile
        setUser(userData);
      } catch (error) {
        console.error("Lỗi tải profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [accessToken]);

  if (loading) {
    return <div>Đang tải thông tin người dùng...</div>;
  }

  if (!user) {
    return <div>Không thể tải thông tin người dùng.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "info" && <InfoTab user={user} />}
      {activeTab === "password" && <PasswordTab />}
    </div>
  );
}
