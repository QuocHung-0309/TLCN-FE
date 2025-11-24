'use client';

import Image from 'next/image';
import React from 'react';
import classNames from 'classnames';

interface CategorySectionProps {
  activeTab: string;
  onChangeTab: (key: string) => void;
}

type Category = {
  key: string;
  label: string;
  description: string;
  iconSrc: string;
};

const categories: Category[] = [
  {
    key: 'all',
    label: 'Tất cả địa điểm',
    description: 'Các bài viết liên quan đến các điểm đến mới tại Sài Gòn',
    iconSrc: '/icon.svg',
  },
  {
    key: 'travel',
    label: 'Du lịch',
    description: 'Các bài viết liên quan đến các điểm đến mới tại Sài Gòn',
    iconSrc: '/icon.svg',
  },
  {
    key: 'food',
    label: 'Ăn uống',
    description: 'Hãy cùng tham khảo những quán ăn tuyệt vời tại Sài Gòn!',
    iconSrc: '/icon1.svg',
  },
  {
    key: 'spiritual',
    label: 'Tâm linh',
    description: 'Khám phá những điều bí ẩn chưa được giải mã tại Sài Gòn',
    iconSrc: '/icon2.svg',
  },
  {
    key: 'experience',
    label: 'Kinh nghiệm',
    description: 'Kinh nghiệm và các tips du lịch, vui chơi tại Sài Gòn',
    iconSrc: '/icon3.svg',
  },
  {
    key: 'other',
    label: 'Khác',
    description: 'Kinh nghiệm và các tips du lịch, vui chơi tại Sài Gòn',
    iconSrc: '/icon3.svg',
  },
];

const CategorySection: React.FC<CategorySectionProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex justify-center gap-4 flex-wrap py-6">
        {categories.map((category) => {
          const isActive = category.key === activeTab;

          return (
            <button
              key={category.key}
              onClick={() => onChangeTab(category.key)}
              className={classNames(
                'cursor-pointer w-[220px] h-[163px] border p-4 text-left transition-all flex-shrink-0',
                {
                  'bg-[var(--secondary)] text-[var(--foreground)] border-transparent':
                    isActive,
                  'bg-transparent border border-[var(--gray-5)] text-[var(--gray-2)]':
                    !isActive,
                }
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[#FBF6EA]">
                  <Image
                    src={category.iconSrc}
                    alt={category.label}
                    width={24}
                    height={24}
                  />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-[var(--foreground)]">
                {category.label}
              </h3>
              <p className="text-sm mt-1 text-[var(--gray-2)]">
                {category.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySection;
