"use client";

import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type ValidChartType = "co2" | "temp" | "humidity" | "voltage";

const DashboardCharts = ({
  data,
}: {
  data: {
    co2: number;
    temp: number;
    humidity: number;
    voltage: number;
    when: number;
  }[];
}) => {
  const co2Data = data.map((event) => ({
    time: event.when * 1000,
    value: event.co2,
  }));
  const tempData = data.map((event) => ({
    time: event.when * 1000,
    value: event.temp,
  }));
  const humidityData = data.map((event) => ({
    time: event.when * 1000,
    value: event.humidity,
  }));
  const voltageData = data.map((event) => ({
    time: event.when * 1000,
    value: event.voltage,
  }));

  return (
    <>
      <DashboardChart type="co2" data={co2Data.reverse()} />
      <DashboardChart type="temp" data={tempData.reverse()} />
      <DashboardChart type="humidity" data={humidityData.reverse()} />
      <DashboardChart type="voltage" data={voltageData.reverse()} />
    </>
  );
};

interface ChartDataPoint {
  time: number;
  value: number;
}

const getTitle = (type: string) => {
  if (type === "co2") return "CO2";
  if (type === "humidity") return "Humidity";
  if (type === "temp") return "Temperature";
  if (type === "voltage") return "Voltage";
};
const getDescription = (data: ChartDataPoint[]) => {
  const first = data[0];
  const last = data[data.length - 1];
  return `
    ${new Date(first.time).toLocaleString()} — ${new Date(
    last.time
  ).toLocaleString()}`;
};
const getUnit = (type: string) => {
  if (type === "co2") return "";
  if (type === "humidity") return "%";
  if (type === "temp") return "°";
  if (type === "voltage") return "V";
};
const getLineColor = (type: string) => {
  if (type === "co2") return "#EF4444";
  if (type === "humidity") return "#3B82F6";
  if (type === "temp") return "#F59E0B";
  if (type === "voltage") return "#10B981";
};

const DashboardChart = ({
  type,
  data,
}: {
  type: ValidChartType;
  data: ChartDataPoint[];
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-medium">{getTitle(type)}</CardTitle>
        <CardDescription>{getDescription(data)}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: -20, bottom: -10 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="time" tick={false} />
            <YAxis
              tickLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}${getUnit(type)}`}
            />

            <ChartTooltip content={<CustomTooltip type={type} />} />

            <Line
              dataKey="value"
              type="linear"
              stroke={getLineColor(type)}
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  type: ValidChartType;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  type,
}) => {
  console.log(type);
  if (!payload || payload.length === 0) return null;

  const formatValue = (value: number) => {
    if (type === "co2") return `${value} PPM`;
    if (type === "humidity") return `${value}%`;
    if (type === "temp") return `${value}°`;
    if (type === "voltage") return `${value}V`;
  };

  return (
    <div className="bg-white p-2 rounded-lg shadow-lg">
      <p className="text-sm font-medium text-gray-900">
        {/* // make the label and value look good in a tooltip */}
        {new Date(label as number).toLocaleString()}
        <br />
        <b>{formatValue(payload[0].value as number)}</b>
      </p>
    </div>
  );
};

export default DashboardCharts;
