"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminCreateBooking } from "@/lib/admin/adminBookingApi";
import { getTours, getTourDepartures } from "@/lib/tours/tour";
import { useToast } from "@/components/ui/Toast";
import { computeAge, getPassengerType, requiresCCCD, createBlankPassenger, validateCCCD } from '@/types/passenger';
import type { PassengerFormState } from '@/types/passenger';

export default function AdminCreateBookingPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // 1. States
  const [selectedTourId, setSelectedTourId] = useState("");
  const [selectedDepartureId, setSelectedDepartureId] = useState("");
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("full");
  const [paymentMethod, setPaymentMethod] = useState("manual");
  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    note: "",
  });

  const [passengers, setPassengers] = React.useState<PassengerFormState[]>([]);
  const [passengerErrors, setPassengerErrors] = React.useState<Record<string, string>>({});

  // 2. Data Fetching
  const { data: toursData } = useQuery({
    queryKey: ["adminToursAll"],
    queryFn: () => getTours(1, 200),
  });

  const { data: departuresData, isLoading: isLoadingDepartures } = useQuery({
    queryKey: ["tourDepartures", selectedTourId],
    queryFn: () => getTourDepartures(selectedTourId),
    enabled: !!selectedTourId,
  });

  // 3. Derived Data & Logic
  const selectedTour = toursData?.data?.find((t) => t._id === selectedTourId);
  const selectedDeparture = departuresData?.data?.find((d: any) => d._id === selectedDepartureId);

  // Lọc ra các lịch trình chưa xuất phát (trong tương lai hoặc hôm nay)
  const upcomingDepartures = useMemo(() => {
    if (!departuresData?.data) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return departuresData.data.filter((d: any) => new Date(d.startDate) >= today);
  }, [departuresData?.data]);

  const priceAdult = selectedDeparture?.priceAdult || selectedTour?.priceAdult || 0;
  const priceChild = selectedDeparture?.priceChild || selectedTour?.priceChild || Math.round(Number(priceAdult) * 0.6);
  
  const totalPrice = numAdults * Number(priceAdult) + numChildren * Number(priceChild);
  const depositAmount = Math.round(totalPrice * 0.5);

  // 3-day rule logic
  const canDeposit = useMemo(() => {
    if (!selectedDeparture?.startDate) return false;
    const startDate = new Date(selectedDeparture.startDate);
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  }, [selectedDeparture]);

  // Force Full Payment if 3-day rule fails
  useEffect(() => {
    if (!canDeposit && paymentType === "deposit") {
      setPaymentType("full");
    }
  }, [canDeposit, paymentType]);

  // Sync passenger slots
  useEffect(() => {
    const total = numAdults + numChildren;
    setPassengers((prev) => {
      return Array.from({ length: total }, (_, i) => prev[i] || createBlankPassenger());
    });
  }, [numAdults, numChildren]);

  const paidAmount = paymentType === "full" ? totalPrice : depositAmount;

  // 4. Mutation
  const mutation = useMutation({
    mutationFn: adminCreateBooking,
    onSuccess: () => {
      showSuccess("Tạo đơn đặt tour thành công!");
      router.push(`/admin/bookings`);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
    },
  });

  // 5. Handlers
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  const updatePassenger = useCallback((idx: number, field: keyof PassengerFormState, value: string) => {
    setPassengers((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    setPassengerErrors((prev) => { const n = { ...prev }; delete n[`${idx}_${field}`]; return n; });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartureId) return showError("Vui lòng chọn lịch khởi hành.");
    if (!contactInfo.fullName || !contactInfo.phoneNumber) return showError("Vui lòng nhập thông tin liên lạc.");

    // Validate passengers
    const pErrors: Record<string, string> = {};
    let hasPError = false;
    passengers.forEach((p, i) => {
      const isAdultSlot = i < numAdults;
      if (!p.fullName.trim()) { pErrors[`${i}_fullName`] = 'Vui lòng nhập họ tên'; hasPError = true; }
      if (!p.dateOfBirth) { pErrors[`${i}_dateOfBirth`] = 'Vui lòng nhập ngày sinh'; hasPError = true; }
      if (p.dateOfBirth) {
        const age = computeAge(p.dateOfBirth);
        if (isAdultSlot && age < 12) {
          pErrors[`${i}_dateOfBirth`] = 'Độ tuổi không hợp lệ cho Người lớn (phải >= 12 tuổi)'; hasPError = true;
        } else if (!isAdultSlot && age >= 12) {
          pErrors[`${i}_dateOfBirth`] = 'Độ tuổi không hợp lệ cho Trẻ em (phải < 12 tuổi)'; hasPError = true;
        }

        if (requiresCCCD(age)) {
          if (!p.idNumber.trim()) {
            pErrors[`${i}_idNumber`] = 'Vui lòng nhập CCCD (bắt buộc với người từ 14 tuổi)'; hasPError = true;
          } else {
            const cccdError = validateCCCD(p.idNumber.trim(), p.dateOfBirth, p.gender as any);
            if (cccdError) {
              pErrors[`${i}_idNumber`] = cccdError;
              hasPError = true;
            }
          }
        }
      }
    });
    if (hasPError) { setPassengerErrors(pErrors); return showError('Vui lòng điền đầy đủ thông tin hành khách.'); }

    mutation.mutate({
      tourDepartureId: selectedDepartureId,
      ...contactInfo,
      numAdults,
      numChildren,
      paymentMethod,
      paidAmount,
      passengers: passengers.map((p) => {
        const age = computeAge(p.dateOfBirth);
        return {
          fullName: p.fullName.trim(),
          dateOfBirth: p.dateOfBirth,
          gender: p.gender || undefined,
          idNumber: requiresCCCD(age) ? p.idNumber.trim() || undefined : undefined,
          type: getPassengerType(age),
        };
      }),
    });
  };

  // Helper Formats
  const localFormatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const localFormatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tạo Booking Mới</h1>
            <p className="text-slate-500 mt-1 text-sm">Quy trình chuyên nghiệp dành cho người quản trị</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <i className="ri-arrow-left-line"></i> Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột Trái: Thông tin chi tiết */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Chọn Tour & Lịch trình */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100">
                  <i className="ri-map-2-line text-xl"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">1. Chọn Tour & Lịch khởi hành</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Chọn Tour <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <i className="ri-search-line text-lg"></i>
                    </span>
                    <select
                      value={selectedTourId}
                      onChange={(e) => {
                        setSelectedTourId(e.target.value);
                        setSelectedDepartureId("");
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white outline-none transition text-sm font-medium appearance-none"
                      required
                    >
                      <option value="">-- Chọn một tour từ danh sách --</option>
                      {toursData?.data?.map((t) => (
                        <option key={t._id} value={t._id}>{t.title}</option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-xl"></i>
                    </span>
                  </div>
                </div>

                {selectedTourId && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Lịch khởi hành có sẵn <span className="text-red-500">*</span></label>
                    {isLoadingDepartures ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-4">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        Đang tải lịch trình...
                      </div>
                    ) : (
                      <>
                        {/* Scrollable departures list */}
                        <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {upcomingDepartures.length > 0 ? (
                              upcomingDepartures.map((d: any) => (
                                <div
                                  key={d._id}
                                  onClick={() => setSelectedDepartureId(d._id)}
                                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                                    selectedDepartureId === d._id
                                      ? "bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-400 shadow-md shadow-orange-500/10"
                                      : "bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5"
                                  }`}
                                >
                                  {selectedDepartureId === d._id && (
                                    <div className="absolute top-0 right-0 bg-orange-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                      <i className="ri-check-line"></i> Đã chọn
                                    </div>
                                  )}
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-slate-800 text-lg">{localFormatDate(d.startDate)}</span>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${d.current_guests >= d.max_guests ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                                      {d.max_guests - d.current_guests} Chỗ trống
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 mb-4 flex items-center gap-1.5 font-medium">
                                    <i className="ri-calendar-check-line text-slate-400"></i>
                                    Đến: {localFormatDate(d.endDate)}
                                  </div>
                                  <div className="text-lg font-black text-orange-600 tracking-tight">{localFormatVND(d.priceAdult || selectedTour?.priceAdult || 0)}</div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-2 text-sm text-slate-500 bg-slate-100 p-6 rounded-2xl text-center italic border-2 border-dashed border-slate-200">
                                Không tìm thấy lịch khởi hành cho tour này.
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Số lượng hành khách */}
            <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 transition-all ${!selectedDepartureId ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100">
                  <i className="ri-group-line text-xl"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">2. Số lượng hành khách</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800">Người lớn</div>
                    <div className="text-xs text-slate-500 font-medium">{localFormatVND(Number(priceAdult))} / khách</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setNumAdults(Math.max(1, numAdults - 1))}
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm text-slate-600 active:scale-95"
                    >
                      <i className="ri-subtract-line font-bold"></i>
                    </button>
                    <span className="text-2xl font-black w-8 text-center text-slate-900">{numAdults}</span>
                    <button
                      type="button"
                      onClick={() => setNumAdults(numAdults + 1)}
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm text-slate-600 active:scale-95"
                    >
                      <i className="ri-add-line font-bold"></i>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800">Trẻ em</div>
                    <div className="text-xs text-slate-500 font-medium">{localFormatVND(Number(priceChild))} / khách</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setNumChildren(Math.max(0, numChildren - 1))}
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm text-slate-600 active:scale-95"
                    >
                      <i className="ri-subtract-line font-bold"></i>
                    </button>
                    <span className="text-2xl font-black w-8 text-center text-slate-900">{numChildren}</span>
                    <button
                      type="button"
                      onClick={() => setNumChildren(numChildren + 1)}
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition shadow-sm text-slate-600 active:scale-95"
                    >
                      <i className="ri-add-line font-bold"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Thông tin liên hệ */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100">
                  <i className="ri-contacts-book-2-line text-xl"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800">3. Thông tin liên hệ</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên khách hàng <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    value={contactInfo.fullName}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-sm font-medium"
                    placeholder="Nguyễn Văn A..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={contactInfo.phoneNumber}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-sm font-medium"
                    placeholder="0987654321..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-sm font-medium"
                    placeholder="khachhang@gmail.com..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ khách trú</label>
                  <input
                    type="text"
                    name="address"
                    value={contactInfo.address}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-sm font-medium"
                    placeholder="Số nhà, tên đường, phường/xã..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú nội bộ</label>
                  <textarea
                    name="note"
                    value={contactInfo.note}
                    onChange={handleContactChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition text-sm font-medium"
                    placeholder="Ví dụ: ăn chay, yêu cầu xuất hoá đơn..."
                  />
                </div>
              </div>
          </div>

            {/* Step 4: Thông tin từng hành khách */}
            {passengers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center shadow-sm border border-violet-100">
                    <i className="ri-id-card-line text-xl"></i>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">4. Thông tin từng hành khách</h2>
                </div>
                <div className="space-y-4">
                  {passengers.map((p, idx) => {
                    const isAdultSlot = idx < numAdults;
                    const slotLabel = isAdultSlot ? `Người lớn ${idx + 1}` : `Trẻ em ${idx - numAdults + 1}`;
                    const age = p.dateOfBirth ? computeAge(p.dateOfBirth) : null;
                    const needId = age !== null && requiresCCCD(age);
                    return (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{idx + 1}</span>
                          <span className="text-sm font-semibold text-slate-700">{slotLabel}</span>
                          {age !== null && (
                            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                              age < 12 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>{age < 12 ? 'Trẻ em' : 'Người lớn'} · {age} tuổi</span>
                          )}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                            <input value={p.fullName} onChange={(e) => updatePassenger(idx, 'fullName', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                              placeholder="Họ và tên đầy đủ" />
                            {passengerErrors[`${idx}_fullName`] && <p className="mt-1 text-xs text-red-500">{passengerErrors[`${idx}_fullName`]}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
                            <input type="date" value={p.dateOfBirth} max={new Date().toISOString().split('T')[0]}
                              onChange={(e) => updatePassenger(idx, 'dateOfBirth', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                            {passengerErrors[`${idx}_dateOfBirth`] && <p className="mt-1 text-xs text-red-500">{passengerErrors[`${idx}_dateOfBirth`]}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Giới tính</label>
                            <select value={p.gender} onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none">
                              <option value="">-- Chọn --</option>
                              <option value="male">Nam</option>
                              <option value="female">Nữ</option>
                              <option value="other">Khác</option>
                            </select>
                          </div>
                          {needId && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Số CCCD <span className="text-red-500">*</span></label>
                              <input value={p.idNumber} onChange={(e) => updatePassenger(idx, 'idNumber', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                placeholder="12 chữ số" maxLength={12} />
                              {passengerErrors[`${idx}_idNumber`] && <p className="mt-1 text-xs text-red-500">{passengerErrors[`${idx}_idNumber`]}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cột Phải: Tóm tắt & Thanh toán */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 sticky top-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-50 flex items-center justify-between">
                <span>Tóm tắt đơn</span>
                <i className="ri-bill-line text-slate-300"></i>
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Người lớn (x{numAdults})</span>
                  <span className="font-bold text-slate-900">{localFormatVND(numAdults * Number(priceAdult))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Trẻ em (x{numChildren})</span>
                  <span className="font-bold text-slate-900">{localFormatVND(numChildren * Number(priceChild))}</span>
                </div>
                <div className="pt-5 mt-2 border-t border-slate-50 flex justify-between items-center">
                  <span className="font-bold text-slate-900">TỔNG CỘNG</span>
                  <span className="text-2xl font-black text-orange-600">{localFormatVND(totalPrice)}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[2px]">Kiểu thanh toán</label>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentType === 'full' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                      <input 
                        type="radio" 
                        name="paymentType" 
                        checked={paymentType === 'full'} 
                        onChange={() => setPaymentType('full')}
                        className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-slate-300"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-black text-slate-900">Trả 100%</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Toàn bộ giá trị đơn</div>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${!canDeposit ? 'opacity-40 grayscale cursor-not-allowed border-slate-100 bg-slate-50' : (paymentType === 'deposit' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100 bg-white hover:border-slate-300')}`}>
                      <input 
                        type="radio" 
                        name="paymentType" 
                        disabled={!canDeposit}
                        checked={paymentType === 'deposit'} 
                        onChange={() => setPaymentType('deposit')}
                        className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-slate-300"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">Đặt cọc 50%</div>
                        <div className="text-[10px] font-bold uppercase leading-tight">
                          {canDeposit 
                            ? <span className="text-blue-950">Thu trước {localFormatVND(depositAmount)}</span> 
                            : <span className="text-red-400">Chỉ áp dụng trước khởi hành {'>'} 3 ngày</span>}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[2px]">Phương thức thanh toán</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("manual")}
                      className={`py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                        paymentMethod === "manual"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Tiền mặt
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("vnpay")}
                      className={`py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                        paymentMethod === "vnpay"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Chuyển khoản
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="bg-orange-600 text-white p-5 rounded-[2rem] mb-6 shadow-xl shadow-orange-600/20 text-center">
                    <div className="text-[10px] font-bold text-orange-100 uppercase mb-1 tracking-widest">Số tiền phải thu ngay</div>
                    <div className="text-3xl font-black">{localFormatVND(paidAmount)}</div>
                  </div>

                  <button
                    type="submit"
                    disabled={mutation.isPending || !selectedDepartureId}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    {mutation.isPending ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ĐANG XỬ LÝ...
                      </span>
                    ) : "XÁC NHẬN TẠO ĐƠN"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
