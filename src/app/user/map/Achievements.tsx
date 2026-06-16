"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Lock,
  CheckCircle,
  Star,
  Map,
  Compass,
  Mountain,
  Waves,
  TreePine,
  Building,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { checkinApi } from "@/lib/checkin/checkinApi";
import useUser from "#/src/hooks/useUser";

const MERGED_PROVINCE_ALIASES: Record<string, string> = {
  "yen bai": "lao cai",
  "bac kan": "thai nguyen",
  "vinh phuc": "phu tho",
  "hoa binh": "phu tho",
  "bac giang": "bac ninh",
  "thai binh": "hung yen",
  "hai duong": "hai phong",
  "ha nam": "ninh binh",
  "nam dinh": "ninh binh",
  "quang binh": "quang tri",
  "quang nam": "da nang",
  "kon tum": "quang ngai",
  "binh dinh": "gia lai",
  "ninh thuan": "khanh hoa",
  "dak nong": "lam dong",
  "binh thuan": "lam dong",
  "phu yen": "dak lak",
  "ba ria vung tau": "ho chi minh",
  "binh duong": "ho chi minh",
  "tp ho chi minh": "ho chi minh",
  "thanh pho ho chi minh": "ho chi minh",
  "ho chi minh city": "ho chi minh",
  "binh phuoc": "dong nai",
  "long an": "tay ninh",
  "soc trang": "can tho",
  "hau giang": "can tho",
  "ben tre": "vinh long",
  "tra vinh": "vinh long",
  "tien giang": "dong thap",
  "bac lieu": "ca mau",
  "kien giang": "an giang",
  "ha giang": "tuyen quang",
  "thua thien hue": "hue",
  "a nang": "da nang",
  "ak lak": "dak lak",
  "ak nong": "lam dong",
  "ien bien": "dien bien",
  "ong nai": "dong nai",
  "ong thap": "dong thap",
  "lam ong": "lam dong",
};

const normalizeProvince = (provinceName: string) =>
  provinceName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getMergedProvinceKey = (provinceName: string) => {
  const normalized = normalizeProvince(provinceName || "");
  return MERGED_PROVINCE_ALIASES[normalized] || normalized;
};

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: "first_step",
    name: "Bước chân đầu tiên",
    description: "Check-in địa điểm đầu tiên",
    icon: Map,
    requirement: 1,
    type: "provinces",
    color: "from-green-400 to-emerald-500",
    rarity: "common",
  },
  {
    id: "explorer_5",
    name: "Lữ khách mới",
    description: "Chinh phục 5 tỉnh thành",
    icon: Compass,
    requirement: 5,
    type: "provinces",
    color: "from-blue-400 to-cyan-500",
    rarity: "common",
  },
  {
    id: "explorer_10",
    name: "Phượt thủ tập sự",
    description: "Chinh phục 10 tỉnh thành",
    icon: Mountain,
    requirement: 10,
    type: "provinces",
    color: "from-purple-400 to-violet-500",
    rarity: "uncommon",
  },
  {
    id: "explorer_20",
    name: "Thám hiểm gia",
    description: "Chinh phục 20 tỉnh thành",
    icon: TreePine,
    requirement: 20,
    type: "provinces",
    color: "from-teal-400 to-emerald-500",
    rarity: "uncommon",
  },
  {
    id: "explorer_28",
    name: "Chinh phục gần trọn Việt Nam",
    description: "Chinh phục 28 tỉnh thành",
    icon: Star,
    requirement: 28,
    type: "provinces",
    color: "from-amber-400 to-orange-500",
    rarity: "rare",
  },
  {
    id: "explorer_34",
    name: "Huyền thoại Việt Nam",
    description: "Chinh phục toàn bộ 34 tỉnh thành",
    icon: Award,
    requirement: 34,
    type: "provinces",
    color: "from-yellow-400 to-amber-500",
    rarity: "legendary",
  },
  {
    id: "coastal",
    name: "Người con của biển",
    description: "Ghé thăm 5 tỉnh ven biển",
    icon: Waves,
    requirement: 5,
    type: "coastal",
    color: "from-cyan-400 to-blue-500",
    rarity: "uncommon",
  },
  {
    id: "highlands",
    name: "Chinh phục cao nguyên",
    description: "Ghé thăm 5 tỉnh Tây Nguyên",
    icon: Mountain,
    requirement: 5,
    type: "highlands",
    color: "from-orange-400 to-red-500",
    rarity: "uncommon",
  },
  {
    id: "cities",
    name: "Người thành phố",
    description: "Ghé thăm 5 thành phố trực thuộc TW",
    icon: Building,
    requirement: 5,
    type: "cities",
    color: "from-slate-400 to-zinc-500",
    rarity: "uncommon",
  },
];

const RARITY_STYLES = {
  common: {
    border: "border-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-600",
    label: "Thường",
  },
  uncommon: {
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-600",
    label: "Không phổ biến",
  },
  rare: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-600",
    label: "Hiếm",
  },
  epic: {
    border: "border-purple-200",
    bg: "bg-purple-50",
    text: "text-purple-600",
    label: "Sử thi",
  },
  legendary: {
    border: "border-amber-300",
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    text: "text-amber-600",
    label: "Huyền thoại",
  },
};

export default function Achievements() {
  const { isAuthenticated } = useUser();
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [provincesCount, setProvincesCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await checkinApi.getFullJourney();
        const provinceKeys = new Set<string>();
        if (res.progress?.length) {
          res.progress.forEach((p: any) => {
            const provinceKey = getMergedProvinceKey(p.provinceName);
            if (provinceKey) provinceKeys.add(provinceKey);
          });
        } else {
          [...(res.fromBookings || []), ...(res.fromManualCheckins || [])].forEach(
            (provinceName) => {
              const provinceKey = getMergedProvinceKey(provinceName);
              if (provinceKey) provinceKeys.add(provinceKey);
            }
          );
        }

        const total = Math.min(provinceKeys.size, 34);
        setProvincesCount(total);

        // Calculate unlocked achievements
        let count = 0;
        ACHIEVEMENTS.forEach((a) => {
          if (a.type === "provinces" && total >= a.requirement) {
            count++;
          }
        });
        setUnlockedCount(count);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const isUnlocked = (achievement: typeof ACHIEVEMENTS[0]) => {
    if (achievement.type === "provinces") {
      return provincesCount >= achievement.requirement;
    }
    return false;
  };

  const getProgress = (achievement: typeof ACHIEVEMENTS[0]) => {
    if (achievement.type === "provinces") {
      return Math.min((provincesCount / achievement.requirement) * 100, 100);
    }
    return 0;
  };

  const handleAchievementClick = (achievement: typeof ACHIEVEMENTS[0]) => {
    setSelectedAchievement(achievement);
    if (isUnlocked(achievement)) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#fbbf24", "#f59e0b", "#d97706"],
      });
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-full text-amber-600">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              Thành tựu
            </h2>
            <p className="text-sm text-slate-500">
              Đã mở khóa {unlockedCount}/{ACHIEVEMENTS.length} thành tựu
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="hidden md:block w-32">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ACHIEVEMENTS.map((achievement, index) => {
          const unlocked = isUnlocked(achievement);
          const progress = getProgress(achievement);
          const rarity = RARITY_STYLES[achievement.rarity as keyof typeof RARITY_STYLES];
          const Icon = achievement.icon;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleAchievementClick(achievement)}
              className={`relative cursor-pointer group rounded-2xl p-4 border-2 transition-all duration-300 ${
                unlocked
                  ? `${rarity.border} ${rarity.bg} hover:shadow-lg hover:-translate-y-1`
                  : "border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-80"
              }`}
            >
              {/* Rarity badge */}
              {unlocked && (
                <div
                  className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${rarity.bg} ${rarity.text} border ${rarity.border}`}
                >
                  {rarity.label}
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                  unlocked
                    ? `bg-gradient-to-br ${achievement.color} text-white shadow-lg`
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {unlocked ? (
                  <Icon size={24} />
                ) : (
                  <Lock size={20} />
                )}
              </div>

              {/* Name */}
              <h4
                className={`text-sm font-bold text-center mb-1 line-clamp-2 ${
                  unlocked ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {achievement.name}
              </h4>

              {/* Progress */}
              {!unlocked && (
                <div className="mt-2">
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1">
                    {provincesCount}/{achievement.requirement}
                  </p>
                </div>
              )}

              {/* Check mark for unlocked */}
              {unlocked && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
                  <CheckCircle size={14} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`p-6 text-white text-center bg-gradient-to-br ${selectedAchievement.color}`}
              >
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                  <X size={24} />
                </button>
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  {React.createElement(selectedAchievement.icon, { size: 40 })}
                </div>
                <h3 className="text-2xl font-black">{selectedAchievement.name}</h3>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <p className="text-slate-600 mb-4">
                  {selectedAchievement.description}
                </p>

                {isUnlocked(selectedAchievement) ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                    <CheckCircle size={18} />
                    Đã mở khóa!
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${selectedAchievement.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress(selectedAchievement)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-sm text-slate-500">
                      {provincesCount}/{selectedAchievement.requirement} hoàn thành
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
