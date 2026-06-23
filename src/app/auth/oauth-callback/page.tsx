// /app/auth/oauth-callback/page.tsx
"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "#/stores/auth";
import { setUserToken, setRefreshToken } from "@/lib/auth/tokenManager";
import { authApi } from "@/lib/auth/authApi";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setToken = useAuthStore((s) => s.setToken);
  const setUserId = useAuthStore((s) => s.setUserId);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const accessToken = searchParams?.get("accessToken");
    const refreshToken = searchParams?.get("refreshToken");

    if (!accessToken) {
      router.replace("/auth/login");
      return;
    }

    const finishLogin = async () => {
      setToken({ accessToken, refreshToken });
      setUserToken(accessToken);
      setRefreshToken(refreshToken);

      try {
        const profile = await authApi.getProfile(accessToken);
        setUser({
          id: profile.id,
          fullName: profile.fullName,
          username: profile.username,
          email: profile.email,
          phone: profile.phone,
          avatar: profile.avatar,
          points: profile.points,
          memberStatus: profile.memberStatus,
        });
        setUserId(profile.id);
      } catch {
        setUser(null);
        setUserId(null);
      }

      router.replace("/");
    };

    finishLogin();
  }, [searchParams, router, setToken, setUser, setUserId]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
