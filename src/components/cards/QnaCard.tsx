'use client';

import Image from 'next/image';
import React from 'react';

type QnaCardProps = {
  title: string;
  description: string;
  author: string;
  sourceText: string;
  imageUrl: string;
};

const QnaCard: React.FC<QnaCardProps> = ({
  title,
  description,
  author,
  sourceText,
  imageUrl,
}) => {
  return (
    <article
      className="
        group relative overflow-hidden rounded-2xl
        bg-white/90 backdrop-blur
        ring-1 ring-black/5 shadow-sm
        hover:shadow-xl hover:-translate-y-[2px]
        transition
      "
    >
      {/* cover */}
      <div className="relative w-full h-36 sm:h-40">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      {/* content */}
      <div className="p-4">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-slate-900 leading-snug line-clamp-2">
          {title}
        </h3>
        <p className="mt-2 text-[13px] text-slate-600 line-clamp-3">
          {description}
        </p>

        {/* meta */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-7 w-7 overflow-hidden rounded-full ring-1 ring-black/5">
              <Image src="/hot1.jpg" alt={author} fill className="object-cover" />
            </div>
            <div className="leading-tight">
              <p className="text-[12px] font-medium text-slate-800">{author}</p>
              <p className="text-[11px] text-slate-500">{sourceText}</p>
            </div>
          </div>

          <span
            className="
              inline-flex items-center rounded-full px-2.5 py-1
              text-[11px] font-medium
              bg-sky-50 text-sky-700 ring-1 ring-sky-200
            "
          >
            Hỏi đáp
          </span>
        </div>
      </div>

      {/* focus ring when hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-sky-200 group-hover:ring-2 transition" />
    </article>
  );
};

export default QnaCard;
