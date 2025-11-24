"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  type GetUsersParams,
  type CreateUserBody,
  type UpdateUserBody,
  type ResetPasswordBody,
} from "@/lib/admin/usersApi";

export const userKeys = {
  all: ["users"] as const,
  list: (params?: GetUsersParams) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

/** Lấy danh sách users */
export function useAllUsers(params?: GetUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getAllUsers(params),
    staleTime: 30_000,
  });
}

/** Lấy chi tiết user */
export function useUserDetail(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/** Tạo user mới */
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserBody) => createUser(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/** Cập nhật user */
export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserBody) => updateUser(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.list() });
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

/** Reset mật khẩu */
export function useResetPassword(id: string) {
  return useMutation({
    mutationFn: (body: ResetPasswordBody) => resetUserPassword(id, body),
  });
}

/** Xóa user */
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
