// src/app/user/(account)/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "#/stores/auth";
import { authApi } from "@/lib/auth/authApi";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  List,
  LogOut,
  Star,
  Heart,
  FileText,
  Camera,
  Menu,
  X,
  Trophy,
  Bell,
  Ticket,
} from "lucide-react";

type UserProfile = {
  fullName: string;
  avatar: string;
  email: string;
};

const NAV_ITEMS = [
  { name: "Đặt chỗ của tôi", href: "/user/history", icon: List },
  { name: "Đánh giá của tôi", href: "/user/reviews", icon: Star },
  { name: "Tour yêu thích", href: "/user/favorites", icon: Heart },
  { name: "Bài viết của tôi", href: "/user/my-posts", icon: FileText },
  { name: "Kỷ niệm của tôi", href: "/user/my-memories", icon: Camera },
  { name: "Điểm thưởng", href: "/user/score", icon: Trophy },
  { name: "Thông báo", href: "/user/notifications", icon: Bell },
  { name: "Voucher của tôi", href: "/user/vouchers", icon: Ticket },
  { name: "Tài khoản", href: "/user/profile", icon: Settings },
];

function SidebarContent({
  user,
  onClose,
}: {
  user: UserProfile | null;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const router = useRouter();
  const resetAuth = useAuthStore((s) => s.resetAuth);

  const handleLogout = () => {
    resetAuth();
    router.push("/auth/login");
    onClose?.();
  };

  return (
    <>
      {/* User info */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 flex-shrink-0">
          <Image
            src={user?.avatar || "/Image.svg"}
            alt="Avatar"
            width={44}
            height={44}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{user?.fullName || "User"}</h4>
          <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
        </div>
        {/* close button on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition md:hidden"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col p-3 gap-0.5">
        {NAV_ITEMS.map((item) => {
          let isActive = false;
          if (item.href === "/user/profile") {
            isActive = pathname === "/user/profile";
          } else {
            isActive = pathname === item.href;
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon
                size={18}
                className={isActive ? "text-blue-600" : "text-gray-400"}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-2 font-medium"
        >
          <LogOut size={18} className="text-red-400" />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </>
  );
}

function UserSidebar({
  user,
  isOpen,
  onClose,
}: {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:w-64 md:flex-shrink-0
          md:shadow-sm md:border-r md:border-gray-200
        `}
      >
        <SidebarContent user={user} onClose={onClose} />
      </aside>
    </>
  );
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const accessToken = useAuthStore((s) => s.token.accessToken);
  const router = useRouter();
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!accessToken) {
      router.push("/auth/login");
      return;
    }
    const fetchUser = async () => {
      try {
        const userData = await authApi.getProfile(accessToken);
        setUser(userData);
      } catch {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [mounted, accessToken, router]);

  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-slate-500 font-medium animate-pulse">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            aria-label="Mở menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold text-gray-800 text-base">Tài khoản của tôi</span>
          {user?.avatar && (
            <div className="ml-auto w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200">
              <Image src={user.avatar} alt="avatar" width={32} height={32} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Page content */}
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
