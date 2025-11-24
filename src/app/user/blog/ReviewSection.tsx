'use client';

import { useState } from 'react';
import ReviewCard from './ReviewCard';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';

type Review = {
  id: number;
  rating: string;
  name: string;
  avatar: string;
  content: string;
};

type ReviewSectionProps = {
  reviews: Review[];
};

const REVIEWS_PER_PAGE = 5;

const ReviewSection = ({ reviews }: ReviewSectionProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const currentReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  return (
    <div className="space-y-2">
      {currentReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          className="cursor-pointer text-xl disabled:opacity-30"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <MdNavigateBefore size={24} />
        </button>
        <span className="text-sm text-[var(--gray-2)]">
          {currentPage} of {totalPages}
        </span>
        <button
          className="cursor-pointer text-xl disabled:opacity-30"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <MdNavigateNext size={24} />
        </button>
      </div>
    </div>
  );
};

export default ReviewSection;
