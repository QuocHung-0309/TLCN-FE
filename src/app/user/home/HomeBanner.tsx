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
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hb-up { animation: hb-up 0.6s cubic-bezier(.22,1,.36,1) both; }
        .swiper-pagination-bullets { bottom: 14px !important; }
        @media (min-width: 640px) {
          .swiper-pagination-bullets { bottom: 32px !important; }
        }
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.45) !important;
          opacity: 1 !important;
          transition: all 0.3s !important;
        }
        .swiper-pagination-bullet-active {
          background: #fff !important;
          width: 22px !important;
          border-radius: 99px !important;
        }
      `}</style>

      <section className="relative w-full min-h-[62vh] sm:min-h-[88vh] sm:rounded-3xl overflow-hidden sm:shadow-2xl">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          effect="fade"
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop
          className="w-full min-h-[62vh] sm:min-h-[88vh]"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i} className="min-h-[62vh] sm:min-h-[88vh]">
              <div
                className="w-full min-h-[62vh] sm:min-h-[88vh] bg-cover bg-center relative flex flex-col justify-end pb-10 sm:pb-28 lg:pb-32"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/5" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                <div className="relative z-10 px-5 sm:px-12 lg:px-16 max-w-2xl">
                  <div
                    className="hb-up mb-2 sm:mb-5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70"
                    style={{ animationDelay: "0.05s" }}
                  >
                    {slide.label}
                  </div>

                  <h1
                    className="hb-up text-[1.75rem] sm:text-5xl lg:text-[3.75rem] font-black text-white leading-[1.1] tracking-tight"
                    style={{ animationDelay: "0.15s" }}
                  >
                    {slide.title}
                    <br />
                    <span className="text-amber-400">{slide.titleAccent}</span>
                  </h1>

                  <p
                    className="hb-up mt-2 sm:mt-4 text-[13px] sm:text-[15px] text-white/80 leading-relaxed max-w-sm hidden sm:block"
                    style={{ animationDelay: "0.25s" }}
                  >
                    {slide.desc}
                  </p>

                  <a
                    className="hb-up mt-4 sm:mt-7 inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg active:scale-95 transition-all duration-200 group"
                    href={slide.href}
                    style={{ animationDelay: "0.3s" }}
                  >
                    Khám phá ngay
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
