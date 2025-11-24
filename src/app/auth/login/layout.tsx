// src/app/auth/login/layout.tsx
"use client";
import SlideshowLayout from "@/components/ui/SlideshowLayout";

export default function LoginLayoutClient({ children }: { children: React.ReactNode }) {
  return <SlideshowLayout>{children}</SlideshowLayout>; // Hình bên phải
}
