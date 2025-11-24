'use client';

import Image from 'next/image';
import { FaRegHeart, FaRegComment, FaHeart } from 'react-icons/fa';
import { LuCopy, LuShare2 } from 'react-icons/lu';
import { RiCalendar2Line } from 'react-icons/ri';
import { useEffect, useRef, useState } from 'react';
import { PiShareFat } from 'react-icons/pi';
import Link from 'next/link';
import { Post } from '@/types/blog';
import { mapBlogToPost } from '@/lib/blog/mapBlogToPost';
import Button from '@/components/ui/Button';
import { likeBlog } from '@/lib/blog/blogApi';

type BlogDetailProps = {
  post: any;
};

export default function BlogDetail({ post }: BlogDetailProps) {
  post = mapBlogToPost(post);
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null; //đang lấy userId từ localStorage

  const [liked, setLiked] = useState(
    currentUserId ? post.likeBy.includes(currentUserId) : false
  );
  const [likeCount, setLikeCount] = useState(post.totalLikes);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const [visibleCount, setVisibleCount] = useState(3);
  const commentRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleLike = async () => {
    try {
      const updatedBlog = await likeBlog(post.id);
      setLikeCount(updatedBlog.totalLikes);
      if (currentUserId) {
        setLiked(updatedBlog.likeBy.includes(currentUserId));
      }
    } catch (err) {
      console.error("Lỗi khi like blog:", err);
    }
  };

  const scrollToComments = () => {
    commentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Đã sao chép liên kết!');
    setShowShareMenu(false);
  };

  const handleSharePersonal = () => {
    alert('Đã chia sẻ về trang cá nhân.');
    setShowShareMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tiêu đề */}
      <h1 className="text-justify text-3xl font-extrabold leading-snug text-[var(--foreground)] mb-2">
        {post.title}
      </h1>

      {/* Categories + Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.categories?.length > 0 ? (
          post.categories.map((cat: string, idx: number) => (
            <span
              key={idx}
              className="inline-block bg-[#F2F8F7] text-sm text-[var(--gray-1)] font-medium px-3 py-1 rounded-md"
            >
              {cat}
            </span>
          ))
        ) : (
          <span className="inline-block bg-[#F2F8F7] text-sm text-[var(--gray-1)] font-medium px-3 py-1 rounded-md">
            Chưa phân loại
          </span>
        )}
        
      </div>

      {/* Thông tin tác giả + like/share */}
      <div className="flex items-center justify-between flex-wrap text-sm text-[var(--gray-1)] mb-4">
        <div className="flex items-center gap-2">
          <Link href={`/user/profile`} className="flex items-center gap-2">
            <Image
              src={post.authorAvatar || '/Logo.svg'}
              alt={post.author || 'Ẩn danh'}
              width={20}
              height={20}
              className="object-cover rounded-full"
            />
            <span>{post.author || 'Ẩn danh'}</span>
          </Link>
          <span className="mx-1 text-[var(--gray-2)]">|</span>
          <span className="flex items-center gap-1">
            <RiCalendar2Line className="text-[var(--gray-2)]" />
            {post.date
              ? new Date(post.date).toLocaleDateString('vi-VN')
              : 'Không rõ ngày'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[var(--foreground)] text-base mt-2 sm:mt-0">
          <div className="cursor-pointer flex items-center gap-1" onClick={toggleLike}>
            {liked ? (
              <FaHeart className="text-[var(--error)]" />
            ) : (
              <FaRegHeart className="text-[var(--foreground)]" />
            )}
            <span>{likeCount}</span>
          </div>
          <div className="cursor-pointer flex items-center gap-1" onClick={scrollToComments}>
            <FaRegComment className="text-[var(--foreground)]" />
            <span>89</span>
          </div>
          <div className="relative" ref={menuRef}>
            <div
              className="cursor-pointer flex items-center gap-1"
              onClick={() => setShowShareMenu((prev) => !prev)}
            >
              <LuShare2 className="text-[var(--foreground)]" />
              <span>{post.shareCount ?? 0}</span>
            </div>
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-63 bg-[var(--background)] border border-[var(--gray-5)] rounded-lg shadow-lg z-10">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <LuCopy size={20} />
                  <span>Sao chép liên kết</span>
                </button>
                <button
                  onClick={handleSharePersonal}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <PiShareFat size={20} />
                  <span>Chia sẻ về trang cá nhân</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ảnh chính */}
      <div className="w-full h-[300px] relative mb-6">
        <Image
          src={post.image || '/Logo.svg'}
          alt={post.title || 'No title'}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Nội dung */}
      <article className="prose prose-lg max-w-none text-justify text-[var(--foreground)] space-y-6">
        {post.content?.map((block: Post['content'][0], idx: number) => {
          if (block.type === 'text') {
            return <p key={idx}>{block.value}</p>;
          }
          if (block.type === 'image' && block.url) {
            return (
              <div key={idx} className="flex justify-center my-6">
                <Image
                  src={block.url || '/Logo.svg'}
                  alt={block.value || `image-${idx}`}
                  width={800}
                  height={600}
                  className="rounded-md max-w-full h-auto object-contain"
                />
              </div>
            );
          }
          if (block.type === 'video' && block.url) {
            return (
              <div key={idx} className="flex justify-center my-6">
                <video src={block.url} controls className="w-full max-h-[500px] rounded-md" />
              </div>
            );
          }
          return null;
        })}
      </article>

      <div className="flex flex-wrap gap-2 mb-4 mt-5">
        {post.tags?.map((tag: string, idx: number) => (
          <span
            key={idx}
            className="inline-block bg-gray-100 text-sm text-gray-600 px-3 py-1 rounded-md"
          >
            #{tag}
          </span>
      ))}
      </div>
      
      {/* Album */}
      {post.album && post.album.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Album</h2>

          <div className="flex flex-col gap-6">
            {post.album.slice(0, visibleCount).map((item: Post['album'][0], idx: number) => (
              <div key={idx} className="w-full relative aspect-video rounded-lg overflow-hidden">
                {item.type === 'image' ? (
                  <Image
                    src={item.url || '/Logo.svg'}
                    alt={item.caption || `album-${idx}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>

          {visibleCount < post.album.length && (
            <div className="mt-4 text-center">
              <Button
                variant="primary"
                className="px-6 py-2"
                onClick={() => setVisibleCount((prev: number) => prev + 3)}
              >
                Xem thêm
              </Button>
            </div>
          )}
        </div>
      )}
      <div ref={commentRef}></div>
    </div>
  );
}
