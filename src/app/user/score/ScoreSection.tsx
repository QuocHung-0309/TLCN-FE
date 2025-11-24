'use client';
import { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Chart } from 'chart.js';
import type { Plugin, LinearScale as LinearScaleType } from 'chart.js';
import Image from 'next/image';
import { FaChevronDown } from 'react-icons/fa';
import { placeApi } from '@/lib/place/placeApi';
import { checkinApi } from '@/lib/checkin/checkinApi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
interface Place {
  _id: string;
  name: string;
  slug: string;
  address: string;
  district: string;
  ward: string;
  location: { type: 'Point'; coordinates: [number, number] };
  avgRating: number;
  totalRatings: number;
  totalLikes: number;
}
interface Checkin {
  _id: string;
  userId: string;
  placeId: {
    _id: string;
    name: string;
    ward?: string;      
    district?: string; 
    address: string;
    avgRating?: number;
    totalRatings?: number;
    id?: string;
  };
  count: number;
}
export default function ScoreSection() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [width, setWidth] = useState<number>(0);
  const [openDropdown, setOpenDropdown] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placeList, checkinList] = await Promise.all([
          placeApi.getAll(),
          checkinApi.getUserCheckins(),
        ]);
        setPlaces(Array.isArray(placeList) ? placeList : []);
        setCheckins(Array.isArray(checkinList) ? checkinList : []);
      } catch (err) {
        console.error('Failed to fetch places or checkins:', err);
        setPlaces([]);
        setCheckins([]);
      }
    };
    fetchData();
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const LOCATION_DATA = useMemo(() => {
    if (!Array.isArray(places)) return [];

    const countMap: Record<string, number> = {};

    checkins.forEach(c => {
      const wardName = c.placeId?.ward || "Chưa rõ phường";
      countMap[wardName] = (countMap[wardName] || 0) + 1;
    });

    return Object.entries(countMap).map(([ward, value]) => ({
      name: ward,
      value
    }));
  }, [places, checkins]);

  const maxValue = LOCATION_DATA.length > 0 ? Math.max(...LOCATION_DATA.map(l => l.value)) : 0;
  const categoryPercent = width < 640 ? 0.4 : 0.3;
  const barPercent = width < 640 ? 0.9 : 1;
  const data = useMemo(() => {
    const barThickness = width >= 1280 ? 36 : width >= 1024 ? 32 : width >= 640 ? 28 : 24;
    return {
      labels: LOCATION_DATA.map(l => l.name),
      datasets: [
        {
          label: '',
          data: LOCATION_DATA.map(l => l.value),
          backgroundColor: LOCATION_DATA.map(l => l.value === maxValue ? '#3B82F6' : '#FEECBA'),
          borderRadius: 50,
          borderSkipped: false,
          barThickness,
          maxBarThickness: 40,
          categoryPercentage: categoryPercent,
          barPercentage: barPercent,
        }
      ]
    };
  }, [LOCATION_DATA, maxValue, width, categoryPercent, barPercent]);
  const options = useMemo(() => {
    const fontSize = width >= 1280 ? 13 : width >= 1024 ? 12 : width >= 640 ? 12 : 11;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      layout: { padding: 0 },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#1e293b', font: { size: fontSize, weight: 500 as const }, maxRotation: 0, autoSkip: true },
          stacked: false,
          categoryPercentage: categoryPercent,
          barPercentage: barPercent,
        },
        
        y: {
          min: 0,
          max: maxValue < 10 ? 10 : maxValue, 
          ticks: {
            stepSize: Math.ceil((maxValue < 10 ? 10 : maxValue) / 5), // chia thành ~5 mốc
            padding: 4,
            color: '#94a3b8',
            font: { size: fontSize, weight: 500 as const },
          },
          grid: { drawTicks: false, color: 'transparent', borderColor: 'transparent' },
        }
      },
      animation: { duration: 250 },
      interaction: { intersect: false, mode: 'nearest' as const },
    };
  }, [width, categoryPercent, barPercent]);
  const dashedLinePlugin: Plugin<'bar'> = {
    id: 'dashedLineAt10',
    afterDraw: (chart: Chart) => {
      const y = chart.scales?.y as LinearScaleType;
      if (!y) return;
      const yValue = y.getPixelForValue(10);
      const { left, right } = chart.chartArea;
      const { ctx } = chart;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5,5]);
      ctx.moveTo(left, yValue);
      ctx.lineTo(right, yValue);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();
      ctx.restore();
    }
  };
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-end">
        <div className="col-span-1 lg:col-span-2 bg-[#F8F8FC] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-xl font-bold text-gray-800">HÀNH TRÌNH CỦA BẠN</h2>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="self-start sm:self-auto bg-[#B4CEFC] border border-gray-200 text-gray-800 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                Checkin nhiều nhất:
                <span className="bg-white rounded-full p-[3px] flex items-center justify-center">
                  <FaChevronDown className="w-3 h-3 text-gray-800" />
                </span>
              </button>
              {openDropdown && (
                <div className="absolute right-0 mt-1 w-42 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                  {LOCATION_DATA.map(loc => (
                    <button
                      key={loc.name}
                      onClick={() => {}}
                      className="w-full px-1 py-1 hover:bg-gray-100 text-sm truncate text-center"
                      title={loc.name}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="h-56 sm:h-64 md:h-72 lg:h-[300px]">
            <Bar data={data} options={options} plugins={[dashedLinePlugin]} />
          </div>
        </div>
        <div className="bg-[#F8F8FC] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center lg:self-end">
          <Image
            src="/conquering.svg"
            alt="Hãy chinh phục"
            width={320}
            height={320}
            className="w-40 sm:w-48 lg:w-56 xl:w-64 h-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
}
