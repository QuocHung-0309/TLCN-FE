"use client";

import { ReviewData } from "@/lib/admin/adminReviewApi";

interface Props {
  data: ReviewData[];
  onDelete?: (reviewId: string, userName: string) => void;
  isDeleting?: boolean;
}

export function ReviewTable({ data, onDelete, isDeleting }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Không có bình luận nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[250px]">
              Tác giả
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px]">
              Đánh giá
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nội dung
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px]">
              Ngày đăng
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px]">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((review) => (
            <tr key={review._id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                {!review.userId ? (
                  <span className="text-slate-400 italic text-sm">Người dùng đã bị xóa</span>
                ) : (
                  <div className="flex items-center gap-3">
                    <img
                      src={review.userId.avatarUrl || "/default-avatar.png"}
                      alt=""
                      className="h-10 w-10 object-cover rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="flex flex-col">
                      <h2 className="text-sm font-bold text-slate-800 max-w-[150px] truncate" title={review.userId.fullName}>
                        {review.userId.fullName}
                      </h2>
                      <h4 className="text-[11px] text-slate-500 font-medium">
                        @{review.userId.username}
                      </h4>
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`text-lg ${
                        i < review.rating ? "ri-star-fill text-yellow-400" : "ri-star-line text-slate-200"
                      }`}
                    ></i>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-slate-600 line-clamp-2" title={review.comment}>
                  {review.comment || <span className="text-slate-400 italic">Không có nội dung</span>}
                </p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-700 font-medium">
                  {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(review.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDelete?.(review._id, review.userId?.fullName || "Người dùng ẩn")}
                    disabled={isDeleting}
                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Xóa"
                  >
                    <i className="ri-delete-bin-6-line text-[17px]"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
