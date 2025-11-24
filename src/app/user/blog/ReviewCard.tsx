'use client';

import Image from 'next/image';
import { IoFlagSharp } from 'react-icons/io5';
import { AiFillLike } from "react-icons/ai";
import { useState } from 'react';

type Review = {
  id: number;
  rating: string;
  name: string;
  avatar: string;
  content: string;
  likes?: number;
};

type ReviewCardProps = {
  review: Review;
};

const ReviewCard = ({ review }: ReviewCardProps) => {
  const [likes, setLikes] = useState(review.likes || 5);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes((prev) => prev - 1);
      setLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setLiked(true);
    }
  };

  return (
    <div className="relative border-b border-[var(--gray-2)] py-4 flex flex-col gap-2">
      <button
        className="cursor-pointer absolute right-0 top-0 p-2 text-[var(--gray-2)] hover:text-[var(--gray-1)]"
        title="Báo cáo đánh giá"
      >
        <IoFlagSharp size={18} />
      </button>
      <button
        onClick={handleLike}
        className="cursor-pointer absolute right-8 top-0 p-2 flex items-center gap-1 text-[var(--gray-2)] hover:text-[var(--gray-1)]"
        title="Yêu thích"
      >
        <AiFillLike size={18} className={liked ? "text-[var(--primary)]" : ""}/>
        <span className="text-sm">{likes}</span>
      </button>

      {/* Nội dung đánh giá */}
      <div className="flex items-start gap-3 pr-8"> 
        <div className="relative size-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={review.avatar}
            alt={review.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-semibold  pr-12">
            {review.rating} <span className="text-[var(--gray-2)]">| {review.name}</span>
          </p>
          <p className="text-sm text-[var(--gray-2)] whitespace-pre-line">{review.content}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
