"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { categoryViews } from "../../assets/data/category";

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart: React.FC = () => {
  const totalViews = categoryViews.reduce((sum, item) => sum + item.views, 0);

  const labels = categoryViews.map((item) => item.category);
  const data = categoryViews.map((item) => item.views);

  const colors = [
    "#307AFD",
    "#FFB226",
    "#94E9B8",
    "#AEC7ED",    
  ];

  const pieData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderWidth: 1,
        borderColor: "#fff",
        borderRadius: 3,
        hoverOffset: 10, 
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "50%",
    plugins: {
      legend: {
        display: false, 
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <>
    <h4 className="m-4 font-bold">Các danh mục</h4>
    <div className="flex w-full items-center justify-center ">

      <div className='w-[30%]'>
        <Pie data={pieData} options={options} />
      </div>

      <div className=" ml-8 ">        
        {categoryViews.map((item, idx) => {
          const percent = ((item.views / totalViews) * 100).toFixed(1);
          return (
            <div
              key={item.category}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div className="w-2 h-2 rounded-full mr-1"
                style={{               
                  backgroundColor: colors[idx],               
                }}
              />
              <div className="w-30">{item.category}</div>
              <div className="">{percent}%</div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default CategoryChart;
