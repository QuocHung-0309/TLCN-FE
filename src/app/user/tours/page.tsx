"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, MapPin, Calendar, Star, Users, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTours, type Tour } from "@/lib/tours/tour";

interface TourFilters {
  search: string;
  destination: string;
  minPrice: string;
  maxPrice: string;
  duration: string;
  rating: string;
  sortBy: string;
}

export default function ToursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<TourFilters>({
    search: searchParams?.get("search") || "",
    destination: searchParams?.get("destination") || "",
    minPrice: searchParams?.get("minPrice") || "",
    maxPrice: searchParams?.get("maxPrice") || "",
    duration: searchParams?.get("duration") || "",
    rating: searchParams?.get("rating") || "",
    sortBy: searchParams?.get("sortBy") || "newest"
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTours();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError("");
      
      const query: any = {};
      if (filters.search) query.search = filters.search;
      if (filters.destination) query.destination = filters.destination;
      if (filters.minPrice) query.minPrice = parseInt(filters.minPrice);
      if (filters.maxPrice) query.maxPrice = parseInt(filters.maxPrice);
      if (filters.sortBy) query.sort = filters.sortBy;

      const response = await getTours(1, 20, query);
      console.log("🎯 Tours response:", response);
      
      if (response.data) {
        setTours(response.data);
        setTotal(response.total || 0);
      }
    } catch (err: any) {
      console.error("❌ Error fetching tours:", err);
      setError("Không thể tải dữ liệu tour");
    } finally {
      setLoading(false);
    }
  };

  const destinations = [
    "Hà Nội", "TP.HCM", "Đà Nẵng", "Hội An", "Huế", 
    "Nha Trang", "Đà Lạt", "Phú Quốc", "Sapa", "Hạ Long"
  ];

  const durations = [
    { label: "1-2 ngày", value: "1-2" },
    { label: "3-4 ngày", value: "3-4" },
    { label: "5-7 ngày", value: "5-7" },
    { label: "Hơn 7 ngày", value: "7+" }
  ];

  const sortOptions = [
    { label: "Mới nhất", value: "newest" },
    { label: "Giá thấp → cao", value: "price_asc" },
    { label: "Giá cao → thấp", value: "price_desc" },
    { label: "Đánh giá cao", value: "rating" },
    { label: "Phổ biến", value: "popular" }
  ];

  const handleFilterChange = (key: keyof TourFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const updateURL = (newFilters: TourFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/user/tours?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      destination: "",
      minPrice: "",
      maxPrice: "",
      duration: "",
      rating: "",
      sortBy: "newest"
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  };

  const filteredTours = tours || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Khám phá các tour du lịch</h1>
            <p className="text-xl text-blue-100">Tìm kiếm chuyến đi hoàn hảo cho bạn</p>
          </div>
          
          {/* Main Search */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm tour
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Nhập tên tour, địa điểm..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm đến
                  </label>
                  <select
                    value={filters.destination}
                    onChange={(e) => handleFilterChange("destination", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Tất cả điểm đến</option>
                    {destinations.map((dest) => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sắp xếp
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            
            <span className="text-gray-600">
              {total} tour được tìm thấy
            </span>
            
            {(filters.search || filters.destination || filters.minPrice || filters.maxPrice) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
            >
              <div className="w-4 h-4 space-y-1">
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá từ (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="Giá tối thiểu"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá đến (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="Giá tối đa"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange("duration", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả thời gian</option>
                  {durations.map((duration) => (
                    <option key={duration.value} value={duration.value}>{duration.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange("rating", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả đánh giá</option>
                  <option value="4.5">4.5★ trở lên</option>
                  <option value="4.0">4.0★ trở lên</option>
                  <option value="3.5">3.5★ trở lên</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu tour</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy tour nào</h3>
            <p className="text-gray-500 mb-6">Hãy thử thay đổi tiêu chí tìm kiếm hoặc bộ lọc</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-6"
          }>
            {filteredTours.map((tour: any) => (
              <div key={tour._id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                viewMode === "list" ? "flex" : ""
              }`}>
                <div className={viewMode === "list" ? "w-64 flex-shrink-0" : ""}>
                  <Image
                    src={tour.image || tour.cover || "/placeholder-tour.jpg"}
                    alt={tour.title}
                    width={300}
                    height={200}
                    className={`w-full object-cover ${viewMode === "list" ? "h-full" : "h-48"}`}
                  />
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {tour.title}
                    </h3>
                    {tour.rating && (
                      <div className="flex items-center text-yellow-500 ml-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{tour.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{tour.destination || "Điểm đến chưa xác định"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{tour.time || "Thời gian chưa xác định"}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>Còn {(Number(tour.quantity) || 0)} chỗ</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(Number(tour.priceAdult) || 0)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/người</span>
                    </div>
                    
                    <Link
                      href={`/user/destination/${tour._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}