// /lib/blog/blogApi.ts
import axiosInstance from "@/lib/axiosInstance";

/* ===== Types ===== */

export type BlogSummary = {
  slug: string;
  title: string;
  excerpt?: string;
  cover?: string;
  coverImageUrl?: string;
  thumbnail?: string;
  categories?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  author?: {
    id?: string | number;
    name?: string;
    avatar?: string;
  };
  rating?: number;        // trung bình
  commentsCount?: number;
};
export type BlogContentBlock = {
  type: "text" | "image" | "video" | "html";
  value: string;
};

export type BlogDetail = BlogSummary & {
  // BE hiện tại đang trả content là HTML string
  // nhưng mình vẫn cho phép mảng block để sau này dễ nâng cấp
  content?: string | BlogContentBlock[];

  summary?: string;
  coverImageUrl?: string;
  ratingAvg?: number;
  ratingCount?: number;
  mediaUrls?: string[];
  wardName?: string;
  ward?: string;
  locationDetail?: string;
};


// ✅ Đổi tên cho thống nhất: BlogsResponse
export type BlogsResponse = {
  data: BlogSummary[];
  total: number;
  page: number;
  limit: number;
};

export const getBlogBySlug = async (slug: string): Promise<BlogDetail> => {
  const res = await axiosInstance.get<BlogDetail>(`/blog/${slug}`);
  return res.data;
};

export type BlogComment = {
  id: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  rating?: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  isOwner?: boolean;
};

export type BlogCommentsResponse = {
  ratingAvg?: number;
  ratingCount?: number;
  comments: BlogComment[];
};

/* ===== API ===== */

// ✅ getBlogs dùng đúng kiểu BlogsResponse
export const getBlogs = async (
  page = 1,
  limit = 9,
  q?: string
): Promise<BlogsResponse> => {
  const res = await axiosInstance.get<BlogsResponse>("/blog", {
    params: {
      page,
      limit,
      q: q?.trim() || undefined,
    },
  });

  const raw = res.data;

  return {
    ...raw,
    data: raw.data.map((b: any) => ({
      ...b,
      // chuẩn hoá cho FE
      excerpt: b.excerpt ?? b.summary ?? "",
      cover: b.cover ?? b.coverImageUrl ?? b.thumbnail,
    })),
  };
};

export const getComments = async (slug: string): Promise<BlogCommentsResponse> => {
  const res = await axiosInstance.get<BlogCommentsResponse>(
    `/blog/${slug}/comments`
  );
  return res.data;
  
};

const createComment = async (
  slug: string,
  body: { rating: number; content: string }
): Promise<BlogComment> => {
  const res = await axiosInstance.post<BlogComment>(
    `/blog/${slug}/comments`,
    body
  );
  return res.data;
};

const updateComment = async (
  slug: string,
  commentId: string,
  body: { rating?: number; content?: string }
): Promise<BlogComment> => {
  const res = await axiosInstance.patch<BlogComment>(
    `/blog/${slug}/comments/${commentId}`,
    body
  );
  return res.data;
};

const deleteComment = async (slug: string, commentId: string): Promise<void> => {
  await axiosInstance.delete(`/blog/${slug}/comments/${commentId}`);
};

const createBlog = async (formData: FormData) => {
  const res = await axiosInstance.post("/blog", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const blogApi = {
  getBlogs,
  getBlogBySlug,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  createBlog,
};
