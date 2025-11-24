'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { badgeApi } from '@/lib/badge/badgeApi';
import { BadgeType, Milestone } from '@/types/badge';

const staticMilestones: Milestone[] = [
  { title: 'TÂN KHÁM PHÁ', points: 0, color: '#5161EB', className: '' },
  { title: 'KHÁM PHÁ VIÊN', points: 100, color: '#F96651', className: '' },
  { title: 'THỔ ĐỊA', points: 300, color: '#02714D', className: '' },
  { title: 'NHÀ THÁM HIỂM', points: 600, color: '#7829EC', className: '' },
];

// Các vị trí cố định trên UI (theo thứ tự từ trái → phải → lên trên)
const layoutPositions = [
  "absolute top-[117%] left-[28%] ml:top-[100%] ml:left-[30%] md:top-[102%] md:left-[26%] lg:top-[98%] lg:left-[28%] xl:top-[92%] xl:left-[28%] 1.5xl:top-[152%] 1.5xl:left-[28%]",
  "absolute top-[95%] left-[44%] ml:top-[80%] ml:left-[40%] md:top-[70%] md:left-[44%] lg:top-[68%] lg:left-[46%] xl:top-[46%] xl:left-[45.5%] 1.5xl:top-[89%] 1.5xl:left-[30%]",
  "absolute top-[84%] left-[71.5%] ml:top-[80%] ml:left-[60%] md:top-[61%] md:left-[70%] lg:top-[59%] lg:left-[72%] xl:top-[32%] xl:left-[71.5%] 1.5xl:top-[92%] 1.5xl:left-[55%]",
  "absolute top-[52%] right-[3%] ml:top-[45%] ml:right-[5%] md:top-[16%] md:right-[8%] lg:top-[19%] lg:left-[89%] xl:top-[-26%] xl:right-[6%]",
];

const staticIcons = ['/icon4.svg', '/icon5.svg', '/icon6.svg', '/icon7.svg'];

export default function ScoreBanner() {
  const [milestones, setMilestones] = useState(
    staticMilestones.map((m, i) => ({ ...m, icon: staticIcons[i], className: layoutPositions[i] }))
  );

  useEffect(() => {
    const fetchUserBadges = async () => {
      try {
        const badges: BadgeType[] = await badgeApi.getUserBadges();

        // Map dữ liệu từ API
        const updatedMilestones = staticMilestones.map((m, i) => {
          const badge = badges[i];
          return {
            ...m,
            title: badge?.name ?? m.title,
            points: badge?.userProgress?.currentPoints ?? 0,
            icon: staticIcons[i],
          };
        });

        // Sort theo points giảm dần
        const sortedMilestones = [...updatedMilestones].sort((a, b) => b.points - a.points);

        // Gán lại vị trí hiển thị
        const milestonesWithLayout = sortedMilestones.map((m, i) => ({
          ...m,
          className: layoutPositions[i],
        }));

        setMilestones(milestonesWithLayout);
      } catch (err) {
        console.error("Error fetching badges:", err);
      }
    };

    fetchUserBadges();
  }, []);

  return (
    <div className="relative w-full pt-20 pb-10 overflow-hidden shadow-lg">
      {/* Đường kẻ */}
      <div className="absolute bottom-0 w-full z-0 translate-x-[5px] sm:translate-x-[40px] md:translate-x-[-1px] xl:translate-x-[5px] lg:translate-x-[10px]">
        <Image src="/Vector_3.svg" alt="đường kẻ" width={1555} height={100} />
        <div className="absolute bottom-0 w-full top-2 z-0
          translate-x-[8px] translate-y-[-14px]
          sm:translate-x-[20px] sm:translate-y-[-35px]
          md:translate-x-[55px] md:translate-y-[-12px] md:w-[720px]
          lg:translate-x-[85px] lg:translate-y-[-12px] lg:w-[950px]
          xl:translate-x-[135px] xl:translate-y-[-4px] xl:w-[1555px]
          1.5xl:translate-x-[145px] 1.5xl:translate-y-[-15px] 1.5xl:w-[1750px]"
        >
          <Image src="/blur.svg" alt="Blur effect" width={1388} height={100} />
        </div>
      </div>

      {/* Milestones */}
      <div className="relative z-10">
        <h2 className="max-w-7xl mx-auto text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--primary)] leading-snug mb-10 px-4 text-center lg:text-left">
          CHINH PHỤC DANH HIỆU <br className="hidden sm:block" /> CHO BẢN THÂN
        </h2>

        <div className="relative w-full h-[140px] sm:h-[380px] md:h-[250px] lg:h-[350px]">
          {milestones.map((m, i) => (
            <div
              key={i}
              className={`${m.className} z-20`}
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                <div className="absolute -top-[42px] translate-x-[-68%] sm:-top-[52px] md:-top-[60px] lg:-top-[74px] lg:-translate-x-[78%] left-1/2 -translate-x-1/2 flex flex-col items-start whitespace-nowrap">
                  <p className="text-[12px] sm:text-sm lg:text-2xl font-bold leading-tight" style={{ color: m.color }}>
                    {m.title}
                  </p>
                  <span className="text-[11px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 lg:text-xl ">
                    {m.points} ĐIỂM
                  </span>
                </div>

                <div className="relative w-[27px] h-[27px] sm:w-[24px] sm:h-[24px] md:w-[36px] md:h-[36px] lg:w-[50px] lg:h-[50px] 1.5xl:w-[70px] 1.5xl:h-[70px]">
                  <Image src={m.icon} alt={m.title} fill className="object-contain" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
