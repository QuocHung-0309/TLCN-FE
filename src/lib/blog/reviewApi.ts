import api from "@/services/api";

/** Review data từ API */
export type ReviewResponse = {
  _id: string;
  tourId: string;
  userId: {
    _id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
};

/** Response format từ backend */
export type ReviewsListResponse = {
  total: number;
  averageRating?: number;
  data: ReviewResponse[];
};

/**
 * Lấy reviews của một tour
 * @param tourId - ID của tour
 */
export async function getReviewsByTour(tourId: string) {
  try {
    console.log("📊 Fetching reviews for tour:", tourId);
    const { data } = await api.get<ReviewsListResponse>(`/reviews/tour/${tourId}`);
    console.log("✅ Tour reviews fetched:", data.total);
    return data;
  } catch (error: any) {
    console.error("❌ Failed to fetch tour reviews:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Lấy reviews của user hiện tại
 */
export async function getMyReviews() {
  try {
    console.log("📊 Fetching my reviews");
    const { data } = await api.get<ReviewsListResponse>(`/reviews/me`);
    console.log("✅ My reviews fetched:", data.total);
    return data;
  } catch (error: any) {
    console.error("❌ Failed to fetch my reviews:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Tạo hoặc cập nhật review
 * @param tourId - ID của tour
 * @param rating - Rating từ 1-5
 * @param comment - Comment (optional)
 */
export async function submitReview(tourId: string, rating: number, comment?: string) {
  try {
    console.log("📝 Submitting review for tour:", tourId, "rating:", rating);
    const { data } = await api.post<{ message: string; review: ReviewResponse }>(`/reviews`, {
      tourId,
      rating,
      comment: comment || ""
    });
    console.log("✅ Review submitted successfully");
    return data;
  } catch (error: any) {
    console.error("❌ Failed to submit review:", error.response?.data || error.message);
    throw error;
  }
}
