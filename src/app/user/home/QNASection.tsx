"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { BsChatDots } from "react-icons/bs";
import {
  Clock,
  MapPin,
  ShieldCheck,
  Phone,
  Wallet,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const faqsLeft = [
  {
    id: 1,
    question: "Có khởi hành hằng ngày không?",
    answer:
      "Đa số các tour của chúng tôi đều có lịch khởi hành hằng ngày. Tuy nhiên đối với các tour đặc thù hoặc tour nước ngoài, lịch khởi hành sẽ được hiển thị chi tiết trong từng trang tour cụ thể.",
    icon: Clock,
  },
  {
    id: 2,
    question: "Đón khách ở đâu?",
    answer:
      "Chúng tôi hỗ trợ đưa đón khách tại trung tâm thành phố và các điểm hẹn cố định. Xe và hướng dẫn viên sẽ liên hệ trực tiếp để thống nhất điểm đón thuận tiện nhất cho bạn.",
    icon: MapPin,
  },
  {
    id: 3,
    question: "Chính sách hủy/đổi thế nào?",
    answer:
      "Chính sách hủy đổi sẽ tùy thuộc vào từng loại tour và thời điểm thông báo. Thông thường, bạn có thể được hoàn phí hoặc đổi ngày nếu báo trước một khoảng thời gian nhất định theo quy định.",
    icon: ShieldCheck,
  },
];

const faqsRight = [
  {
    id: 4,
    question: "Tư vấn & đặt tour như thế nào?",
    answer:
      "Bạn có thể đặt tour trực tiếp trên website hoặc gọi điện cho hotline để được nhân viên hỗ trợ tư vấn chi tiết lịch trình, dịch vụ và các khuyến mãi hiện có.",
    icon: Phone,
  },
  {
    id: 5,
    question: "Thanh toán & hoá đơn?",
    answer:
      "Hỗ trợ thanh toán tại văn phòng, chuyển khoản công ty, thẻ quốc tế. Có xuất hóa đơn VAT theo yêu cầu.",
    icon: Wallet,
  },
  {
    id: 6,
    question: "Hỗ trợ khi đang đi tour?",
    answer:
      "Trong suốt chuyến đi, hướng dẫn viên và tổng đài viên trực 24/7 của chúng tôi sẽ luôn đồng hành và hỗ trợ giải quyết bất kỳ vấn đề phát sinh nào của khách hàng.",
    icon: HelpCircle,
  },
];

function FaqItem({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 bg-white ${
        isOpen ? "border-sky-300 shadow-sm" : "border-gray-200 hover:border-sky-200"
      }`}
    >
      <button
        className="w-full flex items-center justify-between p-4 sm:p-5 outline-none rounded-2xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-100 text-sky-600 shrink-0">
            <Icon size={22} />
          </div>
          <span className="font-semibold text-gray-800 text-left text-sm sm:text-base">
            {item.question}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-sky-500 shrink-0 ml-2" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 shrink-0 ml-2" />
        )}
      </button>

      {/* Expanded content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
          <div className="bg-slate-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QNASection() {
  return (
    <section className="w-full py-14 sm:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="mb-8 flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[12px] font-semibold text-sky-700 ring-1 ring-sky-200">
            <BsChatDots /> Câu hỏi thường gặp
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Hỏi đáp & Hỗ trợ
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Giải đáp nhanh chóng những thắc mắc phổ biến nhất của khách hàng về dịch vụ và trải nghiệm tour du lịch.
          </p>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-10">
          <div className="flex flex-col gap-4 sm:gap-6">
            {faqsLeft.map((item) => (
              <FaqItem key={item.id} item={item} />
            ))}
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            {faqsRight.map((item) => (
              <FaqItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
