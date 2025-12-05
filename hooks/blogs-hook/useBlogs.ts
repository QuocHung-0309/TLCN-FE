"use client";

import { useQuery } from "@tanstack/react-query";
import { blogApi } from "@/lib/blog/blogApi";
import type { BlogsResponse } from "@/lib/blog/blogApi";

export const useGetBlogs = (page = 1, limit = 9, q?: string) =>
  useQuery<BlogsResponse, Error>({
    queryKey: ["getBlogs", page, limit, q],
    queryFn: () => blogApi.getBlogs(page, limit, q),
    placeholderData: (prev) => prev,
  });
