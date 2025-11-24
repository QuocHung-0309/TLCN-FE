'use client';

import React, { ImgHTMLAttributes } from 'react';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  watermarkText?: string;
}

export default function ProtectedImage({ watermarkText = '© MySite', ...props }: Props) {
  return (
    <div className="relative inline-block select-none">
      <img
        {...props}
        className={`block pointer-events-none ${props.className || ''}`}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="absolute top-2 left-2 text-white opacity-50 text-sm pointer-events-none">
        {watermarkText}
      </div>
    </div>
  );
}
