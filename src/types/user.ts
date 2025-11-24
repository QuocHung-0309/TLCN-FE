

export interface SharedBlog {
    blog: string;
    sharedAt: string;
    _id: string;
    id: string;
  }
  
export interface User {
  _id: string;
  id: string;
  fullName: string;
  username: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  isActive?: string;
  status?: string;
  google_id?: string;
  createdDate?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for compatibility
  firstName?: string;
  lastName?: string;
  postCount?: number;
  reviewCount?: number;
  banned?: boolean;
}