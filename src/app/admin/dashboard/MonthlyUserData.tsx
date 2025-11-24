"use client";
import {monthlyUserData } from "../../assets/data/userData";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler, 
  ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);
export default function MonthlyLineChart() {

const labels = monthlyUserData.map((item) => item.day.toString());
const currentMonthData = monthlyUserData.map((item) => item.currentMonth);
const previousMonthData = monthlyUserData.map((item) => item.previousMonth);

const importantDays = [1, 5, 10, 15, 20, 25, 30];

const data = {
  labels,
  datasets: [
    {
      label: "Tháng này",
      data: currentMonthData,
      borderColor: "#307AFD",     
      backgroundColor: (context: ScriptableContext<'line'>) => {
        const chart = context.chart;
        const {ctx, chartArea} = chart;

        if (!chartArea) {
         
          return undefined;
        }

        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, '#F6F7FA'); 
        gradient.addColorStop(0.5, '#EEF2FA'); 

        return gradient;
      },

      fill: true,
      tension: 0.5,
      pointRadius: 0,
      borderWidth: 1,
      order:2,

    },
    {
      label: "Tháng trước",
      data: previousMonthData,
      borderColor: "#FFB226",
      fill: false,
      backgroundColor: "",
      tension: 0.5,      
      pointRadius: 0,
      borderWidth: 1,
      borderDash: [3,3],
      order: 1,
    },
  ],
};

const options: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
        display:false,
        position: "top",
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = Number(context.raw);
          return value >= 1000 ? (value / 1000).toFixed(0) + "K" : value.toString();
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        callback: (val) => {
          const day = Number(val);
          if (importantDays.includes(day)) {
            return day < 10 ? "0" + day : day.toString();
          }
          return "";
        },
        maxRotation: 0,
        autoSkip: false,
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true, 
      ticks: {        
        stepSize: 5000,  
        callback: (val) => {
          const num = Number(val);
          return num >= 1000 ? (num / 1000).toFixed(0) + "K" : num.toString();
        },
      },
      grid: {
        display: false,
      },
    },
  },
};

  return (
    <div className="w-full mb-6 overflow-hidden">
        <div className="flex items-center gap-6">
            <h3 className="font-bold m-4 border-r pr-6 border-gray-300">Tổng hợp người dùng</h3>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full mr-1 bg-(--primary)"></div>
                <h4>Tháng này</h4>                
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full mr-1 bg-(--secondary)"></div>
                <h4>Tháng trước</h4>      
            
            </div>                            


        </div>
      <Line options={options} data={data} className='max-h-[300px]'/>
    </div>
  );
}
