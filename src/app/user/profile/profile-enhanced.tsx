"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "#/stores/auth";
import { authApi } from "@/lib/auth/authApi";
import { getUserToken } from "@/lib/auth/tokenManager";
import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Star,
  Award,
  History,
  BookOpen,
  Settings,
  Shield,
  Camera
} from "lucide-react";

type UserProfile = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  address?: string;
  city?: string;
  points?: number;
  memberStatus?: string;
  totalBookings?: number;
  totalBlogs?: number;
  joinedDate?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const accessToken = useAuthStore((s) => s.token.accessToken) || getUserToken();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // Form state for editing
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    city: ""
  });

  useEffect(() => {
    if (!accessToken) {
      router.push("/auth/login");
      return;
    }
    fetchProfile();
  }, [accessToken, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.getProfile(accessToken);
      console.log("👤 Profile data:", response);
      
      // Use stored user data first, then API data
      const profileData = {
        ...response.user,
        ...user,
        totalBookings: response.totalBookings || 0,
        totalBlogs: response.totalBlogs || 0,
        joinedDate: response.joinedDate || response.user?.createdAt
      };
      
      setProfile(profileData);
      setFormData({
        fullName: profileData.fullName || "",
        phone: profileData.phone || "",
        gender: profileData.gender || "",
        dateOfBirth: profileData.dateOfBirth || "",
        address: profileData.address || "",
        city: profileData.city || ""
      });
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await authApi.updateProfile(formData, accessToken);
      
      // Update both local state and Zustand store
      const updatedProfile = { ...profile, ...formData };
      setProfile(updatedProfile as UserProfile);
      setUser(updatedProfile);
      
      setEditMode(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa cập nhật";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getMemberStatusBadge = (status?: string) => {
    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
      bronze: { label: "Đồng", color: "text-yellow-700", bg: "bg-yellow-100" },
      silver: { label: "Bạc", color: "text-gray-700", bg: "bg-gray-100" },
      gold: { label: "Vàng", color: "text-yellow-800", bg: "bg-yellow-200" },
      platinum: { label: "Bạch kim", color: "text-purple-700", bg: "bg-purple-100" },
    };
    
    const config = statusMap[status?.toLowerCase() || "bronze"];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải thông tin profile</h3>
          <button onClick={fetchProfile} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            <div className="flex items-center space-x-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      // Reset form data
                      setFormData({
                        fullName: profile.fullName || "",
                        phone: profile.phone || "",
                        gender: profile.gender || "",
                        dateOfBirth: profile.dateOfBirth || "",
                        address: profile.address || "",
                        city: profile.city || ""
                      });
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt="Avatar"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100">
                        <User className="w-12 h-12 text-blue-600" />
                      </div>
                    )}
                  </div>
                  {editMode && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-1">{profile.fullName}</h3>
                <p className="text-gray-600 mb-3">{profile.email}</p>
                {getMemberStatusBadge(profile.memberStatus)}
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-yellow-500 mr-1" />
                      <span className="text-2xl font-bold text-gray-900">{profile.points || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Điểm tích lũy</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="w-5 h-5 text-blue-500 mr-1" />
                      <span className="text-2xl font-bold text-gray-900">{profile.totalBookings || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Chuyến đi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Liên kết nhanh</h4>
              <div className="space-y-2">
                <Link href="/user/history" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <History className="w-4 h-4 mr-3 text-gray-400" />
                  Lịch sử booking
                </Link>
                <Link href="/user/blog" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <BookOpen className="w-4 h-4 mr-3 text-gray-400" />
                  Blog của tôi
                </Link>
                <Link href="/user/post-blog" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                  Viết blog mới
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: "overview", label: "Tổng quan", icon: User },
                    { key: "security", label: "Bảo mật", icon: Shield },
                    { key: "preferences", label: "Cài đặt", icon: Settings },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.key
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{profile.fullName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="inline w-4 h-4 mr-1" />
                            Email
                          </label>
                          <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                            {profile.email} (không thể thay đổi)
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="inline w-4 h-4 mr-1" />
                            Số điện thoại
                          </label>
                          {editMode ? (
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{profile.phone || "Chưa cập nhật"}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giới tính
                          </label>
                          {editMode ? (
                            <select
                              value={formData.gender}
                              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Chọn giới tính</option>
                              <option value="male">Nam</option>
                              <option value="female">Nữ</option>
                              <option value="other">Khác</option>
                            </select>
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                              {profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : profile.gender === "other" ? "Khác" : "Chưa cập nhật"}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            Ngày sinh
                          </label>
                          {editMode ? (
                            <input
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{formatDate(profile.dateOfBirth)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="inline w-4 h-4 mr-1" />
                            Thành phố
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              placeholder="Nhập thành phố"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">{profile.city || "Chưa cập nhật"}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ
                        </label>
                        {editMode ? (
                          <textarea
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Nhập địa chỉ chi tiết"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md min-h-[80px]">{profile.address || "Chưa cập nhật"}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Thống kê tài khoản</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{profile.points || 0}</div>
                          <div className="text-sm text-gray-600">Điểm tích lũy</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{profile.totalBookings || 0}</div>
                          <div className="text-sm text-gray-600">Chuyến đi</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{profile.totalBlogs || 0}</div>
                          <div className="text-sm text-gray-600">Bài viết</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{formatDate(profile.joinedDate)}</div>
                          <div className="text-sm text-gray-600">Ngày tham gia</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Bảo mật tài khoản</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-medium text-yellow-800 mb-2">Đổi mật khẩu</h4>
                          <p className="text-yellow-700 text-sm mb-3">Thay đổi mật khẩu thường xuyên để bảo vệ tài khoản</p>
                          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                            Đổi mật khẩu
                          </button>
                        </div>

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Email đã xác thực</h4>
                          <p className="text-green-700 text-sm">Email {profile.email} đã được xác thực</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "preferences" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Tùy chọn cá nhân</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Thông báo email</h4>
                            <p className="text-sm text-gray-600">Nhận thông báo về tour mới và ưu đãi</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Thông báo SMS</h4>
                            <p className="text-sm text-gray-600">Nhận SMS xác nhận booking</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}