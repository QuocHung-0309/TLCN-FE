"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Clock, MapPin } from "lucide-react";

export type DestinationCardProps = {
  image: string;
  title: string;
  duration: string;
  price: string;
  href?: string;
  destination?: string;
};

const DestinationCard: React.FC<DestinationCardProps> = ({
  image,
  title,
  duration,
  price,
  href = "#",
  destination,
}) => {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {destination && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white border border-white/30">
            <MapPin size={10} />
            {destination}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-3 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-800 group-hover:text-[var(--brand-navy)] transition-colors">
          <Link href={href} title={title}>{title}</Link>
        </h3>

        <div className="flex items-center gap-1.5 text-[13px] text-slate-500 mb-4">
          <Clock size={14} className="text-orange-400 flex-shrink-0" />
          <span>{duration}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Giá từ</p>
            <p className="text-base font-bold text-rose-600 tabular-nums">{price}</p>
          </div>

          <Link
            href={href}
            className="rounded-full bg-[var(--brand-navy)] px-4 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
          >
            Đặt Tour
          </Link>
        </div>
      </div>
    </article>
  );
};

export default DestinationCard;
