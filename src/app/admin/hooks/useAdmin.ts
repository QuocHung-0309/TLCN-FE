"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminLogin, getOngoingTours, setTourLeader, addTimeline, getDashboardStats,
  getExpenses, addExpense, updateExpense, deleteExpense,
  getAllToursAdmin, getTourByIdAdmin, createTourAdmin, updateTourAdmin, deleteTourAdmin,
  type AdminLoginBody, type TimelineEventBody, type Expense, type TourInput
} from "@/lib/admin/adminApi";

export const adminKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminKeys.all, "dashboard"] as const,
  ongoing: () => [...adminKeys.all, "ongoing"] as const,
  expenses: (tourId: string) => [...adminKeys.all, "expenses", tourId] as const,
  tours: () => [...adminKeys.all, "tours"] as const,
  toursList: (params?: any) => [...adminKeys.tours(), "list", params] as const,
  tourDetail: (tourId: string) => [...adminKeys.tours(), "detail", tourId] as const,
};

export function useAdminLogin(onSuccess?: () => void) {
  return useMutation({
    mutationFn: async (body: AdminLoginBody) => {
      const resp = await adminLogin(body);
      // Đảm bảo token được lưu sau login thành công
      if (resp.accessToken) {
        // adminLogin đã lưu vào localStorage rồi, nhưng gọi lại để đảm bảo
      }
      return resp;
    },
    onSuccess: () => onSuccess?.(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: getDashboardStats,
    staleTime: 60_000, // 1 minute
  });
}

export function useOngoingTours() {
  return useQuery({
    queryKey: ["admin","ongoing"],
    queryFn: getOngoingTours,
    staleTime: 30_000,
  });
}

export function useSetLeader(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leaderId: string | null) => setTourLeader(tourId, leaderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ongoing() }),
  });
}

export function useAddTimeline(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TimelineEventBody) => addTimeline(tourId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ongoing() }),
  });
}

export function useExpenses(tourId: string) {
  return useQuery({ queryKey: adminKeys.expenses(tourId), queryFn: () => getExpenses(tourId) });
}
export function useAddExpense(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Expense, "_id">) => addExpense(tourId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.expenses(tourId) }),
  });
}
export function useUpdateExpense(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Expense> }) =>
      updateExpense(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.expenses(tourId) }),
  });
}
export function useDeleteExpense(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.expenses(tourId) }),
  });
}

/* ====================================
 *  TOURS CRUD HOOKS
 * ==================================== */

/** Lấy danh sách tất cả tours */
export function useAllTours(params?: {
  page?: number;
  limit?: number;
  status?: string;
  destination?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: adminKeys.toursList(params),
    queryFn: () => getAllToursAdmin(params),
    staleTime: 30_000,
  });
}

/** Lấy chi tiết tour */
export function useTourDetail(tourId: string) {
  return useQuery({
    queryKey: adminKeys.tourDetail(tourId),
    queryFn: () => getTourByIdAdmin(tourId),
    enabled: !!tourId,
    staleTime: 30_000,
  });
}

/** Tạo tour mới */
export function useCreateTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TourInput) => createTourAdmin(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.tours() });
      qc.invalidateQueries({ queryKey: adminKeys.ongoing() });
    },
  });
}

/** Cập nhật tour */
export function useUpdateTour(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TourInput>) => updateTourAdmin(tourId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.tours() });
      qc.invalidateQueries({ queryKey: adminKeys.tourDetail(tourId) });
      qc.invalidateQueries({ queryKey: adminKeys.ongoing() });
    },
  });
}

/** Xóa tour */
export function useDeleteTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tourId: string) => deleteTourAdmin(tourId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.tours() });
      qc.invalidateQueries({ queryKey: adminKeys.ongoing() });
    },
  });
}
