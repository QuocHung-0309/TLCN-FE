// src/types/Destination.ts

export interface Location {
    type: "Point";
    coordinates: [number, number]; 
  }
  
  export interface Destination {
    location: Location;
    _id: string;
    id: string; 
    name: string;
    description: string;
    categories: string[];
    address: string;
    district: string;
    ward: string;
    images: string[];
    avgRating: number;
    totalRatings: number;
    totalLikes: number;
    likeBy: string[];
    status: "approved" | "pending" | "rejected"; 
    createdBy: string;
    verifiedBy?: string; 
    createdAt: string; 
    updatedAt: string; 
    slug: string;
  }
  
  export interface Pagination {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  }
  
  export interface DestinationListResponse {
    message: string;
    data: {
      places: Destination[];
      pagination: Pagination;
    };
  }
  