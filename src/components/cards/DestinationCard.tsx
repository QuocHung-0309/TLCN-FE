// DestinationCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

type DestinationCardProps = {
  title: string;
  duration: string;
  price: string;
  image: string;
};

const DestinationCard: React.FC<DestinationCardProps> = ({ title, duration, price, image }) => {
  return (
    <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition">
      <div className="relative w-full h-[400px]"> {/* cao hơn */}
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 pointer-events-none">
        <h3 className="text-base sm:text-lg font-extrabold uppercase text-orange-400 leading-tight">
          {title}
        </h3>

        <div className="mt-1 sm:mt-2 space-y-1 text-white">
          <p className="text-sm font-bold leading-tight">{duration}</p>
          <p className="text-sm">
            Giá: <span className="font-semibold">{price}</span>
          </p>
        </div>

        <div className="mt-3 sm:mt-4">
          <Button
            className="
              pointer-events-auto
              rounded-full px-5 py-2
              bg-white text-black font-bold text-xs
              shadow-md hover:bg-white/90 transition
            "
          >
            ĐẶT NGAY
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
