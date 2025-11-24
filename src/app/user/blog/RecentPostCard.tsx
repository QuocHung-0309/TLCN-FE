'use client';

import React from 'react';
import Image from 'next/image';
import { FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { Post } from '@/types/blog';

interface RecentPostCardProps {
  post: Post;
}

const RecentPostCard: React.FC<RecentPostCardProps> = ({ post }) => {
  const defaultImage = '/Logo.svg';
  return (
    <div className="flex gap-3">
      <Link href={`/user/blog/${post.slug}`} className="w-22 h-22 relative rounded overflow-hidden flex-shrink-0">
        <Image src={post.image || defaultImage} alt={post.title} fill className="object-cover" />
      </Link>
      <div className="flex flex-col justify-center">
        <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded w-fit mb-1">{post.category}</span>
        <Link href={`/user/blog/${post.slug}`}>
          <h3 className="text-sm font-semibold leading-tight line-clamp-2">{post.title}</h3>
        </Link>
        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
          <Link href={`/user/profile`}>
            <Image src={post.authorAvatar || defaultImage} alt={post.author} width={16} height={16} className="object-cover rounded-full" />
          </Link>
          <Link href={`/user/profile`}>
            <span>{post.author}</span>
          </Link>
          <span className="mx-1">|</span>
          <span className="flex items-center gap-1">
            <FiClock className="text-gray-500" />
            {new Date(post.date).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecentPostCard;
