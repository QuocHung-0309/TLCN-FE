// app/assets/data/destinations.ts
export type Destination = {
  id: number;
  slug: string;
  name: string;
  location: string;
  subtitle?: string;
  image?: string;
  cover?: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  // các field cho DestinationCard (nếu bạn dùng)
  avgRating?: number;
  serviceCount?: number;
  status?: string;
  category?: string;
  distance?: string;

  // các field cho trang chi tiết
  price?: number;
  priceBefore?: number;   // giá gốc
  duration?: string;
  departTime?: string;
  startPoint?: string;
  code?: string;
  overview?: string;
  itinerary?: string; // text (đơn giản)
  info?: string;
  terms?: string;
};

export const destinations: Destination[] = [
  {
    id: 1,
    slug: "tour-dia-dao-cu-chi-nua-ngay",
    name: "TOUR NỬA NGÀY ĐỊA ĐẠO CỦ CHI",
    location: "Củ Chi, TP.HCM",
    subtitle: "Khám phá hệ thống địa đạo lịch sử",
    image: "/tours/cu-chi.jpg",
    images: ["/tours/cu-chi.jpg", "/tours/cu-chi-2.jpg", "/tours/cu-chi-3.jpg"],
    rating: 4.8,
    reviewCount: 126,
    avgRating: 4.8,
    serviceCount: 8,
    status: "Rất tốt",
    category: "City tour",
    distance: "± 70km",
    price: 350000,
    priceBefore: 420000,
    duration: "Nửa ngày",
    departTime: "08:00",
    startPoint: "Trung tâm Q.1",
    code: "CC-AM",
    overview:
      "Trải nghiệm địa đạo Củ Chi – biểu tượng ý chí kiên cường của người Việt, thử chui hầm, bếp Hoàng Cầm và xem phim tư liệu.",
    itinerary:
      "• 08:00 Đón khách tại trung tâm TP.HCM.\n• 09:45 Xem phim tư liệu, tham quan địa đạo.\n• 10:30 Chui hầm, bếp Hoàng Cầm.\n• 11:15 Thưởng thức khoai mì, trà nóng.\n• 12:00 Về lại TP.HCM.",
    info:
      "Khởi hành: Hằng ngày\nPhù hợp: Gia đình/nhóm bạn\nBao gồm: xe đưa đón, vé tham quan, HDV, nước suối.",
    terms:
      "Giá bao gồm: xe đưa đón, vé tham quan, HDV, 1 chai nước.\nKhông bao gồm: ăn trưa, bắn súng, VAT.",
  },
  {
    id: 2,
    slug: "tour-1-ngay-my-tho-ben-tre",
    name: "TOUR 1 NGÀY MỸ THO - BẾN TRE",
    location: "Mỹ Tho – Bến Tre",
    subtitle: "Nhà vườn – chùa Vĩnh Tràng – tát mương bắt cá",
    image: "/tours/mekong-1d.jpg",
    images: ["/tours/mekong-1d.jpg", "/tours/mekong-2.jpg", "/tours/mekong-3.jpg"],
    rating: 4.7,
    reviewCount: 203,
    avgRating: 4.7,
    serviceCount: 10,
    status: "Hot",
    category: "Miền Tây",
    distance: "± 150km",
    price: 480000,
    priceBefore: 650000,
    duration: "1 ngày",
    departTime: "07:30",
    startPoint: "Trung tâm Q.1",
    code: "MT-1D",
    overview:
      "Khám phá sông nước miền Tây, nghe đờn ca tài tử, thưởng thức trái cây miệt vườn.",
    itinerary:
      "• 07:30 Đón khách, khởi hành đi Mỹ Tho.\n• Tham quan chùa Vĩnh Tràng, đi thuyền trên sông Tiền.\n• Tham quan lò kẹo dừa, xe ngựa/xe đạp, xuồng ba lá rạch dừa nước.\n• 17:00 Trả khách về điểm đón.",
    info:
      "Khởi hành: Hằng ngày\nBao gồm: xe, thuyền, vé tham quan, HDV, ăn trưa, nước uống.",
    terms:
      "Không bao gồm: chi tiêu cá nhân, VAT nếu xuất hóa đơn.",
  },
  {
    id: 3,
    slug: "tour-2n1d-my-tho-ben-tre-can-tho",
    name: "TOUR 2N1Đ MỸ THO - BẾN TRE - CẦN THƠ",
    location: "Mekong Delta",
    image: "/tours/mekong-2n1d.jpg",
    rating: 4.6,
    reviewCount: 97,
    price: 1550000,
    priceBefore: 1790000,
  },
  {
    id: 4,
    slug: "tour-vung-tau-1-ngay",
    name: "TOUR VŨNG TÀU 1 NGÀY",
    location: "Vũng Tàu",
    image: "/tours/vung-tau.jpg",
    rating: 4.5,
    reviewCount: 88,
    price: 1050000,
    priceBefore: 1200000,
  },
  {
    id: 5,
    slug: "tour-nui-ba-den-1-ngay",
    name: "TOUR NÚI BÀ ĐEN - 1 NGÀY",
    location: "Tây Ninh",
    image: "/tours/baden-1d.jpg",
    rating: 4.6,
    reviewCount: 64,
    price: 1150000,
    priceBefore: 1350000,
  },
  {
    id: 6,
    slug: "tour-mien-tay-4n3d",
    name: "TOUR 4N3Đ MIỀN TÂY FULL",
    location: "ĐBSCL",
    image: "/tours/mekong-4n3d.jpg",
    rating: 4.4,
    reviewCount: 51,
    price: 4180000,
    priceBefore: 4590000,
  },
];

export default destinations;
