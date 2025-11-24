"use client";

import React from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

import { top6Places} from  "../../assets/data/topPlace";;

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TopPlacesBarChart: React.FC = () => {

  const labels = top6Places.map((item) => item.name);

  const dataValues = top6Places.map((item) => item.views);

  const colors = [
    "#9292FA",
    "#96E2D6",
    "#307AFD",
    "#FFB226",
    "#AEC7ED",
    "#8ACA90",
  ];
  
  const barData = {
    labels,
    datasets: [
      {
        label: "Lượt xem",
        data: dataValues,
        backgroundColor: colors,  
        borderRadius: 10,
        borderSkipped: false,

      }
    ],
  };
  
  const options: ChartOptions<"bar"> = {
    indexAxis: "x", 
    responsive: true,
    animation: {
      duration: 1500, 
      easing: 'easeOutQuart'
    },
    resizeDelay: 200,
    plugins: {
      legend: { display: false, position: "top" , },      
      tooltip: {

        callbacks: {
          label: (context) => {
            const value = context.parsed.y; 
            if (typeof value !== "number") return "";
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + "k";
            }
            return value.toString();
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, 
        },
        ticks: {
          maxTicksLimit: 5,
          autoSkip: false,
          maxRotation: 30,  
          minRotation: 0,  
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            size: 11,
            weight: "normal",
          },              
          color:"#00000066",   
        },
        
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 5,
          autoSkip: false,
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            size: 14,
            weight: "bold",
          },
          callback: (value) => {
            const num = Number(value);
            return num >= 1000 ? num / 1000 + "K" : num;
          },
          color:"#00000066",   
        },
        
      },
    },
    
  };
  

  return (
    <div className="w-full bg-[]">
      <h3 className="m-4 font-bold">Top 6 địa điểm được xem nhiều nhất</h3>
      <Bar data={barData} options={options} />
    </div>
  );
};

export default TopPlacesBarChart;
