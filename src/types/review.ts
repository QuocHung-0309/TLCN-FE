export interface Review {
  _id: string;
  userId: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  destinationId?: string; // placeId from backend
  status?: string;
}