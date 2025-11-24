// src/app/user/_components/UserSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Calendar } from "lucide-react"; // Import icons

// Danh sách các mục 
const navItems = [
  {
    name: "Cài đặt tài khoản",
    href: "/user/profile",
    icon: User,
  },
  {
    name: "Đặt chỗ của tôi",
    href: "/user/bookings",
    icon: Calendar,
  },
  // Bạn có thể thêm các mục khác ở đây
];

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              flex items-center gap-3 rounded-lg px-3 py-2.5
              transition-all duration-150
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm" // Trạng thái Active
                  : "text-gray-700 hover:bg-gray-100" // Trạng thái thường
              }
            `}
          >
            <item.icon size={18} />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}