import { NotehubEvent } from "../types/notehub";

interface ChartDataset {
  label: string;
  data: { x: number; y: number }[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
}

interface ChartData {
  datasets: ChartDataset[];
}

// Predefined colors for devices
const DEVICE_COLORS = [
  { border: "rgb(59, 130, 246)", background: "rgba(59, 130, 246, 0.1)" }, // Blue
  { border: "rgb(239, 68, 68)", background: "rgba(239, 68, 68, 0.1)" }, // Red
  { border: "rgb(16, 185, 129)", background: "rgba(16, 185, 129, 0.1)" }, // Green
  { border: "rgb(139, 92, 246)", background: "rgba(139, 92, 246, 0.1)" }, // Purple
  { border: "rgb(245, 158, 11)", background: "rgba(245, 158, 11, 0.1)" }, // Orange
  { border: "rgb(236, 72, 153)", background: "rgba(236, 72, 153, 0.1)" }, // Pink
  { border: "rgb(14, 165, 233)", background: "rgba(14, 165, 233, 0.1)" }, // Light Blue
  { border: "rgb(168, 85, 247)", background: "rgba(168, 85, 247, 0.1)" }, // Purple
];

// Create a stable color mapping for devices
const deviceColorMap = new Map<string, (typeof DEVICE_COLORS)[0]>();

function getDeviceColor(deviceId: string) {
  if (!deviceColorMap.has(deviceId)) {
    const colorIndex = deviceColorMap.size % DEVICE_COLORS.length;
    deviceColorMap.set(deviceId, DEVICE_COLORS[colorIndex]);
  }
  return deviceColorMap.get(deviceId)!;
}

export function processEventsForCharts(
  events: NotehubEvent[]
): Record<string, ChartData> {
  const deviceData: Record<
    string,
    Record<string, { x: number; y: number }[]>
  > = {};

  // Process events in chronological order (oldest first)
  const sortedEvents = [...events].sort((a, b) => a.when - b.when);

  sortedEvents.forEach((event) => {
    if (!event.body || typeof event.body !== "object") return;

    Object.entries(event.body).forEach(([key, value]) => {
      if (typeof value === "number") {
        const deviceId = event.best_id || event.device;

        // Initialize nested structures if they don't exist
        if (!deviceData[key]) deviceData[key] = {};
        if (!deviceData[key][deviceId]) deviceData[key][deviceId] = [];

        // Convert UNIX timestamp to milliseconds for Chart.js time scale
        deviceData[key][deviceId].push({
          x: event.when * 1000, // Convert to milliseconds
          y: value,
        });
      }
    });
  });

  // Convert to Chart.js format
  const chartData: Record<string, ChartData> = {};

  Object.entries(deviceData).forEach(([metric, devices]) => {
    chartData[metric] = {
      datasets: Object.entries(devices).map(([deviceId, data]) => {
        const color = getDeviceColor(deviceId);
        return {
          label: deviceId,
          data: data,
          borderColor: color.border,
          backgroundColor: color.background,
          tension: 0.3,
        };
      }),
    };
  });

  return chartData;
}
