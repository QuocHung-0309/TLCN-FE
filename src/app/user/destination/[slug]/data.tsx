export type Tour = {
  slug: string;
  title: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  ratingCount: number;
  cover: string;
  gallery: string[];
  shortDesc: string;
  highlights: string[];
  itinerary: Array<{ day: string; content: string }>;
  included: string[];
  excluded: string[];
  policies: string[];
  location: { name: string; lat: number; lng: number };
  related: Array<{ title: string; image: string; href: string; price: string }>;
};

export function getTour(slug: string): Tour {
  return {
    slug,
    title: 'TOUR NỬA NGÀY ĐỊA ĐẠO CỦ CHI',
    duration: 'NỬA NGÀY',
    price: 350000,
    currency: 'VND',
    rating: 4.8,
    ratingCount: 126,
    cover: '/tours/cu-chi.jpg',
    gallery: [
      '/tours/cu-chi.jpg',
      '/tours/cu-chi-2.jpg',
      '/tours/cu-chi-3.jpg',
      '/tours/cu-chi-4.jpg',
      '/tours/cu-chi-5.jpg',
    ],
    shortDesc:
      'Khám phá hệ thống đường hầm lịch sử Củ Chi, trải nghiệm độc đáo dưới lòng đất.',
    highlights: [
      'Tham quan địa đạo & hầm bí mật',
      'Chui hầm (tuỳ chọn)',
      'Bắn súng thao trường (tuỳ phí)',
      'Khoai mì & trà nóng',
      'Xe đưa đón, hướng dẫn viên',
    ],
    itinerary: [
      { day: '08:00', content: 'Đón khách tại trung tâm TP.HCM, khởi hành đi Củ Chi.' },
      { day: '09:45', content: 'Xem phim tư liệu, tham quan địa đạo.' },
      { day: '10:30', content: 'Chui hầm, bếp Hoàng Cầm, hầm hội họp.' },
      { day: '11:15', content: 'Thưởng thức khoai mì, trà nóng.' },
      { day: '12:00', content: 'Về lại TP.HCM, kết thúc chương trình.' },
    ],
    included: [
      'Xe đưa đón theo chương trình',
      'Vé tham quan địa đạo Củ Chi',
      'Hướng dẫn viên',
      'Nước suối (01 chai/người)',
    ],
    excluded: ['Chi phí bắn súng', 'Ăn trưa', 'Chi tiêu cá nhân', 'VAT nếu xuất hoá đơn'],
    policies: ['Huỷ trước 3 ngày: hoàn 100%', 'Trước 24h: hoàn 50%', 'Trong ngày: không hoàn'],
    location: { name: 'Khu di tích Địa đạo Củ Chi', lat: 11.1467, lng: 106.4951 },
    related: [
      { title: 'MỸ THO - BẾN TRE 1N', image: '/tours/mekong-1d.jpg', href: '/tour/mekong-1d', price: '480.000đ' },
      { title: 'MỸ THO - CẦN THƠ 2N1Đ', image: '/tours/mekong-2n1d.jpg', href: '/tour/mekong-2n1d', price: '1.550.000đ' },
      { title: 'VŨNG TÀU 1 NGÀY', image: '/tours/vung-tau.jpg', href: '/tour/vung-tau-1d', price: '1.050.000đ' },
      { title: 'NÚI BÀ ĐEN 1 NGÀY', image: '/tours/baden-1d.jpg', href: '/tour/baden-1d', price: '1.150.000đ' },
    ],
  };
}
