"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, MapPin } from "lucide-react";
import { getTours, type Tour } from "@/lib/tours/tour";

type TOCItem = {
  id: string;
  label: string;
};

const tocItems: TOCItem[] = [
  { id: "about-company", label: "Thời gian thành lập & phát triển" },
  { id: "services", label: "Lĩnh vực hoạt động" },
  { id: "vision", label: "Tầm nhìn & sứ mệnh" },
  { id: "core-values", label: "Giá trị cốt lõi" },
  { id: "why-us", label: "Vì sao chọn SaiGondi" },
];

const formatPrice = (price?: number | string) => {
  if (price == null) return "Giá liên hệ";
  const n =
    typeof price === "number"
      ? price
      : Number(String(price).replace(/[^\d]/g, ""));
  if (Number.isNaN(n)) return "Giá liên hệ";
  return new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";
};

const getTourImage = (tour: Tour) =>
  (tour as any).images?.[0] ||
  tour.image ||
  tour.cover ||
  "/placeholder-tour.jpg";

const buildTourHref = (tour: Tour) => {
  const slug =
    (tour.destinationSlug ??
      (tour.title || "").toLowerCase().replace(/\s+/g, "-")) ||
    "tour";
  return `/user/destination/${slug}/${tour._id}`;
};

export default function AboutPage() {
  const [popularTours, setPopularTours] = useState<Tour[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);

  useEffect(() => {
    const fetchPopularTours = async () => {
      try {
        setLoadingTours(true);
        const res = await getTours(1, 5, {});
        setPopularTours(res.data || []);
      } catch (err) {
        console.error("Error fetching sidebar tours:", err);
      } finally {
        setLoadingTours(false);
      }
    };
    fetchPopularTours();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-slate-50 to-emerald-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <nav className="mb-2 text-xs text-slate-500 md:text-sm">
              <Link href="/" className="hover:text-slate-800">
                Trang chủ
              </Link>{" "}
              /{" "}
              <span className="font-medium text-slate-800">
                Giới thiệu về chúng tôi
              </span>
            </nav>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Công ty Du lịch SaiGondi
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
              Nền tảng đặt tour linh hoạt, minh bạch chi phí và cá nhân hoá trải
              nghiệm cho từng chuyến đi của bạn.
            </p>
          </div>

          <div className="relative mx-auto h-32 w-full max-w-xs overflow-hidden rounded-2xl bg-sky-100 md:h-40">
            <Image
              src="/hot1.jpg"
              alt="SaiGondi Travel"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 via-transparent to-emerald-500/20" />
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1 text-xs font-medium text-slate-800 shadow-sm">
              Hơn 100+ hành trình khắp Việt Nam
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2.1fr),minmax(0,1fr)]">
          {/* LEFT: ARTICLE */}
          <article className="space-y-8 rounded-2xl bg-white p-4 shadow-sm md:p-6">
            {/* Intro highlight */}
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-slate-700 md:text-[15px]">
              <p>
                SaiGondi Travel được xây dựng từ niềm đam mê khám phá và mong
                muốn đưa công nghệ vào du lịch. Từ những chuyến đi nhỏ lẻ cho
                bạn bè, chúng tôi phát triển thành nền tảng đặt tour, nơi khách
                hàng có thể theo dõi{" "}
                <span className="font-semibold">
                  lịch sử booking, thanh toán và tình trạng tour
                </span>{" "}
                ngay trong một tài khoản.
              </p>
            </div>

            {/* Mục lục */}
            <section className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm">
              <button
                type="button"
                className="flex w-full items-center justify-between text-slate-800"
              >
                <span className="font-semibold">Mục lục</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
              <div className="mt-2 border-t border-slate-200 pt-2 text-xs md:text-sm">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full py-0.5 text-left text-slate-600 hover:text-blue-600"
                  >
                    • {item.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Sections */}
            <section id="about-company" className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                Thời gian thành lập &amp; quá trình phát triển
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                SaiGondi Travel được hình thành từ năm 20xx, khởi đầu với vai
                trò đơn vị tổ chức tour nhỏ lẻ. Trải qua thời gian, chúng tôi
                liên tục ứng dụng công nghệ vào quản lý lịch trình, chỗ trống
                tour, thanh toán và chăm sóc khách hàng, hướng tới mô hình{" "}
                <strong>
                  “nền tảng đặt tour linh hoạt – trải nghiệm cá nhân”
                </strong>
                .
              </p>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                Mục tiêu của SaiGondi là giúp khách hàng nhìn rõ toàn bộ hành
                trình: thông tin tour, giá, điều kiện huỷ, trạng thái thanh
                toán… mọi thứ được hiển thị minh bạch và dễ tra cứu.
              </p>
            </section>

            <section id="services" className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                Lĩnh vực hoạt động
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                SaiGondi Travel hoạt động như một nhà điều hành tour kết hợp nền
                tảng đặt chỗ trực tuyến, tập trung vào:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 md:text-base">
                <li>Tour trong nước cho nhóm nhỏ, gia đình, doanh nghiệp.</li>
                <li>Tour trải nghiệm văn hoá – ẩm thực theo vùng miền.</li>
                <li>
                  Tour nghỉ dưỡng cuối tuần, team building, du lịch thưởng.
                </li>
                <li>Combo vé máy bay, khách sạn, tour tham quan linh hoạt.</li>
              </ul>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                Chúng tôi đồng thời hợp tác với các đối tác địa phương để đa
                dạng hoá sản phẩm, giúp du khách có nhiều lựa chọn điểm đến với
                chi phí hợp lý.
              </p>
            </section>

            <section id="vision" className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                Tầm nhìn &amp; sứ mệnh
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                <strong>Tầm nhìn:</strong> Trở thành nền tảng đặt tour thân
                thiện với giới trẻ và gia đình, nơi mỗi chuyến đi đều được cá
                nhân hoá, dễ quản lý và minh bạch trong chi phí.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                <strong>Sứ mệnh:</strong> Kết nối du khách với những điểm đến
                đẹp nhất Việt Nam, lan toả tinh thần du lịch văn minh, an toàn
                và bền vững; đồng thời hỗ trợ đối tác địa phương tiếp cận khách
                qua kênh số.
              </p>
            </section>

            <section id="core-values" className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                Giá trị cốt lõi
              </h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 md:text-base">
                <li>
                  <strong>Minh bạch:</strong> Thông tin tour, giá, điều kiện
                  huỷ/đổi đều được công khai rõ ràng.
                </li>
                <li>
                  <strong>Tiện lợi:</strong> Đặt tour, xem lịch sử, huỷ tour
                  được thực hiện nhanh chóng trên cùng một nền tảng.
                </li>
                <li>
                  <strong>Đồng hành:</strong> Hỗ trợ khách trước – trong – sau
                  chuyến đi, cập nhật trạng thái booking kịp thời.
                </li>
                <li>
                  <strong>Công nghệ:</strong> Tận dụng dữ liệu để gợi ý hành
                  trình phù hợp nhu cầu và ngân sách.
                </li>
              </ul>
            </section>

            <section id="why-us" className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                Vì sao chọn SaiGondi?
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                Với SaiGondi, bạn không chỉ “mua” một chương trình tour sẵn có
                mà là một hành trình được thiết kế trọn gói:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 md:text-base">
                <li>
                  Giao diện đặt tour thân thiện, tối ưu cho cả mobile và web.
                </li>
                <li>
                  Lịch sử booking rõ ràng, trạng thái thanh toán theo thời gian
                  thực.
                </li>
                <li>
                  Linh hoạt hình thức thanh toán: tại văn phòng hoặc tích hợp
                  cổng thanh toán trực tuyến (VNPay, ví điện tử…) tuỳ cấu hình
                  hệ thống.
                </li>
                <li>
                  Đội ngũ trẻ, am hiểu điểm đến và sẵn sàng hỗ trợ tuỳ biến lịch
                  trình theo nhu cầu riêng.
                </li>
              </ul>
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                Chúng tôi tin rằng mỗi chuyến đi là một câu chuyện, và SaiGondi
                sẽ là công cụ giúp bạn bắt đầu câu chuyện đó một cách dễ dàng,
                an toàn và đầy cảm hứng.
              </p>
            </section>
          </article>

          {/* RIGHT: SIDEBAR */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                  Tour xem nhiều
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {loadingTours && (
                  <div className="space-y-3 p-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-16 w-24 rounded-md bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 rounded bg-slate-200" />
                          <div className="h-3 w-1/2 rounded bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loadingTours &&
                  popularTours.map((tour) => (
                    <Link
                      key={tour._id}
                      href={buildTourHref(tour)}
                      className="flex gap-3 p-3 hover:bg-slate-50"
                    >
                      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={getTourImage(tour)}
                          alt={tour.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <p className="line-clamp-2 text-xs font-semibold text-slate-900 md:text-sm">
                          {tour.title}
                        </p>
                        <div className="mt-1 space-y-0.5 text-xs">
                          <div className="flex items-center text-slate-500">
                            <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {tour.destination || "Đang cập nhật"}
                            </span>
                          </div>
                          <span className="font-semibold text-rose-600">
                            {formatPrice(tour.priceAdult)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}

                {!loadingTours && popularTours.length === 0 && (
                  <p className="p-4 text-sm text-slate-500">
                    Chưa có tour nổi bật để hiển thị.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
