// hooks/tours-hook/useTourDetail.ts
import { useQuery } from "@tanstack/react-query";
import { getTourById, type TourDetail } from "#/src/lib/tours/tour";

/** Hook chính lấy chi tiết tour theo id */
export const useGetTourById = (id?: string | number) =>
  useQuery<TourDetail, Error, TourDetail, readonly [string, string | number]>({
    queryKey: ["getTourById", id ?? ""] as const,
    queryFn: () => getTourById(id as string | number),
    enabled: !!id,
     placeholderData: (prev) => prev, // giữ dữ liệu cũ khi chuyển id
  });

/** Alias để import thuận tay: `import { useTourDetail } from ...` */
export const useTourDetail = useGetTourById;

export type { TourDetail };
