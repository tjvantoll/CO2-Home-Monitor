"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TooltipItem,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { NotehubEvent } from "../types/notehub";
import { processEventsForCharts } from "../utils/chartHelpers";
import { useMemo } from "react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        padding: 20,
        font: {
          size: 13,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#1f2937",
      bodyColor: "#1f2937",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      padding: 12,
      bodySpacing: 8,
      titleFont: {
        size: 14,
        weight: "bold" as const,
      },
      bodyFont: {
        size: 13,
      },
      callbacks: {
        title: (items: TooltipItem<"line">[]) => {
          if (items.length > 0 && items[0].parsed.x !== null) {
            const date = new Date(items[0].parsed.x);
            return date.toLocaleString();
          }
          return "";
        },
      },
    },
  },
  scales: {
    x: {
      type: "time" as const,
      time: {
        unit: "hour" as const,
        displayFormats: {
          hour: "MMM d, h:mm a",
        },
      },
      grid: {
        color: "#f3f4f6",
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      beginAtZero: false,
      grid: {
        color: "#f3f4f6",
      },
    },
  },
};

function formatMetricName(metric: string): string {
  if (metric.toLowerCase() === "co2") {
    return "CO₂";
  }
  if (metric.toLowerCase() === "temp") {
    return "Temperature";
  }
  return metric
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function MetricCharts({ events }: { events: NotehubEvent[] }) {
  const chartData = useMemo(() => processEventsForCharts(events), [events]);

  if (Object.keys(chartData).length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
        No data found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(chartData).map(([metric, data]) => (
          <div key={metric} className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-900 tracking-tight">
              {formatMetricName(metric)}
            </h3>
            <div className="h-[350px]">
              <Line options={chartOptions} data={data} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
