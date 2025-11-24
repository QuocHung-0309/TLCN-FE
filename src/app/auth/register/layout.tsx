// src/app/auth/register/layout.tsx
"use client";
import SlideshowLayout from "@/components/ui/SlideshowLayout";

export default function RegisterLayoutClient({ children }: { children: React.ReactNode }) {
  return <SlideshowLayout reverse>{children}</SlideshowLayout>; // Hình bên trái
}
