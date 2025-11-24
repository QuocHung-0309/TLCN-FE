import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminBookings,
  updateBookingStatus,
  updateBookingPaymentStatus,
  deleteAdminBooking,
  bulkMarkBookingsPaid,
  refundBookingPayment,
  getPaymentStatistics,
  getBookingPaymentHistory,
  GetAdminBookingsParams,
} from "@/lib/admin/adminBookingApi";

// Hook to fetch bookings with filters
export const useAdminBookings = (params?: GetAdminBookingsParams) => {
  return useQuery({
    queryKey: ["admin", "bookings", params],
    queryFn: () => getAdminBookings(params),
    staleTime: 1000 * 60 * 5,
  });
};

// Hook to update booking status
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "c" | "x" }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
};

// Hook to update payment status
export const useUpdateBookingPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
      amount,
      provider = "manual",
      ref,
    }: {
      id: string;
      action: "mark_paid";
      amount?: number;
      provider?: string;
      ref?: string;
    }) => updateBookingPaymentStatus(id, action, amount, provider, ref),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payment-stats"] });
    },
  });
};

// Hook to delete booking
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
};

// Hook to bulk mark bookings as paid
export const useBulkMarkBookingsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingIds,
      amount,
      provider = "manual",
      note,
    }: {
      bookingIds: string[];
      amount?: number;
      provider?: string;
      note?: string;
    }) => bulkMarkBookingsPaid(bookingIds, amount, provider, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payment-stats"] });
    },
  });
};

// Hook to refund booking payment
export const useRefundBookingPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      refundAmount,
      reason,
      refundRef,
    }: {
      id: string;
      refundAmount?: number;
      reason?: string;
      refundRef?: string;
    }) => refundBookingPayment(id, refundAmount, reason, refundRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payment-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payment-history"] });
    },
  });
};

// Hook to fetch payment statistics
export const usePaymentStatistics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["admin", "payment-stats", startDate, endDate],
    queryFn: () => getPaymentStatistics(startDate, endDate),
    staleTime: 1000 * 60 * 5,
  });
};

// Hook to fetch payment history for a booking
export const useBookingPaymentHistory = (bookingId: string) => {
  return useQuery({
    queryKey: ["admin", "payment-history", bookingId],
    queryFn: () => getBookingPaymentHistory(bookingId),
    staleTime: 1000 * 60 * 5,
  });
};