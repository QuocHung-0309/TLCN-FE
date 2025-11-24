import { useEffect, useState } from "react";
import {
  fetchCommentsByBlog,
  createComment,
  updateComment,
  deleteComment,
  likeComment
} from "@/lib/blogComment/blogCommentApi";

export function useComments(blogId: string, token?: string) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blogId) return;
    setLoading(true);
    fetchCommentsByBlog(blogId)
      .then((data) => setComments(data))
      .finally(() => setLoading(false));
  }, [blogId]);

  const addComment = async (content: string) => {
    if (!token) return;
    const newComment = await createComment(blogId, content, token);
    setComments((prev) => [newComment, ...prev]);
  };

  const editComment = async (id: string, content: string) => {
    if (!token) return;
    const updated = await updateComment(id, content, token);
    setComments((prev) => prev.map((c) => (c._id === id ? updated : c)));
  };

  const removeComment = async (id: string) => {
    if (!token) return;
    await deleteComment(id, token);
    setComments((prev) => prev.filter((c) => c._id !== id));
  };

  const toggleLike = async (id: string) => {
    if (!token) return;
    const updated = await likeComment(id, token);
    setComments((prev) => prev.map((c) => (c._id === id ? updated : c)));
  };

  return { comments, loading, addComment, editComment, removeComment, toggleLike };
}
