import { useQuery } from "@tanstack/react-query";
import { getBlogs, type BlogsResponse } from "#/src/lib/blog/blogApi"; 

export const useGetBlogs = (page = 1, limit = 12) =>
  useQuery<BlogsResponse, Error>({
    queryKey: ["getBlogs", page, limit],
    queryFn: () => getBlogs({ page: page, limit: limit }),
    placeholderData: (prev) => prev,
  });
