"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "#/stores/auth";
import { setUserToken } from "@/lib/auth/tokenManager";
import { authApi } from "@/lib/auth/authApi";

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setUserId = useAuthStore((s) => s.setUserId);

  useEffect(() => {
    const token = searchParams?.get("token");
    if (!token) {
      router.replace("/auth/login?error=no_token");
      return;
    }

    // Lưu token
    setToken({ accessToken: token, refreshToken: null });
    setUserToken(token);

    // Lấy thông tin user
    authApi
      .getProfile(token)
      .then((userData) => {
        setUser(userData);
        setUserId(userData.id);
        router.replace("/");
      })
      .catch((err) => {
        console.error("Lỗi lấy thông tin user OAuth:", err);
        router.replace("/auth/login?error=oauth_profile_failed");
      });
  }, [searchParams, router, setToken, setUser, setUserId]);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-slate-600 font-medium">Đang xác thực thông tin...</p>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Đang tải...</div>}>
      <OAuthSuccessContent />
    </Suspense>
  );
}
