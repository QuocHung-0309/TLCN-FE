'use client';

import React, { useEffect, useState } from "react";

export default function MapBanner() {
  const [firstName, setFirstName] = useState("Bạn");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.fullName) {
        const nameParts = user.fullName.trim().split(" ");
        setFirstName(nameParts[0] || "Bạn");
      }
    }
  }, []);
  return (
    <section className="relative w-full py-10">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center px-4">
        <p className="text-xs sm:text-sm tracking-widest mb-2">
          HÀNH TRÌNH CỦA BẠN
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-snug">
          KHÁM PHÁ HÀNH TRÌNH CỦA BẠN <br className="hidden sm:block" /> TẠI
          SÀI GÒN
        </h1>
        <button className="btn-primary px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
          Bắt đầu khám phá
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 sm:mt-16">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Sơ Đồ Hành Trình Của {firstName}
          </h2>
          <button className="btn-outline-primary px-4 py-2 rounded-full text-xs sm:text-sm">
            23/126 xã, phường
          </button>
        </div>
      </div>
    </section>
  );
}
