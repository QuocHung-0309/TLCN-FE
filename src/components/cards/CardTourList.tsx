'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

export type CardTourListProps = {
  image: string;
  title: string;
  total: number | string;
  href?: string;       // thêm
  subtitle?: string;   // thêm
};

const CardTourList: React.FC<CardTourListProps> = ({ image, title, total, href, subtitle }) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    href ? (
      <Link
        href={href}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-2xl"
      >
        {children}
      </Link>
    ) : (
      <>{children}</>
    );

  return (
    <Wrapper>
      <article
        className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
        aria-label={title}
      >
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 shadow backdrop-blur">
            {total} tour
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-white text-base sm:text-lg font-semibold leading-tight drop-shadow">{title}</h3>
          {subtitle && <p className="mt-0.5 text-slate-200 text-sm line-clamp-1">{subtitle}</p>}
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 shadow backdrop-blur transition group-hover:bg-white">
            Khám phá <span aria-hidden>→</span>
          </div>
        </div>
      </article>
    </Wrapper>
  );
};

export default CardTourList;
