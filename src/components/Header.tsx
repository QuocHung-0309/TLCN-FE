// /components/layout/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  User,
  History,
  BookOpen,
  Menu,
  X,
  Heart,
  Star,
} from "lucide-react";
import Button from "@/components/ui/Button";
import NotificationBell from "@/components/NotificationBell";
import { useEffect, useRef, useState } from "react";
import { authApi } from "@/lib/auth/authApi";
import { useAuthStore } from "#/stores/auth";
import { getUserToken, clearAllTokens } from "@/lib/auth/tokenManager";
import { debugTokenAndUser } from "@/lib/auth/tokenDebug";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const accessToken =
    useAuthStore((s) => s.token.accessToken) || getUserToken() || "";
  const user = useAuthStore((s) => s.user);
  const resetAuth = useAuthStore((s) => s.resetAuth);
  const setUserId = useAuthStore((s) => s.setUserId);

  const [mounted, setMounted] = useState(false);
  const isLoggedIn = mounted && !!accessToken;

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/Image.svg");
  const [memberStatus, setMemberStatus] = useState("Thành viên");
  const [userEmail, setUserEmail] = useState("");
  const [points, setPoints] = useState(0);

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const lastLoadedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Debug: Log token on mount
    debugTokenAndUser.logTokenLoad("Header.useEffect[mount]");
  }, []);

  // Fetch profile khi có token (và khi đổi route – để luôn sync)
  const loadProfile = async (token: string) => {
    debugTokenAndUser.logTokenLoad("Header.loadProfile[start]");
    try {
      const u = await authApi.getProfile(token);
      debugTokenAndUser.logUserProfileLoad("Header.loadProfile[success]", u);
      setFullName(u.fullName || "User");
      setAvatarUrl(u.avatar || "/Image.svg");
      setMemberStatus(u.memberStatus || "Thành viên");
      setUserEmail(u.email || "");
      setPoints(u.points || 0);
      setUserId(u.id);
      const setUser = useAuthStore.getState().setUser;
      setUser(u as any);
      debugTokenAndUser.logUserInfoDisplay("Header.loadProfile[display]", {
        fullName: u.fullName,
        email: u.email,
        avatar: u.avatar,
        points: u.points,
        memberStatus: u.memberStatus,
      });
    } catch (e: any) {
      const status = e?.response?.status;
      console.warn("getProfile (Header) failed", status, e?.message);
      debugTokenAndUser.logUserProfileLoad("Header.loadProfile[error]", {
        error: e?.message,
        status: status,
        token: token ? `${token.substring(0, 20)}...` : "null",
      });

      // ❗️Chỉ logout khi token thật sự không hợp lệ
      if (status === 401 || status === 403) {
        resetAuth();
        router.push("/auth/login");
      }
      // Các lỗi khác (network/CORS): không xoá token, chỉ ẩn UI user
    }
  };

  useEffect(() => {
    if (!mounted) return;
    debugTokenAndUser.logAuthStateChange("Header.useEffect[accessToken]", {
      accessToken,
      userId: null,
      isLoggedIn,
    });

    if (!accessToken) {
      lastLoadedTokenRef.current = null;
      setFullName("");
      setAvatarUrl("/Image.svg");
      setMemberStatus("Thành viên");
      setUserEmail("");
      setPoints(0);
      setUserId(null);
      return;
    }

    // Token đổi (vd: đăng nhập tài khoản khác) -> luôn fetch lại profile mới,
    // không được tin vào `user` cũ còn sót trong store vì có thể response login
    // trước đó không trả kèm user, khiến store giữ user của tài khoản trước.
    if (lastLoadedTokenRef.current !== accessToken) {
      lastLoadedTokenRef.current = accessToken;
      loadProfile(accessToken);
      return;
    }

    // Cùng token và đã có user info trong store thì dùng luôn, không cần fetch lại
    if (user) {
      setFullName(user.fullName || "User");
      setAvatarUrl(user.avatar || "/Image.svg");
      setMemberStatus(user.memberStatus || "Thành viên");
      setUserEmail(user.email || "");
      setPoints(user.points || 0);
      setUserId(user.id);
      debugTokenAndUser.logUserInfoDisplay("Header.useEffect[fromStore]", user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, accessToken, user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setAvatarOpen(false);
      }
    };

    if (avatarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [avatarOpen]);

  const navItems = [
    { label: "Trang chủ", href: "/" },
    // { label: "Tour", href: "/user/tours" },
    { label: "Điểm đến", href: "/user/destination" },
    { label: "Bài viết", href: "/user/blog" },
    { label: "Hành trình", href: "/user/map" },
    { label: "Giới thiệu", href: "/user/about" },
    { label: "Liên hệ", href: "/user/contact" },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname === "/user/home"
      : pathname.startsWith(href);

  const dropdownItems = [
    { name: "Hồ sơ cá nhân", href: "/user/profile", icon: User },
    { name: "Lịch sử đặt tour", href: "/user/history", icon: History },
    { name: "Tour yêu thích", href: "/user/favorites", icon: Heart },
    { name: "Đánh giá của tôi", href: "/user/reviews", icon: Star },
    { name: "Blog của tôi", href: "/user/blog", icon: BookOpen },
    { name: "Vouchers", href: "/user/vouchers", icon: BookOpen },
  ];

  const handleLogout = async () => {
    setAvatarOpen(false); // Đóng dropdown ngay
    try {
      await authApi.logout(); // Gọi API xóa cookie phía backend
    } catch {
      // Bỏ qua lỗi API vì token có thể đã hết hạn
    }
    // Chỉ xóa phiên đăng nhập, GIỮ LẠI email/password đã ghi nhớ
    resetAuth(); // Xóa toàn bộ state + persist
    clearAllTokens(); // Clear tokens from tokenManager
    router.push("/"); // Về trang Home
  };

  if (!mounted) return null;

  return (
    <header className="bg-white shadow-sm w-full z-50">
      <div className="max-w-screen-2xl mx-auto px-5 lg:px-14 py-4 flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/Logo.png" alt="Logo" width={140} height={140} />
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex flex-1 justify-center space-x-6 text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition ${
                isActive(item.href)
                  ? "text-[var(--primary)] font-bold"
                  : "text-gray-700 font-medium"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3 ml-auto">
          {!isLoggedIn && (
            <Link href="/auth/login">
              <Button variant="outline-primary">Đăng nhập / Đăng ký</Button>
            </Link>
          )}

          {isLoggedIn && (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              <div ref={avatarRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-100"
                >
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-slate-800 font-medium text-sm truncate max-w-[120px]">
                    {fullName}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform duration-200 ${avatarOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`absolute right-0 top-full z-50 mt-3 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 transition-all duration-150 ${
                    avatarOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="rounded-t-2xl bg-slate-50 p-4">
                    <p className="font-bold text-sm text-slate-900 truncate">{fullName}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{userEmail}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      {points} điểm
                      <span className="text-slate-300">•</span>
                      <span style={{ color: "var(--primary)" }}>{memberStatus}</span>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-0.5 p-2">
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                      >
                        <item.icon size={18} className="text-slate-400" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  <div className="border-t border-slate-100 p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col px-5 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-lg transition ${
                  isActive(item.href)
                    ? "bg-[var(--primary)] text-white font-bold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 mt-2 rounded-lg bg-[var(--primary)] text-white text-center font-semibold"
              >
                Đăng nhập / Đăng ký
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
