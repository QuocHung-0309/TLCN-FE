// types/review.ts

export interface User {
  _id: string;
  email: string;
  id: string;
}

export interface Review {
  _id: string;
  placeId: string;
  userId: User;
  rating: number;
  totalLikes: number;
  likeBy: string[];       
  comment: string;
  images: string[];       
  _hidden: boolean;
  createdAt: string;     
  updatedAt: string;
  __v: number;
}

export interface ReviewResponse {
  success: boolean;
  data: {
    reviews: Review[];
  };
}
