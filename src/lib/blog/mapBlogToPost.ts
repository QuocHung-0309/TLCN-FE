// src/lib/blog/mapBlogToPost.ts

import { Post } from "@/types/blog";

export function mapBlogToPost(blog: any): Post {
  // Map backend BlogPost to frontend Post type
  // Backend fields: title, slug, content, summary, tags, coverImageUrl, status, publishedAt, authorId, ratingAvg, ratingCount, comments
  
  return {
    id: blog._id,
    slug: blog.slug,
    title: blog.title,
    image: blog.coverImageUrl || "/Logo.svg",

    // categories (not in backend, use tags instead)
    category: blog.tags?.[0] || "Khác",
    categories: blog.tags || [],
    tags: blog.tags || [],

    // author
    author: typeof blog.authorId === "object"
      ? `${blog.authorId.firstName || ""} ${blog.authorId.lastName || ""}`.trim() || "Admin"
      : "Admin",
    authorAvatar: typeof blog.authorId === "object"
      ? blog.authorId.avatar || "/Logo.svg"
      : "/Logo.svg",

    // time & location
    date: blog.publishedAt || blog.createdAt,
    address: blog.summary || "",
    ward: "",

    // content & album
    content: blog.content ? [{ type: 'text', value: blog.content }] : [],
    album: [],

    // privacy & interactions (not in backend admin blogs)
    privacy: "public",
    likeBy: [],
    totalLikes: 0,
    totalComments: blog.comments?.length || 0,
    shareCount: 0,
    viewCount: 0,

    // status & rating
    status: blog.status || "draft",
    ratingAvg: blog.ratingAvg || 0,
    ratingCount: blog.ratingCount || 0,
    comments: blog.comments || [],
  };
}
