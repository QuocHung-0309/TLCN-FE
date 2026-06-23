"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    image: "/banner.jpg",
    label: "Miền Tây sông nước",
    title: "Khám phá vùng đất",
    titleAccent: "Miền Tây huyền thoại",
    desc: "Tiền Giang, Mỹ Tho, Bến Tre, Cần Thơ trong một hành trình không thể quên.",
    href: "/user/destination?destination=mien-tay",
  },
  {
    image: "/banner3.jpg",
    label: "Trọn gói tiết kiệm",
    title: "Tour du lịch",
    titleAccent: "theo cách của bạn",
    desc: "Hành trình được thiết kế riêng, giá tốt nhất, trải nghiệm đáng nhớ nhất.",
    href: "/user/destination",
  },
  {
    image: "/banner4.jpg",
    label: "Đặt tour dễ dàng",
    title: "Đi ngay hôm nay,",
    titleAccent: "lo gì ngày mai",
    desc: "Đặt tour nhanh chóng, thanh toán tiện lợi, hỗ trợ 24/7 trên mọi hành trình.",
    href: "/user/destination",
  },
];

const HomeBanner = () => {
  return (
    <>
      <style jsx global>{`
        @keyframes hb-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hb-up { animation: hb-up 0.65s cubic-bezier(.22,1,.36,1) both; }

        .swiper-pagination-bullets { bottom: 32px !important; }
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.45) !important;
          opacity: 1 !important;
          transition: all 0.3s !important;
        }
        .swiper-pagination-bullet-active {
          background: #fff !important;
          width: 28px !important;
          border-radius: 99px !important;
        }
      `}</style>

      <section className="relative w-full min-h-[88vh] rounded-3xl overflow-hidden shadow-2xl">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          effect="fade"
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop
          className="w-full min-h-[88vh]"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i} className="min-h-[88vh]">
              <div
                className="w-full min-h-[88vh] bg-cover bg-center relative flex flex-col justify-end pb-28 sm:pb-32"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />

                {/* Content — left-aligned, max 4 elements */}
                <div className="relative z-10 px-6 sm:px-12 lg:px-16 max-w-2xl">

                  {/* 1. Label chip (nhỏ, không phải eyebrow to) */}
                  <div
                    className="hb-up mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70"
                    style={{ animationDelay: "0.05s" }}
                  >
                    {slide.label}
                  </div>

                  {/* 2. Headline */}
                  <h1
                    className="hb-up text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-white leading-[1.08] tracking-tight drop-shadow-sm"
                    style={{ animationDelay: "0.15s" }}
                  >
                    {slide.title}
                    <br />
                    <span className="text-amber-400">{slide.titleAccent}</span>
                  </h1>

                  {/* 3. Subtext */}
                  <p
                    className="hb-up mt-4 text-[15px] text-white/80 leading-relaxed max-w-md"
                    style={{ animationDelay: "0.25s" }}
                  >
                    {slide.desc}
                  </p>

                  {/* 4. CTA */}
                  <a
                    className="hb-up mt-7 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 group"
                    href={slide.href}
                    style={{ animationDelay: "0.35s" }}
                  >
                    Khám phá ngay
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
};

export default HomeBanner;
