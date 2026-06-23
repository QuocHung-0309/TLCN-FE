// src/app/user/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "#/stores/auth";
import { authApi } from "@/lib/auth/authApi"; // Đảm bảo đường dẫn này đúng
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  CreditCard,
  Settings,
  List,
  RefreshCcw,
  Bell,
  Users,
  LogOut,
  Star,
  Wallet,
  Ticket,
  Award,
  Heart,
} from "lucide-react"; // Dùng icon của lucide-react

// Kiểu dữ liệu
type UserProfile = {
  fullName: string;
  avatar: string;
  email: string;
  points?: number;
  memberStatus?: string;
};

// Component Sidebar (Menu bên trái)
function UserSidebar({ user }: { user: UserProfile | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const router = useRouter();
  const resetAuth = useAuthStore((s) => s.resetAuth);

  const handleLogout = () => {
    resetAuth();
    // TODO: Gọi API logout
    router.push("/auth/login");
  };

  // Các link trong sidebar
  const navItems = [
    { name: "Đặt chỗ của tôi", href: "/user/history", icon: List },
    { name: "Mã giảm giá", href: "/user/vouchers", icon: Ticket },
    { name: "Đánh giá của tôi", href: "/user/reviews", icon: Star },
    { name: "Tour yêu thích", href: "/user/favorites", icon: Heart },
    { name: "Điểm tích lũy", href: "/user/score", icon: Award },
    { name: "Thông tin hành khách", href: "/user/passengers", icon: Users },
    { name: "Cài đặt thông báo", href: "/user/notifications", icon: Bell },
    { name: "Tài khoản", href: "/user/profile", icon: Settings },
  ];

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col bg-blue-950">
      {/* Thông tin người dùng */}
      <div className="flex items-center gap-3 border-b border-white/10 p-5">
        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/20">
          <Image
            src={user?.avatar || "/Image.svg"}
            alt="Avatar"
            width={44}
            height={44}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-white">
            {user?.fullName || "User"}
          </h4>
          <p className="truncate text-xs text-white/50">{user?.email}</p>
        </div>
      </div>

      {/* Thẻ thành viên */}
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[var(--brand-accent)]" />
            <span className="text-xs font-medium text-white/70">
              Hạng {user?.memberStatus || "Thành viên"}
            </span>
          </div>
          <span className="text-sm font-bold text-[var(--brand-accent)]">
            {(user?.points ?? 0).toLocaleString("vi-VN")} đ
          </span>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          let isActive = false;
          if (item.href.includes("?tab=")) {
            const tabName = item.href.split("?tab=")[1];
            isActive = pathname === "/user/profile" && currentTab === tabName;
          } else if (item.href === "/user/profile") {
            isActive = pathname === "/user/profile" && currentTab !== "favorites";
          } else {
            isActive = pathname === item.href;
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-white/10 font-semibold text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[var(--brand-accent)]" />
              )}
              <item.icon
                size={18}
                className={isActive ? "text-[var(--brand-accent)]" : "text-white/40"}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Nút Đăng xuất - cố định ở cuối */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors duration-150 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} className="text-white/40" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

// Layout chính
export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // Chống lỗi hydration
  const accessToken = useAuthStore((s) => s.token.accessToken);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Đợi mounted

    if (!accessToken) {
      router.push("/auth/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await authApi.getProfile(accessToken);
        setUser(userData);
      } catch (error) {
        console.error("Lỗi tải profile cho layout:", error);
        router.push("/auth/login"); // Token hỏng
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [mounted, accessToken, router]);

  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-950"></div>
          <p className="text-slate-500 font-medium">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <UserSidebar user={user} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
