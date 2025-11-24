"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FiEye, FiEyeOff, FiChevronLeft  } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      // TODO: gọi API gửi OTP về email
      console.log("Send OTP to:", email);
      setStep(2);
    } else if (step === 2) {
      // TODO: gọi API verify OTP
      console.log("Verify code:", code);
      setStep(3);
    } else if (step === 3) {
      // TODO: gọi API đổi mật khẩu
      console.log("Reset password:", { password, confirmPassword });
    }
  };

    // gộp 3 bước đổi mật khẩu vào 1 trang (multi-step)
  return (
    <> 
      <a
        href="/auth/login"
        className="text-sm text-gray-500 hover:underline inline-flex items-center mb-4"
      >
        <FiChevronLeft className="mr-2 text-base" />
        Quay lại trang đăng nhập
      </a>

    {/* nhập email để lấy lại mật khẩu */}
      {step === 1 && (
        <>
          <h2 className="heading-2 font-bold text-[var(--primary)] mb-1">
            QUÊN MẬT KHẨU
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Đừng lo lắng, điều này xảy ra với tất cả chúng ta. Nhập email của bạn
            bên dưới để lấy lại mật khẩu.
          </p>
        </>
      )}
          
    {/* nhập mã OTP để xác thực */}
      {step === 2 && (
        <>
          <h2 className="heading-2 font-bold text-[var(--primary)] mb-1">
            MÃ XÁC THỰC
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Mã xác thực đã được gửi tới email của bạn.
          </p>
        </>
      )}
      {step === 3 && (
        <>
          <h2 className="heading-2 font-bold text-[var(--primary)] mb-1">
            ĐỔI MẬT KHẨU
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Vui lòng đặt mật khẩu mới cho tài khoản của bạn.
          </p>
        </>
      )}

      <form onSubmit={handleNextStep} className="space-y-5 pt-5">
        {step === 1 && (
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        {step === 2 && (
          <>
            <Input
              type="text"
              label="Mã xác thực"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button
              type="button"
              className="text-sm text-[var(--primary)] hover:underline -mt-2"
              onClick={() => console.log("Gửi lại mã")}
            >
              Gửi lại mã!
            </button>
          </>
        )}

    {/* Nhập mật khẩu mới và xác nhận lại mật khẩu mới */}
        {step === 3 && (
          <>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Xác thực mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </>
        )}

        <Button type="submit" variant="primary" className="w-full mt-2">
          {step === 1 && "LẤY LẠI MẬT KHẨU"}
          {step === 2 && "XÁC THỰC"}
          {step === 3 && "ĐỔI MẬT KHẨU"}
        </Button>
      </form>
    </>
  );
}
