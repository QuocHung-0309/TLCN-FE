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

const CATEGORY_PROVINCES = {
  cities: ["ha noi", "hai phong", "da nang", "ho chi minh", "can tho", "hue"],
  coastal: [
    "quang ninh", "hai phong", "ninh binh", "thanh hoa", "nghe an", 
    "ha tinh", "quang tri", "hue", "da nang", "quang ngai", 
    "gia lai", "dak lak", "khanh hoa", "lam dong", "ho chi minh", "ca mau"
  ],
  highlands: ["gia lai", "dak lak", "lam dong", "quang ngai"],
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
    description: "Ghé thăm 3 tỉnh Tây Nguyên",
    icon: Mountain,
    requirement: 3,
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
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    coastal: 0,
    highlands: 0,
    cities: 0,
  });

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
      </AnimatePresence>
    </section>
  );
}
