// src/app/auth/forgot-password/layout.tsx
"use client";
import SlideshowLayout from "@/components/ui/SlideshowLayout";

export default function ForgotPasswordLayoutClient({ children }: { children: React.ReactNode }) {
  return <SlideshowLayout>{children}</SlideshowLayout>; // Hình bên phải
}
