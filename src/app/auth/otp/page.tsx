"use client";

import React, { useState, Suspense, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import { FiChevronLeft, FiRefreshCw, FiMail } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/auth/authApi";
import { toast } from "react-hot-toast";

function RegisterOtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Decode email từ URL (vì đã được encodeURIComponent khi redirect)
  const emailParam = searchParams.get("email") || "";
  const email = decodeURIComponent(emailParam);

  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Focus ô đầu tiên khi mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Đếm ngược cho nút gửi lại mã
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const otp = otpArray.join("");

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    if (!email) {
      setError("Không tìm thấy email. Vui lòng đăng ký lại.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Verifying OTP for email:", email); // Debug
      const res = await authApi.verifyOTP(email, otp);

      console.log("Kết quả API:", res);

      // Kiểm tra các message thành công có thể từ Backend
      const successMessages = [
        "OTP verified successfully",
        "Kích hoạt tài khoản thành công",
        "Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.",
      ];

      const isSuccess = successMessages.some(msg =>
        res.message?.toLowerCase().includes(msg.toLowerCase())
      );

      if (isSuccess) {
        toast.success("Xác thực OTP thành công! Chuyển sang trang đăng nhập...");
        setTimeout(() => router.push("/auth/login?message=Xác thực thành công! Vui lòng đăng nhập."), 1500);
      } else {
        toast.error(res.message || "Mã OTP không đúng hoặc đã hết hạn");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      const errorMsg = error.response?.data?.message || "Xác thực OTP thất bại";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Chỉ cho phép nhập số
    if (value && isNaN(Number(value))) return;

    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);

    // Tự động nhảy sang ô tiếp theo nếu có nhập
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      // Khi nhấn backspace ở ô trống, lùi về ô trước
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    
    if (pasteData.length > 0) {
      const newOtp = [...otpArray];
      pasteData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpArray(newOtp);
      
      const focusIndex = Math.min(pasteData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };


  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      await authApi.sendEmailOTP(email, "register");
      toast.success("Đã gửi lại OTP mới!");
      setCountdown(60); // Bắt đầu đếm ngược 60 giây
    } catch (error) {
      console.error(error);
      toast.error("Gửi lại OTP thất bại");
    }
  };

  return (
<<<<<<< HEAD
    <main className="flex flex-col h-full w-full max-w-md mx-auto justify-center pb-8 pt-8">
      <div className="flex flex-col items-center relative overflow-hidden w-full">
=======
    <>
    <main>
      <a
        href="/auth/register"
        className="text-sm text-gray-500 hover:underline inline-flex items-center mb-4"
      >
        <ChevronLeft className="mr-2 text-base" />
        Quay lại trang đăng ký
      </a>
>>>>>>> upstream/feature/chatbot-memory

        <div className="w-full flex justify-start mb-6">
          <a
            href="/auth/register"
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center group relative z-10"
          >
            <span className="p-1.5 rounded-full bg-slate-100 group-hover:bg-blue-50 mr-2 transition-colors">
              <FiChevronLeft className="text-base" />
            </span>
            Quay lại đăng ký
          </a>
        </div>

        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-inner">
          <FiMail className="text-2xl" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2 text-center relative z-10">
          Xác Thực Email
        </h2>
        <p className="text-sm text-slate-600 mb-8 text-center px-4 relative z-10 leading-relaxed">
          Chúng tôi đã gửi một mã xác thực gồm 6 chữ số đến<br />
          <strong className="text-slate-800 font-semibold">{email}</strong>
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm mb-6 p-3 rounded-xl border border-red-100 flex items-center relative z-10">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="w-full space-y-6 relative z-10">
          <div 
            className="flex justify-between items-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {otpArray.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200
                  ${digit ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 bg-slate-50/50 text-slate-700 focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]'}
                `}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-bold tracking-wide shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 rounded-xl" 
            disabled={loading || otp.length < 6}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang xác thực...
              </span>
            ) : (
              "XÁC THỰC NGAY"
            )}
          </Button>

          <div className="flex items-center justify-center pt-2">
            <span className="text-sm text-slate-500 mr-2">Chưa nhận được mã?</span>
            <button
              type="button"
              className={`text-sm font-semibold flex items-center transition-colors ${countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
              onClick={handleResendOtp}
              disabled={countdown > 0}
            >
              {countdown > 0 ? (
                `Gửi lại sau ${countdown}s`
              ) : (
                <>
                  <FiRefreshCw className="mr-1" /> Gửi lại mã
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function RegisterOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterOtpPageContent />
    </Suspense>
  );
}
