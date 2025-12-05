"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MapPin } from "lucide-react";

type Props = {
  image: string;
  title: string;
  total: number;
  href: string; // Link đích
};

const CardTourList = ({ image, title, total, href }: Props) => {
  return (
    <Link
      href={href}
      className="group relative block h-full overflow-hidden rounded-2xl shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Hình ảnh (Aspect Ratio 3:4 cho card dọc) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 text-white">
        <div className="flex items-center gap-1.5 text-orange-300 mb-1">
          <MapPin size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Điểm đến
          </span>
        </div>

        <h3 className="text-xl font-extrabold leading-tight tracking-wide mb-1 group-hover:text-emerald-300 transition-colors">
          {title}
        </h3>

        <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
          {total} Tours đang mở
        </p>
      </div>
    </Link>
  );
};

export default CardTourList;
