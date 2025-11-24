"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "#/stores/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAdminStore((s) => s.adminToken);

  useEffect(() => {
    if (!token) router.replace("/admin/login");
  }, [token, router]);

  return <>{children}</>;
}
