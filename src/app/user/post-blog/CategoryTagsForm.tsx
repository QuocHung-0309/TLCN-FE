"use client";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { MapPin, ChevronDown, Search, Loader2, X } from "lucide-react";

const API_BASE = "https://34tinhthanh.com/api";

interface Province {
  province_code: string;
  name: string;
}

interface Ward {
  ward_code: string;
  ward_name: string;
  province_code: string;
}

interface CategoryTagsFormProps {
  categories: string[];
  tags: string[];
  address: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  onCategoriesChange: (values: string[]) => void;
  onTagsChange: (values: string[]) => void;
  onAddressChange: (value: string) => void;
  onLocationChange: (pCode: string, pName: string, wCode: string, wName: string) => void;
}

const CATEGORY_OPTIONS = [
  "Du lịch", "Ẩm thực", "Trải nghiệm", "Review", "Cẩm nang", "Kinh nghiệm", "Nghỉ dưỡng"
];

export default function CategoryTagsForm({
  categories,
  tags,
  address,
  provinceCode,
  provinceName,
  wardCode,
  wardName,
  onCategoriesChange,
  onTagsChange,
  onAddressChange,
  onLocationChange,
}: CategoryTagsFormProps) {
  const [openProvince, setOpenProvince] = useState(false);
  const [openWard, setOpenWard] = useState(false);
  const [tagInputString, setTagInputString] = useState(tags.join(", "));

  // Province/Ward data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Search filters for dropdowns
  const [provinceSearch, setProvinceSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");

  const categoryRef = useRef<HTMLDivElement>(null);
  const provinceRef = useRef<HTMLDivElement>(null);
  const wardRef = useRef<HTMLDivElement>(null);

  // -------- Fetch Tỉnh/Thành từ 34tinhthanh.com --------
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetch(`${API_BASE}/provinces`);
        if (!res.ok) throw new Error("Network error");
        const data: Province[] = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error("Lỗi lấy Tỉnh/Thành:", err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // -------- Fetch Phường/Xã khi chọn Tỉnh --------
  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const res = await fetch(`${API_BASE}/wards?province_code=${provinceCode}`);
        if (!res.ok) throw new Error("Network error");
        const data: Ward[] = await res.json();
        setWards(data);
      } catch (err) {
        console.error("Lỗi lấy Phường/Xã:", err);
        setWards([]);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [provinceCode]);

  // -------- Click outside để đóng dropdown --------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (provinceRef.current && !provinceRef.current.contains(event.target as Node)) {
        setOpenProvince(false);
        setProvinceSearch("");
      }
      if (wardRef.current && !wardRef.current.contains(event.target as Node)) {
        setOpenWard(false);
        setWardSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------- Filtered lists --------
  const filteredProvinces = provinceSearch.trim()
    ? provinces.filter((p) => p.name.toLowerCase().includes(provinceSearch.toLowerCase()))
    : provinces;

  const filteredWards = wardSearch.trim()
    ? wards.filter((w) => w.ward_name.toLowerCase().includes(wardSearch.toLowerCase()))
    : wards;

  // -------- Handlers --------

  return (
    <div className="space-y-5">
      {/* ---- Danh mục ---- */}
      <div className="relative">
        <label className="block font-medium text-slate-700 mb-1.5 text-sm">
          Danh mục <span className="text-slate-400 font-normal">(chọn 1 danh mục)</span>
        </label>
        <select
          value={categories[0] || ""}
          onChange={(e) => onCategoriesChange(e.target.value ? [e.target.value] : [])}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 transition-colors appearance-none"
        >
          <option value="">Chọn danh mục...</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 mt-[26px]">
          <ChevronDown size={16} />
        </div>
      </div>

      {/* ---- Tags ---- */}
      <div>
        <label className="block font-medium text-slate-700 mb-1.5 text-sm">
          Từ khóa (Tags) <span className="text-slate-400 font-normal">(cách nhau bởi dấu phẩy)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={tagInputString}
            onChange={(e) => {
              const val = e.target.value;
              setTagInputString(val);
              onTagsChange(val.split(",").map(t => t.trim()).filter(t => t.length > 0));
            }}
            placeholder="du lịch, đà lạt, khám phá..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-colors"
          />
        </div>
      </div>

      {/* ---- Vị trí hành chính ---- */}
      <div>
        <label className="block font-medium text-slate-700 mb-1.5 text-sm flex items-center gap-1.5">
          <MapPin size={14} className="text-orange-500" />
          Vị trí địa lý
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Tỉnh / Thành phố */}
          <div className="relative" ref={provinceRef}>
            <span className="block text-xs text-slate-500 mb-1">Tỉnh / Thành phố</span>
            <button
              type="button"
              onClick={() => { setOpenProvince(!openProvince); setOpenWard(false); }}
              className="w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 transition-colors"
            >
              <span className="truncate text-slate-700">{provinceName || "Chọn Tỉnh/Thành..."}</span>
              {loadingProvinces
                ? <Loader2 size={15} className="animate-spin text-slate-400 flex-shrink-0" />
                : <ChevronDown size={15} className={`flex-shrink-0 text-slate-400 transition-transform ${openProvince ? "rotate-180" : ""}`} />
              }
            </button>

            {openProvince && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                {/* Search box */}
                <div className="p-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                    <Search size={13} className="text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      placeholder="Tìm tỉnh/thành..."
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredProvinces.length === 0 ? (
                    <div className="p-3 text-sm text-slate-400 text-center">Không tìm thấy</div>
                  ) : filteredProvinces.map((p) => (
                    <button
                      key={p.province_code}
                      type="button"
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors border-b border-slate-50 last:border-b-0 ${
                        provinceCode === p.province_code ? "bg-orange-50 text-orange-700 font-medium" : "text-slate-700"
                      }`}
                      onClick={() => {
                        onLocationChange(p.province_code, p.name, "", "");
                        setOpenProvince(false);
                        setProvinceSearch("");
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phường / Xã */}
          <div className="relative" ref={wardRef}>
            <span className="block text-xs text-slate-500 mb-1">Phường / Xã</span>
            <button
              type="button"
              disabled={!provinceCode}
              onClick={() => { setOpenWard(!openWard); setOpenProvince(false); }}
              className="w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="truncate text-slate-700">{wardName || "Chọn Phường/Xã..."}</span>
              {loadingWards
                ? <Loader2 size={15} className="animate-spin text-slate-400 flex-shrink-0" />
                : <ChevronDown size={15} className={`flex-shrink-0 text-slate-400 transition-transform ${openWard ? "rotate-180" : ""}`} />
              }
            </button>

            {openWard && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                {/* Search box */}
                <div className="p-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                    <Search size={13} className="text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={wardSearch}
                      onChange={(e) => setWardSearch(e.target.value)}
                      placeholder="Tìm phường/xã..."
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredWards.length === 0 ? (
                    <div className="p-3 text-sm text-slate-400 text-center">
                      {wards.length === 0 ? "Đang tải..." : "Không tìm thấy"}
                    </div>
                  ) : filteredWards.map((w) => (
                    <button
                      key={w.ward_code}
                      type="button"
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors border-b border-slate-50 last:border-b-0 ${
                        wardCode === w.ward_code ? "bg-orange-50 text-orange-700 font-medium" : "text-slate-700"
                      }`}
                      onClick={() => {
                        onLocationChange(provinceCode, provinceName, w.ward_code, w.ward_name);
                        setOpenWard(false);
                        setWardSearch("");
                      }}
                    >
                      {w.ward_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chi tiết địa chỉ */}
        <div>
          <span className="block text-xs text-slate-500 mb-1">Số nhà, tên đường (không bắt buộc)</span>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="VD: 123 Nguyễn Huệ..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-colors"
            name="locationDetail"
          />
        </div>

        {/* Preview địa chỉ đã chọn */}
        {(provinceName || wardName || address) && (
          <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 text-sm text-orange-800">
            <MapPin size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
            <span>{[address, wardName, provinceName].filter(Boolean).join(", ")}</span>
            <button
              type="button"
              onClick={() => { onLocationChange("", "", "", ""); onAddressChange(""); }}
              className="ml-auto text-orange-400 hover:text-red-500 flex-shrink-0 transition-colors"
              title="Xoá vị trí"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
