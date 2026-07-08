"use client";

import FadeInWhenVisible from "@/components/FadeInWhenVisible";
import SlideIn from "@/components/SlideIn";
import { StaggerContainer, StaggerItem } from "@/components/Stagger";
import ScrollProgress from "@/components/ScrollProgress";

import SearchBox from "@/components/ui/SearchBox";
import HomeBanner from "./HomeBanner";
import ServiceSection from "./ServiceSection";
import HotDestinations from "./HotDestinations";
import TourList from "./TourList";
import QNASection from "./QNASection";
import BlogSection from "./BlogSection";
import VoucherEventsSection from "./VoucherEventsSection";
import TourRecommendations from "@/components/TourRecommendations";

export default function UserHomePage() {
  return (
    <div className="relative overflow-hidden">
      <ScrollProgress />

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-blue-300/20 blur-[120px]"
          style={{ top: "-100px", left: "-200px" }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full bg-orange-200/20 blur-[120px]"
          style={{ bottom: "0px", right: "-150px" }}
        />
      </div>

      {/* Banner — trên sm+ có padding ngang để corner radius thấy rõ */}
      <div className="sm:px-4 lg:px-6">
        <FadeInWhenVisible>
          <HomeBanner />
        </FadeInWhenVisible>
      </div>

      {/* SearchBox — overlap trên sm+, inline trên mobile */}
      <FadeInWhenVisible delay={0.15}>
        <SearchBox />
      </FadeInWhenVisible>

      {/* Services */}
      <SlideIn dir="left">
        <ServiceSection />
      </SlideIn>

      {/* Điểm đến hot nhất */}
      <SlideIn dir="right">
        <TourList />
      </SlideIn>

      {/* Tour nổi bật */}
      <div className="bg-slate-50/70">
        <StaggerContainer delay={0.1} interval={0.07}>
          <StaggerItem>
            <HotDestinations />
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Voucher */}
      <FadeInWhenVisible delay={0.1}>
        <VoucherEventsSection />
      </FadeInWhenVisible>

      {/* Tour gợi ý cá nhân hóa */}
      <div className="bg-slate-50/70">
        <FadeInWhenVisible delay={0.1}>
          <TourRecommendations
            type="homepage"
            heading="Tour gợi ý cho bạn"
            limit={8}
            columns={4}
            showViewAll={true}
          />
        </FadeInWhenVisible>
      </div>

      {/* Blog */}
      <SlideIn dir="right">
        <BlogSection />
      </SlideIn>

      {/* Q&A */}
      <div className="bg-slate-50/70">
        <StaggerContainer delay={0.1} interval={0.06}>
          <StaggerItem>
            <QNASection />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  );
}
