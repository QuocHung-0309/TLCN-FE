"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, CheckCircle, X } from "lucide-react";
import confetti from "canvas-confetti";
import { checkinApi } from "@/lib/checkin/checkinApi";
import useUser from "#/src/hooks/useUser";
import { ACHIEVEMENTS, RARITY_STYLES } from "@/lib/achievements";

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
        const total = res.progress?.length
          ?? new Set([...(res.fromBookings || []), ...(res.fromManualCheckins || [])]).size;
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
