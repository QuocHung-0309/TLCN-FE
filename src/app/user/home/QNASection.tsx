'use client';

import QnaCard from '@/components/cards/QnaCard';
import Button from '@/components/ui/Button';
import { BsChatDots } from 'react-icons/bs';

const qnaData = [
  {
    id: 1,
    title: '“Xin kinh nghiệm Xuyên Việt 30 ngày”',
    description:
      'Mình dự kiến giữa tháng 04 này làm chuyến xuyên Việt: gửi xe từ TP.HCM ra Hà Nội rồi đi cung Đông Bắc – Tây Bắc, vòng về chạy xe vào lại HCM.',
    author: 'Nguyễn Văn A',
    source: 'Google',
    image: '/city-2.svg',
  },
  {
    id: 2,
    title: '“Xin kinh nghiệm Xuyên Việt 30 ngày”',
    description:
      'Mình dự kiến giữa tháng 04 này làm chuyến xuyên Việt: gửi xe từ TP.HCM ra Hà Nội rồi đi cung Đông Bắc – Tây Bắc, vòng về chạy xe vào lại HCM.',
    author: 'Nguyễn Văn A',
    source: 'Google',
    image: '/city-2.svg',
  },
  {
    id: 3,
    title: '“Xin kinh nghiệm Xuyên Việt 30 ngày”',
    description:
      'Mình dự kiến giữa tháng 04 này làm chuyến xuyên Việt: gửi xe từ TP.HCM ra Hà Nội rồi đi cung Đông Bắc – Tây Bắc, vòng về chạy xe vào lại HCM.',
    author: 'Nguyễn Văn A',
    source: 'Google',
    image: '/city-2.svg',
  },
  {
    id: 4,
    title: '“Xin kinh nghiệm Xuyên Việt 30 ngày”',
    description:
      'Mình dự kiến giữa tháng 04 này làm chuyến xuyên Việt: gửi xe từ TP.HCM ra Hà Nội rồi đi cung Đông Bắc – Tây Bắc, vòng về chạy xe vào lại HCM.',
    author: 'Nguyễn Văn A',
    source: 'Google',
    image: '/city-2.svg',
  },
  // … thêm các item khác
];

export default function QNASection() {
  return (
    <section className="w-full py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[12px] font-semibold text-sky-700 ring-1 ring-sky-200">
              <BsChatDots /> Cộng đồng hỏi đáp
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Q/A – Hỏi đáp du lịch
            </h2>
            <p className="text-sm text-slate-600">Những câu hỏi được quan tâm gần đây</p>
          </div>

          <Button className="rounded-full px-5 py-2 text-sm font-semibold">
            Xem tất cả
          </Button>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {qnaData.map((item) => (
            <QnaCard
              key={item.id}
              title={item.title}
              description={item.description}
              author={item.author}
              sourceText={item.source}
              imageUrl={item.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
