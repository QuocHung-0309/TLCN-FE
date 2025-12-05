// /app/user/checkout/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, AlertCircle } from "lucide-react";

import { useGetTourById } from "#/hooks/tours-hook/useTourDetail";
// IMPORT THÊM 2 HÀM KHỞI TẠO THANH TOÁN
import {
  createBooking,
  initBookingPayment,
  initSepayPayment,
} from "@/lib/checkout/checkoutApi";
import type { CreateBookingBody } from "@/lib/checkout/checkoutApi";

import { authApi } from "@/lib/auth/authApi";
import { useAuthStore } from "#/stores/auth";
import { getUserToken } from "@/lib/auth/tokenManager";
import { debugTokenAndUser } from "@/lib/auth/tokenDebug";

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
type PaymentMethod = CreateBookingBody["paymentMethod"] | "sepay-payment";
type PaymentType = "office" | "full";

/* ===========================================================
 * PAGE
 * ===========================================================
 */
export default function CheckoutPage() {
  const search = useSearchParams();
  const router = useRouter();

  const { token, user } = useAuthStore();
  const accessToken = token?.accessToken || getUserToken();

  const id = (search.get("id") ?? "").toString();
  const initAdults = Math.max(1, Number(search.get("adults") ?? 1));
  const initChildren = Math.max(0, Number(search.get("children") ?? 0));

  const { data: tour, isLoading, isError } = useGetTourById(id);

  /* ---------- Form state ---------- */
  const [formData, setFormData] = React.useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [adults, setAdults] = React.useState(initAdults);
  const [children, setChildren] = React.useState(initChildren);

  const [paymentType, setPaymentType] = React.useState<PaymentType>("office");
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethod>("office-payment");

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof typeof formData | "submit", string>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);
  const [isReadOnly, setIsReadOnly] = React.useState(false);

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

  /* ---------- Giá / tổng tiền ---------- */
  const priceAdult = toNum(tour?.priceAdult) ?? 0;
  const priceChild = toNum(tour?.priceChild) ?? 0;
  const coverImg =
    tour?.images?.[0] || tour?.image || tour?.cover || "/hot1.jpg";

  const listed = adults * priceAdult + children * priceChild;
  const totalDisplay = listed;

  /* ---------- Validation ---------- */
  const validateField = (name: keyof typeof formData, value: string) => {
    if (name !== "address" && !value.trim()) return "Vui lòng không để trống.";
    if (name === "email" && !isEmail(value)) return "Email không hợp lệ.";
    if (name === "phone" && !isPhoneVN(value))
      return "Số điện thoại không hợp lệ.";
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as {
      name: keyof typeof formData;
      value: string;
    };
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => ({ ...prev, [name]: undefined, submit: undefined }));
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target as {
      name: keyof typeof formData;
      value: string;
    };
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
      submit: undefined,
    }));
  };

  /* ---------- Submit Logic (ĐÃ SỬA) ---------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors: typeof errors = {};
    let hasError = false;
    (Object.keys(formData) as Array<keyof typeof formData>).forEach((k) => {
      if (k === "address") return;
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
      tourId: String(tour?._id ?? id),
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
      couponCode: null,
      paymentType: paymentType as CreateBookingBody["paymentType"],
    };

    try {
      setSubmitting(true);

      // BƯỚC 1: TẠO ĐƠN HÀNG TRƯỚC
      const res = await createBooking(payload);

      if (!res?.code) {
        throw new Error("Không tạo được đơn hàng (thiếu mã code).");
      }

      // BƯỚC 2: KIỂM TRA PHƯƠNG THỨC THANH TOÁN

      // >>> TRƯỜNG HỢP 1: VNPay (Gọi initBookingPayment giống logic nút VnpayPayButton cũ)
      if (paymentMethod === "vnpay-payment") {
        try {
          // Gọi API lấy link thanh toán
          const payData = await initBookingPayment(res.code, total);
          const redirectUrl =
            payData?.payUrl ||
            payData?.deeplink ||
            payData?.payment?.redirectUrl;

          if (redirectUrl) {
            window.location.href = redirectUrl; // CHUYỂN HƯỚNG LUÔN
            return;
          } else {
            // Nếu tạo đơn được nhưng không lấy được link -> vẫn cho vào trang success để họ tự xử lý sau
            throw new Error("Không lấy được link thanh toán VNPay.");
          }
        } catch (payErr) {
          console.error("Lỗi VNPay:", payErr);
          // Nếu lỗi lấy link, chuyển về trang success để khách không mất đơn
          redirectToSuccess(res.code, payload.contact.email, paymentMethod);
          return;
        }
      }

      // >>> TRƯỜNG HỢP 2: Sepay (Gọi initSepayPayment)
      else if (paymentMethod === "sepay-payment") {
        try {
          const payData = await initSepayPayment(res.code, total);
          const redirectUrl =
            payData?.payUrl ||
            payData?.deeplink ||
            payData?.payment?.redirectUrl;

          if (redirectUrl) {
            window.location.href = redirectUrl; // CHUYỂN HƯỚNG LUÔN
            return;
          } else {
            throw new Error("Không lấy được link thanh toán Sepay.");
          }
        } catch (payErr) {
          console.error("Lỗi Sepay:", payErr);
          redirectToSuccess(res.code, payload.contact.email, paymentMethod);
          return;
        }
      }

      // >>> TRƯỜNG HỢP 3: Office Payment (Thanh toán tại văn phòng)
      else {
        redirectToSuccess(res.code, payload.contact.email, paymentMethod);
      }
    } catch (err: any) {
      console.error(err);
      setErrors({
        submit:
          err?.response?.data?.message ||
          err?.message ||
          "Đặt chỗ thất bại. Vui lòng thử lại sau.",
      });
    } finally {
      // Chỉ tắt loading nếu có lỗi, còn nếu chuyển hướng thì giữ loading để UX tốt hơn
      // setSubmitting(false);
      // Tuy nhiên React sẽ unmount component khi chuyển trang nên k sao.
      // Để an toàn ta check:
      setTimeout(() => setSubmitting(false), 2000);
    }
  };

  // Hàm phụ chuyển trang thành công
  const redirectToSuccess = (code: string, email: string, method: string) => {
    const sp = new URLSearchParams();
    sp.append("bookingId", code);
    sp.append("email", email);
    sp.append("paymentMethod", method);
    router.replace(`/user/checkout/success?${sp.toString()}`);
  };

  /* ---------- Loading / Error tour ---------- */
  if (!id)
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10">Thiếu mã tour.</div>
    );
  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="mt-4 text-slate-600">Đang tải thông tin tour…</p>
        </div>
      </div>
    );
  if (isError || !tour)
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        Không tìm thấy tour.
      </div>
    );

  /* ===========================================================
   * RENDER UI
   * ===========================================================
   */
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-50 to-white p-5"
      >
        <nav className="text-sm text-slate-600">
          <Crumb href="/">Trang chủ</Crumb> /{" "}
          <Crumb href="/user">Tài khoản</Crumb> /{" "}
          <span className="font-medium text-slate-900">Đặt tour</span>
        </nav>
        <h1 className="mt-2 text-[26px] font-extrabold tracking-tight text-slate-900">
          Tổng quan chuyến đi
        </h1>
        <p className="text-slate-600">
          {tour.title} • {tour.destination ?? "Điểm đến"} —{" "}
          {dmy(tour.startDate)} → {dmy(tour.endDate)}
        </p>
      </motion.section>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12"
      >
        <div className="space-y-8 lg:col-span-7">
          <Card>
            <h2 className="section-title mb-4">Thông tin liên lạc</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Họ và tên *" error={errors.fullName}>
                <Input
                  name="fullName"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isReadOnly}
                  required
                  icon={<User size={18} />}
                  aria-invalid={!!errors.fullName}
                />
              </Field>
              <Field label="Email *" error={errors.email}>
                <Input
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isReadOnly}
                  required
                  icon={<Mail size={18} />}
                  aria-invalid={!!errors.email}
                />
              </Field>
              <Field label="Số điện thoại *" error={errors.phone}>
                <Input
                  name="phone"
                  placeholder="0912 345 678"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isReadOnly}
                  required
                  icon={<Phone size={18} />}
                  aria-invalid={!!errors.phone}
                />
              </Field>
              <Field label="Địa chỉ" error={errors.address}>
                <Input
                  name="address"
                  placeholder="Địa chỉ..."
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  icon={<MapPin size={18} />}
                  aria-invalid={!!errors.address}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="section-title mb-4">Số lượng hành khách</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <QuantitySelector
                label="Người lớn"
                value={adults}
                onChange={setAdults}
                min={1}
              />
              <QuantitySelector
                label="Trẻ em"
                value={children}
                onChange={setChildren}
                min={0}
              />
            </div>
          </Card>

          <Card>
            <h2 className="section-title mb-3">Điều khoản & bảo mật</h2>
            <p className="text-[15px] leading-relaxed text-slate-700">
              Bằng cách nhấn <b>“Xác nhận đặt chỗ”</b>, bạn chấp thuận điều
              khoản sử dụng dịch vụ.
            </p>
            <label className="mt-3 inline-flex select-none items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                defaultChecked
                required
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Tôi đã đọc và đồng ý với{" "}
              <a className="link" href="#">
                Điều khoản thanh toán
              </a>
            </label>
          </Card>

          <Card>
            <h2 className="section-title mb-4">Phương thức thanh toán</h2>
            <PaymentMethods
              value={paymentMethod}
              onChange={setPaymentMethod}
              typeValue={paymentType}
              onTypeChange={setPaymentType}
            />
          </Card>
        </div>

        <div className="lg:col-span-5 self-start sticky top-6 space-y-8">
          <Card className="p-5">
            <div className="flex gap-4">
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                  src={coverImg}
                  alt={tour.title ?? "tour"}
                  fill
                  className="object-cover rounded-lg"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).src = "/hot1.jpg")
                  }
                />
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-slate-800 leading-snug">
                  {tour.title}
                </h4>
                <p className="text-sm text-slate-600 mt-1.5">
                  Thời gian: <b>{tour.time ?? "—"}</b>
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Khởi hành: <b>{dmy(tour.startDate)}</b>
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Tóm tắt đơn hàng
              </h3>
            </div>
            <div className="p-5">
              <div className="mb-4 border-b pb-4 text-[15px]">
                <Row label="Người lớn">
                  <span className="tabular-nums">
                    {adults.toLocaleString("vi-VN")} × {vnd(priceAdult)}
                  </span>
                </Row>
                {children > 0 && (
                  <Row label="Trẻ em">
                    <span className="tabular-nums">
                      {children.toLocaleString("vi-VN")} × {vnd(priceChild)}
                    </span>
                  </Row>
                )}
                <Row label={<b>Tổng cộng</b>} strong>
                  <b className="tabular-nums text-lg">{vnd(totalDisplay)}</b>
                </Row>
              </div>

              <AnimatePresence>
                {errors.submit && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{errors.submit}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Button
                  type="submit"
                  full
                  className="py-3 text-base"
                  disabled={submitting}
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận đặt chỗ"}
                </Button>
                <Link
                  href={`/user/destination/${(
                    tour.destinationSlug ??
                    (tour.title || "")
                  )
                    .toString()
                    .toLowerCase()
                    .replace(/\s+/g, "-")}/${tour._id ?? id}`}
                  className="block text-center text-sm text-slate-600 underline hover:text-slate-800"
                >
                  Xem chi tiết tour
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </main>
  );
}

/* ================== COMPONENTS ================== */
function Crumb(props: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className="rounded px-1 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    />
  );
}
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </motion.section>
  );
}
function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-slate-600">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-1 text-xs font-medium text-rose-600 overflow-hidden"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </label>
  );
}
function Row({
  label,
  children,
  strong,
  className = "",
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${className}`}>
      <span
        className={`text-slate-600 ${
          strong ? "font-semibold text-slate-900" : ""
        }`}
      >
        {label}
      </span>
      <span className={`text-slate-800 ${strong ? "font-semibold" : ""}`}>
        {children}
      </span>
    </div>
  );
}
function Button({
  variant = "primary",
  full,
  className = "",
  children,
  ...rest
}: any) {
  const base =
    "relative inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition outline-none focus-visible:ring-2 disabled:opacity-60";
  const styles: any = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    soft: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      className={`${base} ${styles[variant]} ${
        full ? "w-full" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
function Input({ icon, className = "", ...props }: any) {
  const hasError = props["aria-invalid"];
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-slate-400">{icon}</span>
        </div>
      )}
      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-[15px] text-slate-800 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 disabled:opacity-75 ${
          icon ? "pl-10" : ""
        } ${
          hasError
            ? "border-rose-400 ring-1 ring-rose-400"
            : "border-slate-200 focus-visible:ring-emerald-400"
        } ${className}`}
      />
    </div>
  );
}
function QuantitySelector({ label, value, onChange, min, max = 99 }: any) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <StepButton
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        />
        <span className="w-10 text-center text-lg font-bold tabular-nums">
          {value}
        </span>
        <StepButton
          plus
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        />
      </div>
    </Field>
  );
}
function StepButton({ plus, disabled, onClick }: any) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`h-10 w-10 rounded-xl border text-slate-700 transition ${
        plus
          ? "border-emerald-300 hover:bg-emerald-50"
          : "border-slate-200 hover:bg-slate-50"
      } disabled:opacity-40`}
    >
      {plus ? "+" : "−"}
    </button>
  );
}

// COMPONENT PAYMENT
function PaymentMethods({ value, onChange, typeValue, onTypeChange }: any) {
  const isOnline = typeValue === "full";
  const handleOnline = (m: string) => {
    onChange(m);
    onTypeChange("full");
  };
  const handleOffice = () => {
    onChange("office-payment");
    onTypeChange("office");
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition md:col-span-2 ${
          typeValue === "office"
            ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500"
            : "border-slate-200 bg-white hover:border-emerald-300"
        }`}
        onClick={handleOffice}
      >
        <img
          src="/pay.png"
          alt=""
          className="h-7 w-7 flex-shrink-0 mt-0.5 rounded object-cover"
        />
        <input
          type="radio"
          name="pt"
          checked={typeValue === "office"}
          readOnly
          className="mt-1.5 h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <div>
          <p className="font-medium text-slate-800">
            Thanh toán tại văn phòng (Giữ chỗ)
          </p>
          <p className="text-xs text-slate-500">
            Giữ chỗ trước, thanh toán sau.
          </p>
        </div>
      </label>

      <div className="md:col-span-2 mt-2">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">
          Hoặc chọn Thanh toán Online (100%):
        </h4>
      </div>

      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
          value === "vnpay-payment" && isOnline
            ? "border-blue-500 bg-blue-50/70 ring-1 ring-blue-500"
            : "border-slate-200 bg-white hover:border-blue-300"
        }`}
        onClick={() => handleOnline("vnpay-payment")}
      >
        <img src="/images.png" alt="VNPay" className="h-7 w-7 object-contain" />
        <input
          type="radio"
          name="pm"
          checked={value === "vnpay-payment" && isOnline}
          readOnly
          className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <p className="font-medium text-slate-800">VNPay (100%)</p>
          <p className="text-xs text-slate-500">
            Thẻ ATM, thẻ quốc tế, ví VNPay.
          </p>
        </div>
      </label>

      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
          value === "sepay-payment" && isOnline
            ? "border-purple-500 bg-purple-50/70 ring-1 ring-purple-500"
            : "border-slate-200 bg-white hover:border-purple-300"
        }`}
        onClick={() => handleOnline("sepay-payment")}
      >
        <img src="/sepay.png" alt="Sepay" className="h-7 w-7 object-contain" />
        <input
          type="radio"
          name="pm"
          checked={value === "sepay-payment" && isOnline}
          readOnly
          className="h-4 w-4 border-slate-300 text-purple-600 focus:ring-purple-500"
        />
        <div>
          <p className="font-medium text-slate-800">Sepay (100%)</p>
          <p className="text-xs text-slate-500">
            Chuyển khoản QR Code tự động.
          </p>
        </div>
      </label>
    </div>
  );
}
