"use client";

import React from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface Event {
  device: string;
  value: number;
  when: number;
}

interface EventsByDevice {
  [device: string]: { value: number; time: number }[];
}

const DashboardChartAll: React.FC<{ events: Event[] }> = ({ events }) => {
  const eventsByDevice = events.reduce((acc, event) => {
    const {
      device,
      value,
      when,
    }: { device: string; value: number; when: number } = event;
    if (!acc[device]) {
      acc[device] = [];
    }
    acc[device].push({ value, time: when * 1000 });
    return acc;
  }, {} as EventsByDevice);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="font-medium">
          CO<sup>2</sup> Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            margin={{ left: -10, bottom: -10, right: 10 }}
            data={events}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={false}
            />
            <YAxis dataKey="value" tickLine={false} tickMargin={8} />
            <Legend />
            {Object.entries(eventsByDevice).map(([device, data], index) => (
              <Line
                key={device}
                name={device}
                dataKey="value"
                type="linear"
                stroke={["#166534", "#1e40af", "#86198f", "#be123c"].at(index)}
                strokeWidth={2}
                data={data}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DashboardChartAll;
