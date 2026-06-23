'use client';

import React from 'react';
import Image from 'next/image';

const services = [
  {
    title: 'Dự báo thời tiết',
    description: 'Cập nhật thông tin thời tiết điểm đến giúp bạn chuẩn bị hành lý phù hợp.',
    icon: '/weather.svg',
    iconBg: 'bg-sky-100',
    dot: 'bg-sky-400',
  },
  {
    title: 'Hướng dẫn viên chuyên nghiệp',
    description: 'Đội ngũ hướng dẫn viên giàu kinh nghiệm, am hiểu văn hóa địa phương.',
    icon: '/guide.svg',
    iconBg: 'bg-orange-100',
    dot: 'bg-orange-400',
  },
  {
    title: 'Cộng đồng du lịch',
    description: 'Kết nối với cộng đồng du lịch, chia sẻ kinh nghiệm và hình ảnh đẹp.',
    icon: '/social.svg',
    iconBg: 'bg-emerald-100',
    dot: 'bg-emerald-400',
  },
];

const stats = [
  { value: '43+', label: 'Tour du lịch' },
  { value: '10K+', label: 'Du khách hài lòng' },
  { value: '4.9', label: 'Điểm đánh giá' },
];

const ServiceSection = () => {
  return (
    <section className="py-16 sm:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 lg:items-center">

          {/* Left — headline + stats */}
          <div className="lg:w-[38%] flex-shrink-0">
            <span className="inline-block text-[12px] font-semibold uppercase tracking-widest text-orange-500 mb-1">
              Tại sao chọn Travela
            </span>

            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--brand-navy)] leading-tight">
              Đồng hành cùng
              <br />
              <span className="text-orange-500">mọi hành trình</span>
            </h2>

            <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-sm">
              Chúng tôi không chỉ bán tour. Chúng tôi xây dựng những kỷ niệm đáng nhớ cùng bạn từ khi lên kế hoạch đến khi trở về.
            </p>

            {/* Stats row */}
            <div className="mt-8 flex gap-6">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="text-2xl sm:text-3xl font-black text-[var(--brand-navy)] tabular-nums">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — service cards */}
          <div className="flex-1 flex flex-col gap-4">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="group flex items-start gap-4 rounded-2xl bg-white border border-slate-100 px-5 py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-11 h-11 ${service.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Image src={service.icon} alt={service.title} width={22} height={22} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-800 mb-1">{service.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
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
