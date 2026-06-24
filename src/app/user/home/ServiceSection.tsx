'use client';

import React from 'react';
import Image from 'next/image';

const services = [
  {
    title: 'Dự báo thời tiết',
    description: 'Cập nhật thông tin thời tiết điểm đến giúp bạn chuẩn bị hành lý phù hợp.',
    icon: '/weather.svg',
    iconBg: 'bg-sky-100',
  },
  {
    title: 'Hướng dẫn viên chuyên nghiệp',
    description: 'Đội ngũ hướng dẫn viên giàu kinh nghiệm, am hiểu văn hóa địa phương.',
    icon: '/guide.svg',
    iconBg: 'bg-orange-100',
  },
  {
    title: 'Cộng đồng du lịch',
    description: 'Kết nối với cộng đồng du lịch, chia sẻ kinh nghiệm và hình ảnh đẹp.',
    icon: '/social.svg',
    iconBg: 'bg-emerald-100',
  },
];

const stats = [
  { value: '43+', label: 'Tour du lịch' },
  { value: '10K+', label: 'Du khách hài lòng' },
  { value: '4.9★', label: 'Điểm đánh giá' },
];

const ServiceSection = () => {
  return (
    <section className="py-10 sm:py-16 lg:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 lg:items-center">

          {/* Left — headline + stats */}
          <div className="lg:w-[38%] flex-shrink-0">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-orange-500 mb-2">
              Tại sao chọn Travela
            </span>

            <h2 className="mt-2 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--brand-navy)] leading-tight">
              Đồng hành cùng
              <br />
              <span className="text-orange-500">mọi hành trình</span>
            </h2>

            <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-sm hidden sm:block">
              Chúng tôi không chỉ bán tour. Chúng tôi xây dựng những kỷ niệm đáng nhớ cùng bạn từ khi lên kế hoạch đến khi trở về.
            </p>

            {/* Stats — 3 cột trên mọi màn */}
            <div className="mt-5 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-3 sm:p-0 sm:bg-transparent sm:rounded-none sm:border-none sm:shadow-none text-center sm:text-left">
                  <div className="text-xl sm:text-3xl font-black text-[var(--brand-navy)] tabular-nums">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[11px] sm:text-xs text-slate-500 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — service cards */}
          <div className="flex-1 flex flex-col gap-3 sm:gap-4">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-4 rounded-2xl bg-white border border-slate-100 px-4 sm:px-5 py-4 sm:py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-10 h-10 sm:w-11 sm:h-11 ${service.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Image src={service.icon} alt={service.title} width={20} height={20} />
                </div>
                <div>
                  <h3 className="text-[14px] sm:text-[15px] font-semibold text-slate-800 mb-0.5">{service.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
