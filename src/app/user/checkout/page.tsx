"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Ticket,
  X,
  Percent,
  Banknote,
  ChevronRight,
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Calendar,
} from "lucide-react";

import { useGetTourById, useGetDepartureById } from "#/hooks/tours-hook/useTourDetail";
import {
  createBooking,
  initBookingPayment,
} from "@/lib/checkout/checkoutApi";
import type { CreateBookingBody } from "@/lib/checkout/checkoutApi";

import { authApi } from "@/lib/auth/authApi";
import { useAuthStore } from "#/stores/auth";
import { getUserToken } from "@/lib/auth/tokenManager";
import { voucherApi, type Voucher } from "@/lib/voucher/voucherApi";

/* ========== Helpers ========== */
const toNum = (v?: number | string) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d]/g, ""));
    return Number.isNaN(n) ? undefined : n;
  }
};

const vnd = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      })
        .format(n)
        .replace(/\s?₫$/, " VNĐ")
    : "—";

const dmy = (d?: string) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isPhoneVN = (s: string) =>
  /^(\+?84|0)(\d{9,10})$/.test(s.replace(/\s+/g, ""));

/* ===========================================================
 * TYPES
 * ===========================================================
 */
type PaymentMethod = CreateBookingBody["paymentMethod"];
type PaymentType = "deposit" | "full" | "office";

/* ===========================================================
 * Loading Fallback
 * ===========================================================
 */
function CheckoutLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-emerald-200 border-t-blue-950" />
        <p className="mt-4 text-slate-600">Đang tải trang thanh toán…</p>
      </div>
    </div>
  );
}

/* ===========================================================
 * PAGE WRAPPER (with Suspense for useSearchParams)
 * ===========================================================
 */
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}

/* ===========================================================
 * CHECKOUT CONTENT
 * ===========================================================
 */
function CheckoutContent() {
  const search = useSearchParams();
  const router = useRouter();

  const { token, user } = useAuthStore();
  const accessToken = token?.accessToken || getUserToken();

  const id = (search.get("id") ?? "").toString(); // Đây là departureId
  const initAdults = Math.max(1, Number(search.get("adults") ?? 1));
  const initChildren = Math.max(0, Number(search.get("children") ?? 0));

  const { data: departure, isLoading: isLoadingDep, isError: isErrorDep } = useGetDepartureById(id);
  const tour = departure?.tourId;
  const isLoading = isLoadingDep;
  const isError = isErrorDep;

  /* ---------- Form state ---------- */
  const [formData, setFormData] = React.useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });
  const [adults, setAdults] = React.useState(initAdults);
  const [children, setChildren] = React.useState(initChildren);

  const [paymentType, setPaymentType] = React.useState<PaymentType>("full");
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethod>("office-payment");

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof typeof formData | "submit", string>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);
  const [isReadOnly, setIsReadOnly] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);

  /* ---------- Voucher state ---------- */
  const [voucherCode, setVoucherCode] = React.useState("");
  const [voucher, setVoucher] = React.useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [voucherError, setVoucherError] = React.useState<string | null>(null);
  const [loadingVoucher, setLoadingVoucher] = React.useState(false);
  const [showVoucherModal, setShowVoucherModal] = React.useState(false);

  // Danh sách voucher của user
  const [myVouchers, setMyVouchers] = React.useState<Voucher[]>([]);
  const [loadingMyVouchers, setLoadingMyVouchers] = React.useState(true);
  
  /* ---------- Sync Payment Method when Type changes ---------- */
  React.useEffect(() => {
    if (paymentType === "deposit" && paymentMethod === "office-payment") {
      setPaymentMethod("vnpay-payment");
    }
  }, [paymentType, paymentMethod]);

  /* ---------- Prefill user profile ---------- */
  React.useEffect(() => {
    const loadUserProfile = async () => {
      if (!accessToken) return;
      if (user) {
        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          address: "",
          note: "",
        });
        setIsReadOnly(true);
        return;
      }
      try {
        const profile = await authApi.getProfile(accessToken);
        if (profile) {
          setFormData({
            fullName: profile.fullName || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: "",
            note: "",
          });
          setIsReadOnly(true);
        }
      } catch (err) {
        console.error(err);
        setIsReadOnly(false);
      }
    };
    loadUserProfile();
  }, [accessToken, user]);

  /* ---------- Load voucher của user ---------- */
  React.useEffect(() => {
    const loadVouchers = async () => {
      try {
        setLoadingMyVouchers(true);
        const vs = await voucherApi.getMyVouchers("active");
        setMyVouchers(vs.filter((v) => v.status === "active"));
      } catch (err: any) {
        console.error(err);
        setMyVouchers([]);
      } finally {
        setLoadingMyVouchers(false);
      }
    };
    loadVouchers();
  }, []);

  /* ---------- Giá / tổng tiền ---------- */
  const priceAdult = toNum(departure?.priceAdult ?? tour?.priceAdult) ?? 0;
  const priceChild = toNum(departure?.priceChild ?? tour?.priceChild) ?? 0;
  const coverImg =
    tour?.images?.[0] || tour?.image || tour?.cover || "/hot1.jpg";

  const listed = adults * priceAdult + children * priceChild;
  const totalDisplay = Math.max(0, listed - discountAmount);

  /* ---------- Ngày khởi hành và điều kiện đặt cọc ---------- */
  const diffDays = departure?.startDate ? Math.ceil((new Date(departure.startDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 999;
  const isDepositDisabled = diffDays < 3;

  React.useEffect(() => {
    if (isDepositDisabled && paymentType === "deposit") {
      setPaymentType("full");
    }
  }, [isDepositDisabled, paymentType]);

  /* ---------- Chỗ trống còn lại của lịch khởi hành ---------- */
  const remainingSeats =
    departure?.max_guests != null
      ? Math.max(0, Number(departure.max_guests) - Number(departure.current_guests || 0))
      : undefined;
  const isSoldOut = remainingSeats !== undefined && remainingSeats <= 0;
  const maxAdults = remainingSeats !== undefined ? Math.max(1, remainingSeats - children) : undefined;
  const maxChildren = remainingSeats !== undefined ? Math.max(0, remainingSeats - adults) : undefined;

  // Khi lịch khởi hành tải xong, chốt lại số khách nếu vượt chỗ trống
  React.useEffect(() => {
    if (remainingSeats === undefined) return;
    setAdults((a) => Math.max(1, Math.min(a, remainingSeats)));
    setChildren((c) => Math.max(0, Math.min(c, Math.max(0, remainingSeats - Math.min(adults, remainingSeats)))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeats]);

  // Mã giảm giá đã áp dụng nhưng số khách thay đổi sau đó -> yêu cầu áp lại
  const lastVoucherListedRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (
      voucher &&
      lastVoucherListedRef.current !== null &&
      lastVoucherListedRef.current !== listed
    ) {
      setVoucher(null);
      setDiscountAmount(0);
      setVoucherError("Số lượng khách đã thay đổi, vui lòng áp dụng lại mã giảm giá.");
      lastVoucherListedRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listed]);

  /* ---------- Validation ---------- */
  const validateField = (name: keyof typeof formData, value: string) => {
    if (name !== "address" && name !== "note" && !value.trim()) return "Vui lòng không để trống.";
    if (name === "email" && !isEmail(value)) return "Email không hợp lệ.";
    if (name === "phone" && !isPhoneVN(value))
      return "Số điện thoại không hợp lệ.";
    return undefined;
  };

  /* ---------- Voucher logic ---------- */
  const doApplyVoucher = async (code: string) => {
    if (!code.trim()) {
      setVoucherError("Vui lòng nhập mã voucher");
      return;
    }
    setLoadingVoucher(true);
    setVoucherError(null);

    try {
      const res = await voucherApi.validateVoucher(code.trim(), listed || 0, tour?._id);

      setVoucher(res.voucher || null);
      setDiscountAmount(res.discountAmount || 0);
      setVoucherError(null);
      setShowVoucherModal(false);
      lastVoucherListedRef.current = listed;
    } catch (err: any) {
      console.error(err);
      setVoucherError(
        err?.response?.data?.message || err?.message || "Không thể kiểm tra voucher."
      );
    } finally {
      setLoadingVoucher(false);
    }
  };

  const handleSelectVoucher = async (v: Voucher) => {
    setVoucherCode(v.code);
    await doApplyVoucher(v.code);
  };

  /* ---------- Handlers ---------- */
  const handleInputChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined, submit: undefined }));
    }
  };

  /* ---------- Submit Logic ---------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let isRedirecting = false;

    // Validate
    const newErrors: typeof errors = {};
    let hasError = false;
    (Object.keys(formData) as Array<keyof typeof formData>).forEach((k) => {
      if (k === "address" || k === "note") return;
      const msg = validateField(k, formData[k]);
      if (msg) {
        newErrors[k] = msg;
        hasError = true;
      }
    });
    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const total = Number(totalDisplay) || 0;

    const payload: CreateBookingBody = {
      tourId: String(id), // Giữ nguyên tên key là tourId để BE dễ parse nếu cần, nhưng nội dung là departureId
      contact: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim() || undefined,
      },
      guests: { adults: Number(adults) || 1, children: Number(children) || 0 },
      pricing: {
        priceAdult: Number(priceAdult) || 0,
        priceChild: Number(priceChild) || 0,
        total,
      },
      paymentMethod,
      couponCode: voucher?.code || null,
      paymentType: (paymentMethod === "office-payment"
        ? "office"
        : paymentType) as CreateBookingBody["paymentType"],
      note: formData.note?.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const res = await createBooking(payload);

      if (!res?.code) {
        throw new Error("Không tạo được đơn hàng (thiếu mã code).");
      }

      // Thanh toán VNPay
      if (paymentMethod === "vnpay-payment") {
        try {
          const isFullPayment = paymentType === "full";
          const payData = await initBookingPayment(res.code, isFullPayment);
          const redirectUrl =
            payData?.paymentUrl || payData?.payUrl || payData?.deeplink || payData?.payment?.redirectUrl;

          if (redirectUrl) {
            // Chuyển hướng đến VNPay để thanh toán
            isRedirecting = true;
            window.location.href = redirectUrl;
            return;
          } else {
            // Không có URL thanh toán - hiển thị lỗi
            throw new Error("Không thể khởi tạo thanh toán VNPay. Vui lòng thử lại.");
          }
        } catch (payErr: any) {
          console.error("VNPay init error:", payErr);
          // Chuyển đến trang success với trạng thái pending để user có thể thanh toán lại
          const sp = new URLSearchParams();
          sp.append("bookingId", res.code);
          sp.append("email", payload.contact.email);
          sp.append("paymentMethod", "vnpay-payment");
          sp.append("paymentError", "true");
          isRedirecting = true;
          router.replace(`/user/checkout/success?${sp.toString()}`);
          return;
        }
      }

      // Office payment: chuyển sang trang success
      const sp = new URLSearchParams();
      sp.append("bookingId", res.code);
      sp.append("email", payload.contact.email);
      sp.append("paymentMethod", String(paymentMethod));
      isRedirecting = true;
      router.replace(`/user/checkout/success?${sp.toString()}`);
    } catch (err: any) {
      console.error(err);
      setErrors({
        submit:
          err?.response?.data?.message || err?.message || "Đặt chỗ thất bại.",
      });
    } finally {
      if (!isRedirecting) {
        setSubmitting(false);
      }
    }
  };

  /* ---------- Loading / Error ---------- */
  // ... các đoạn logic phía trên giữ nguyên

  if (isLoading) return <CheckoutLoading />;

  if (isError || !tour)
    return (
      <div className="p-10 text-center text-slate-700">
        Không tìm thấy tour.
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ===== HERO / HEADER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 pb-20 pt-10 text-white">
        {/* pattern chấm */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-5 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            {/* breadcrumb */}
            <nav className="mb-3 flex items-center gap-2 text-xs font-medium text-blue-200/90">
              <Link href="/" className="hover:text-amber-300">
                Trang chủ
              </Link>
              <span className="h-1 w-1 rounded-full bg-blue-300" />
              <span className="text-blue-100">Đặt tour</span>
            </nav>

            {/* badge bước */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Bước 2 · Xác nhận & thanh toán
            </div>

            <h1 className="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl lg:text-4xl">
              Xác nhận đặt chỗ
            </h1>
            <p className="mt-2 max-w-lg text-sm text-blue-100/90">
              Kiểm tra thông tin liên lạc, số lượng khách và phương thức thanh
              toán trước khi hoàn tất đơn đặt tour.
            </p>
          </div>

          {/* tóm tắt tour nhỏ trên hero (mobile thì ẩn bớt) */}
          <div className="hidden min-w-[260px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs sm:block">
            <p className="mb-1 line-clamp-1 font-semibold text-white">
              {tour.title}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-blue-100">
              {tour.destination && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} /> {tour.destination}
                </span>
              )}
              {tour.time && (
                <span className="inline-flex items-center gap-1">
                  <User size={14} /> {tour.time}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-4 pb-10 -mt-4 lg:-mt-6">
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-8 lg:grid-cols-12"
        >
          {/* LEFT COLUMN: INFO */}
          <div className="space-y-6 lg:col-span-8">
            {/* 0. Tour Information */}
            <TourInfoSection tour={tour} departure={departure} />

            {/* 1. Contact Info */}
            <Card
              title="Thông tin liên lạc"
              icon={<User size={18} className="text-orange-500" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="fullName"
                  label="Họ và tên *"
                  value={formData.fullName}
                  onChange={(e: any) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  icon={<User size={16} />}
                  required
                  error={errors.fullName}
                />
                <Input
                  name="email"
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e: any) =>
                    handleInputChange("email", e.target.value)
                  }
                  icon={<Mail size={16} />}
                  required
                  error={errors.email}
                />
                <Input
                  name="phone"
                  label="Số điện thoại *"
                  value={formData.phone}
                  onChange={(e: any) =>
                    handleInputChange("phone", e.target.value)
                  }
                  icon={<Phone size={16} />}
                  required
                  error={errors.phone}
                />
                <Input
                  name="address"
                  label="Địa chỉ"
                  value={formData.address}
                  onChange={(e: any) =>
                    handleInputChange("address", e.target.value)
                  }
                  icon={<MapPin size={16} />}
                  error={errors.address}
                />
                <TextArea
                  name="note"
                  label="Ghi chú"
                  placeholder="Yêu cầu đặc biệt, lưu ý cho tour..."
                  value={formData.note}
                  onChange={(e: any) =>
                    handleInputChange("note", e.target.value)
                  }
                  icon={<FileText size={16} />}
                />
              </div>
            </Card>

            {/* 2. Guests */}
            <Card title="Số lượng hành khách" icon={<UsersIcon />}>
              {remainingSeats !== undefined && (
                <p
                  className={`mb-4 text-xs font-semibold ${
                    isSoldOut ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {isSoldOut
                    ? "Lịch khởi hành này đã hết chỗ. Vui lòng quay lại chọn lịch khác."
                    : `Còn ${remainingSeats} chỗ trống cho lịch khởi hành này.`}
                </p>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <QuantitySelector
                  label="Người lớn"
                  value={adults}
                  onChange={setAdults}
                  min={1}
                  max={maxAdults}
                  price={priceAdult}
                />
                <QuantitySelector
                  label="Trẻ em"
                  value={children}
                  onChange={setChildren}
                  min={0}
                  max={maxChildren}
                  price={priceChild}
                />
              </div>
            </Card>

            {/* 3. Payment Method */}
            <Card
              title="Phương thức thanh toán"
              icon={<Banknote size={18} className="text-blue-950" />}
            >
              <div className="mb-8">
                <p className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                  Chọn mức thanh toán
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    onClick={() => {
                      if (!isDepositDisabled) setPaymentType("deposit");
                    }}
                    className={`relative flex flex-col p-4 rounded-2xl border transition-all ${
                      isDepositDisabled
                        ? "opacity-50 cursor-not-allowed bg-slate-50 grayscale"
                        : paymentType === "deposit"
                        ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500 cursor-pointer"
                        : "border-slate-200 hover:border-orange-200 hover:bg-slate-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        checked={paymentType === "deposit"}
                        disabled={isDepositDisabled}
                        readOnly
                        className="w-4 h-4 text-orange-600"
                      />
                      <span className="text-sm font-bold text-slate-800">Đặt cọc 50%</span>
                    </div>
                    <p className="text-base font-bold text-orange-600">{vnd(totalDisplay / 2)}</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                      {isDepositDisabled ? "Chỉ hỗ trợ đặt cọc trước ngày đi ít nhất 3 ngày" : "Thanh toán trước để giữ chỗ"}
                    </p>
                    {paymentType === "deposit" && (
                      <div className="absolute top-2 right-2">
                        <Check size={16} className="text-orange-500" />
                      </div>
                    )}
                  </label>

                  <label
                    onClick={() => setPaymentType("full")}
                    className={`relative flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentType === "full"
                        ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500"
                        : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        checked={paymentType === "full"}
                        readOnly
                        className="w-4 h-4 text-blue-950"
                      />
                      <span className="text-sm font-bold text-slate-800">Toàn bộ 100%</span>
                    </div>
                    <p className="text-base font-bold text-blue-950">{vnd(totalDisplay)}</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Thanh toán hết một lần</p>
                    {paymentType === "full" && (
                      <div className="absolute top-2 right-2">
                        <Check size={16} className="text-emerald-500" />
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                  Chọn phương thức thanh toán
                </p>
                <PaymentMethods
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  paymentType={paymentType}
                />
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="space-y-6 lg:col-span-4">
            {/* Tour Summary Card */}
            <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-200/70 backdrop-blur">
              {/* Header Image */}
              <div className="relative h-40 w-full">
                <Image
                  src={coverImg}
                  alt={tour.title ?? "Tour"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-3">
                  <p className="mb-1 inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                    Xác nhận đặt tour
                  </p>
                  <h3 className="line-clamp-2 text-lg font-bold text-white">
                    {tour.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-blue-100">
                    <MapPin size={12} /> {tour.destination}
                  </p>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="space-y-4 p-5">
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Người lớn ({adults}x)</span>
                    <span>{vnd(adults * priceAdult)}</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between">
                      <span>Trẻ em ({children}x)</span>
                      <span>{vnd(children * priceChild)}</span>
                    </div>
                  )}
                  <div className="my-2 flex justify-between border-t border-dashed border-slate-200 pt-2 font-medium text-slate-900">
                    <span>Tạm tính</span>
                    <span>{vnd(listed)}</span>
                  </div>

                  {/* Discount Row */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                      <span>Voucher giảm giá</span>
                      <span>- {vnd(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* VOUCHER BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(true)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-3 text-left text-sm transition hover:bg-emerald-50"
                >
                  <div className="flex items-center gap-2">
                    <Ticket size={18} className="text-blue-950" />
                    <span className="font-medium text-slate-700">
                      {voucher ? (
                        <span className="font-bold text-emerald-700">
                          {voucher.code}
                        </span>
                      ) : (
                        "Mã giảm giá"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-blue-950 group-hover:underline">
                    {voucher ? "Đổi" : "Chọn hoặc nhập mã"}{" "}
                    <ChevronRight size={14} />
                  </div>
                </button>

                {/* Total */}
                <div className="flex items-end justify-between border-t border-slate-200 pt-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Tổng giá trị
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Đã bao gồm thuế & phí
                    </p>
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    {vnd(totalDisplay)}
                  </span>
                </div>

                {/* Amount to Pay Now */}
                {paymentType === "deposit" && (
                  <div className="flex items-end justify-between bg-orange-50/50 p-3 rounded-2xl border border-orange-100 mt-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">
                        Thanh toán ngay (50%)
                      </span>
                      <p className="text-[10px] text-orange-600/70 font-medium">
                        Số còn lại sẽ trả sau
                      </p>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {vnd(totalDisplay / 2)}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <label htmlFor="agree-terms" className="text-sm text-slate-600 cursor-pointer select-none leading-relaxed">
                    Tôi đã đọc và đồng ý với{" "}
                    <a href="#" className="font-semibold text-blue-600 hover:underline">
                      Điều khoản dịch vụ
                    </a>{" "}
                    của hệ thống.
                  </label>
                </div>

                <Button
                  type="submit"
                  full
                  disabled={submitting || isSoldOut || !agreedToTerms}
                  className="h-12 text-base mt-2"
                >
                  {submitting
                    ? "Đang xử lý..."
                    : isSoldOut
                    ? "Lịch khởi hành đã hết chỗ"
                    : paymentType === "deposit"
                    ? `Thanh toán cọc ${vnd(totalDisplay / 2)}`
                    : "Thanh toán ngay"}
                </Button>

                {errors.submit && (
                  <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-red-600">
                    <AlertCircle size={14} /> {errors.submit}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* VOUCHER MODAL */}
      <AnimatePresence>
        {showVoucherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-900 p-6">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-blue-500/20 blur-xl" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Ticket size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Chọn Voucher Travela</h3>
                      <p className="text-xs text-blue-100 mt-0.5">Mã giảm giá và ưu đãi đặc quyền</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVoucherModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6 bg-slate-50 border-b border-slate-100">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Ticket size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nhập mã voucher của bạn..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 uppercase"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => doApplyVoucher(voucherCode)}
                    disabled={!voucherCode || loadingVoucher}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow disabled:opacity-50 active:scale-95"
                  >
                    {loadingVoucher ? "Đang xử lý..." : "Áp dụng"}
                  </button>
                </div>
                {voucherError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-500"
                  >
                    <AlertCircle size={16} /> {voucherError}
                  </motion.p>
                )}
              </div>

              {/* List Vouchers */}
              <div className="p-6 max-h-[360px] overflow-y-auto bg-white">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-4 w-1 rounded-full bg-orange-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Mã giảm giá của tôi
                  </p>
                </div>

                {loadingMyVouchers ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
                    <p className="mt-4 text-sm">Đang tải danh sách voucher...</p>
                  </div>
                ) : myVouchers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Ticket size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Bạn chưa có voucher nào</p>
                    <p className="mt-1 text-xs text-slate-400">Các voucher bạn lưu sẽ xuất hiện ở đây.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myVouchers.map((v) => {
                      const isSelected = voucher?.code === v.code;
                      return (
                        <button
                          type="button"
                          key={v._id}
                          onClick={() => handleSelectVoucher(v)}
                          className={`group relative flex w-full items-stretch overflow-hidden rounded-2xl border text-left transition-all hover:shadow-md ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500"
                              : "border-slate-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          {/* Ticket stub edge decoration */}
                          <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50" />
                          <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50" />
                          
                          <div className={`flex w-24 shrink-0 flex-col items-center justify-center border-r border-dashed p-3 transition-colors ${
                            isSelected ? "border-blue-300 bg-blue-100/50" : "border-slate-200 bg-slate-50 group-hover:bg-blue-50/50"
                          }`}>
                            {v.type === "percent" ? (
                              <Percent size={28} className={isSelected ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"} />
                            ) : (
                              <Banknote size={28} className={isSelected ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"} />
                            )}
                            <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-blue-600" : "text-slate-500"}`}>
                              {v.type === "percent" ? "Giảm %" : "Tiền mặt"}
                            </span>
                          </div>

                          <div className="flex flex-1 items-center justify-between p-4 pl-5">
                            <div>
                              <p className={`text-base font-bold ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                                {v.code}
                              </p>
                              <p className="mt-0.5 text-sm text-slate-600 line-clamp-2">
                                {v.description ||
                                  `Giảm ${
                                    v.type === "percent"
                                      ? v.value + "%"
                                      : vnd(v.value)
                                  }`}
                              </p>
                              <div className="mt-2.5 flex items-center gap-4 text-[11px] font-medium text-slate-500">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span>Từ: {v.validFrom ? dmy(v.validFrom) : "-"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span>Đến: {v.validUntil ? dmy(v.validUntil) : "Không thời hạn"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors">
                              {isSelected ? (
                                <div className="flex h-full w-full items-center justify-center rounded-full border-transparent bg-blue-600 text-white">
                                  <Check size={14} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="h-full w-full rounded-full border-slate-300 group-hover:border-blue-400" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* --- Sub Components --- */
const UsersIcon = () => (
  <div className="flex -space-x-2">
    <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white" />
    <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white" />
  </div>
);

function Card({ title, icon, children }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-100">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          {icon}
        </div>
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function TourInfoSection({ tour, departure }: any) {
  const coverImg =
    tour?.images?.[0] || tour?.image || tour?.cover || "/hot1.jpg";
  const pickupAddress = "số 1 Võ Văn Ngân, Thủ Đức, Tp.HCM";

  const handleCopy = () => {
    navigator.clipboard.writeText(pickupAddress);
    alert("Đã sao chép địa chỉ điểm đón!");
  };

  const handleMap = () => {
    const url = "https://maps.app.goo.gl/buEiZ2sKJy2mTDFq9";
    window.open(url, "_blank");
  };

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        <h2 className="text-xl font-bold text-slate-900">Thông tin tour</h2>
      </div>

      <div className="space-y-5">
        {/* Tour Header Box */}
        <div className="flex gap-5 rounded-3xl border border-slate-100 bg-slate-50/30 p-5">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm border border-white">
            <Image
              src={coverImg}
              alt={tour?.title || "Tour"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-2 line-clamp-2">
              {tour?.title}
            </h3>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-slate-500">
                Ngày đi:{" "}
                <span className="font-bold text-orange-600">
                  {dmy(departure?.startDate)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Pickup Info Section */}
        <div className="rounded-[28px] border border-slate-100 bg-white shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2 rounded-full bg-orange-50 border border-orange-100 px-4 py-1.5 text-xs font-bold text-orange-700">
              <MapPin size={16} className="text-orange-600" /> Điểm đón khách
            </div>
            <div className="flex items-center gap-2 rounded-full bg-orange-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-orange-200">
              <Clock size={16} /> 07h30 hoặc 12h30
            </div>
          </div>

          {/* Address Box */}
          <div className="mx-4 mb-4 rounded-2xl border border-slate-100 bg-white p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Địa chỉ điểm đón
                </p>
                <p className="text-base font-bold text-slate-800 leading-snug">
                  {pickupAddress}
                </p>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">
                  Có bãi gửi xe máy
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-sm"
                >
                  <Copy size={15} /> Copy
                </button>
                <button
                  type="button"
                  onClick={handleMap}
                  className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-orange-700 active:scale-95 shadow-lg shadow-orange-200"
                >
                  <ExternalLink size={15} /> Map
                </button>
              </div>
            </div>
          </div>

          {/* Footer Instruction */}
          <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100/50">
            <p className="text-xs font-medium text-slate-500">
              Có mặt trước{" "}
              <span className="font-bold text-slate-700">10–15 phút</span> để
              làm thủ tục.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, icon, error, ...props }: any) {
  const hasError = !!error;
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          {icon}
        </div>
        <input
          {...props}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium text-slate-700 bg-slate-50/50 focus:bg-white outline-none transition-all ${
            hasError
              ? "border-rose-400 focus:ring-2 focus:ring-rose-400"
              : "border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          }`}
        />
      </div>
      {hasError && (
        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function QuantitySelector({ label, value, onChange, min, max, price }: any) {
  const atMax = max != null && value >= max;
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
      <div>
        <p className="font-bold text-slate-700 text-sm">{label}</p>
        <p className="text-xs text-blue-950 font-medium">
          {vnd(price)}/khách
        </p>
      </div>
      <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
        >
          -
        </button>
        <span className="w-6 text-center font-bold text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(max != null ? Math.min(max, value + 1) : value + 1)}
          disabled={atMax}
          title={atMax ? "Đã đạt số chỗ trống tối đa" : undefined}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
        >
          +
        </button>
      </div>
    </div>
  );
}

function PaymentMethods({ value, onChange, paymentType }: any) {
  const methods = [
    {
      id: "office-payment",
      type: "office",
      name: "Thanh toán tại văn phòng",
      desc: "Giữ chỗ trong 24h, thanh toán sau",
      img: "/pay.png",
      disabled: paymentType === "deposit",
    },
    {
      id: "vnpay-payment",
      type: "full",
      name: "Thanh toán VNPay",
      desc: "Thanh toán trực tuyến qua VNPay (QR, thẻ ATM, Visa...)",
      img: "/vnpay.png",
      disabled: false,
    },
  ];

  return (
    <div className="space-y-3">
      {methods.map((m) => (
        <label
          key={m.id}
          onClick={() => {
            if (m.disabled) return;
            onChange(m.id);
          }}
          className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
            m.disabled
              ? "opacity-50 cursor-not-allowed bg-slate-50 grayscale"
              : value === m.id
              ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500 cursor-pointer"
              : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 cursor-pointer"
          }`}
        >
          <input
            type="radio"
            name="payment"
            className="w-5 h-5 text-blue-950 focus:ring-emerald-500"
            checked={value === m.id}
            disabled={m.disabled}
            readOnly
          />
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src={m.img}
              alt={m.name}
              fill
              className="object-contain"
              onError={(e: any) => {
                try {
                  (e.currentTarget as HTMLImageElement).src = "/pay.png";
                } catch {
                  // ignore
                }
              }}
            />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800 text-sm">{m.name}</p>
            <p className="text-xs text-slate-500">{m.desc}</p>
            {m.disabled && (
              <p className="text-[10px] text-red-500 font-bold mt-1">
                Không áp dụng cho đặt cọc 50%
              </p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
function TextArea({ label, icon, error, ...props }: any) {
  const hasError = !!error;
  return (
    <div className="md:col-span-2">
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
          {icon}
        </div>
        <textarea
          {...props}
          rows={3}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium text-slate-700 bg-slate-50/50 focus:bg-white outline-none transition-all resize-none ${
            hasError
              ? "border-rose-400 focus:ring-2 focus:ring-rose-400"
              : "border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          }`}
        />
      </div>
      {hasError && (
        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function Button({ children, className = "", full, ...props }: any) {
  return (
    <button
      {...props}
      className={`
        w-full rounded-2xl 
        bg-gradient-to-r from-orange-500 to-orange-600 
        px-4 py-3
        text-sm font-bold text-white
        shadow-lg shadow-orange-500/30
        transition-all
        hover:from-orange-600 hover:to-orange-700
        active:scale-[0.97]
        disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
    >
      {children}
    </button>
  );
}
