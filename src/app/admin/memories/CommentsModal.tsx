import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { Trash2, X, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Comment {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

interface Props {
  memoryId: string;
  isOpen: boolean;
  onClose: () => void;
}

const getMemoryComments = async (memoryId: string) => {
  const res = await axiosInstance.get(`/travel-memories/${memoryId}/comments`);
  return res.data;
};

const deleteMemoryComment = async (memoryId: string, commentId: string) => {
  const res = await axiosInstance.delete(`/travel-memories/${memoryId}/comments/${commentId}`);
  return res.data;
};

export const CommentsModal = ({ memoryId, isOpen, onClose }: Props) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["adminMemoryComments", memoryId],
    queryFn: () => getMemoryComments(memoryId),
    enabled: isOpen && !!memoryId,
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteMemoryComment(memoryId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMemoryComments", memoryId] });
      queryClient.invalidateQueries({ queryKey: ["adminMemories"] }); // To update commentsCount on the card
      showSuccess("Đã xóa bình luận");
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || "Lỗi khi xóa bình luận");
    },
  });

  if (!isOpen) return null;

  const comments = data?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
            Bình luận ({comments.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Chưa có bình luận nào</p>
          ) : (
            comments.map((comment: Comment) => (
              <div key={comment._id} className="flex gap-3 items-start group">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 mt-1">
                  {comment.userId?.avatar ? (
                    <img src={comment.userId.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-bold text-xs">
                      {comment.userId?.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-3 relative">
                  <div className="flex justify-between items-start pr-6">
                    <h5 className="font-semibold text-sm text-slate-800">
                      {comment.userId?.fullName}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{comment.content}</p>

                  <button
                    onClick={() => {
                      if (window.confirm("Xóa bình luận này?")) {
                        deleteMutation.mutate(comment._id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all disabled:opacity-50"
                    title="Xóa bình luận"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
