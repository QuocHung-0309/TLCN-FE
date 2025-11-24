"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLogin } from "@/app/admin/hooks/useAdmin";
import { useAdminStore } from "#/stores/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAdminStore((s) => s.setAuth);
  const { mutateAsync, isPending } = useAdminLogin();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    try {
      const resp = await mutateAsync({ identifier, password });
      
      // Lưu token vào store (zustand + localStorage)
      setAuth(resp.accessToken!, { 
        id: resp.admin.id, 
        name: resp.admin.name || resp.admin.fullName || "Admin" 
      });
      
      // Redirect tới dashboard
      router.replace("/admin/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đăng nhập thất bại");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Panel</h1>
          <p className="text-slate-500">Đăng nhập để quản lý tour</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-lg">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Username/Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username hoặc Email
              </label>
              <input
                type="text"
                placeholder="admin@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-300 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-2.5 mt-6 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang xử lý…
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Demo: <span className="font-medium text-slate-700">admin</span> / <span className="font-medium text-slate-700">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
