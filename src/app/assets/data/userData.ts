export type MonthlyUserData = {
    day: number;           // Ngày trong tháng
    currentMonth: number;  // Số người dùng tháng này
    previousMonth: number; // Số người dùng tháng trước
  };
  
  // Giả lập dữ liệu cho 30 ngày
  export const monthlyUserData: MonthlyUserData[] = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    return {
      day,
      currentMonth: Math.floor(Math.random() * 10000) + 5000,   // Random từ 500 - 1500
      previousMonth: Math.floor(Math.random() * 10000) + 4000   // Random từ 400 - 1400
    };
  });
  