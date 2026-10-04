"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { NotehubEvent } from "../types/notehub";
import TimeRangeFilter from "./TimeRangeFilter";
import type { TimeRange } from "../utils/timeRanges";
import ChartSkeleton from "./ChartSkeleton";

const MetricCharts = dynamic(() => import("./MetricCharts"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

type Result = { range: TimeRange; events?: NotehubEvent[]; error?: string };

export default function EventList() {
  const [range, setRange] = useState<TimeRange>("24h");
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const cache = useRef(new Map<TimeRange, { events: NotehubEvent[]; expires: number }>());

  useEffect(() => {
    // Download the chart code alongside the data rather than after it arrives.
    void import("./MetricCharts").catch(() => {});
    const controller = new AbortController();
    const cached = cache.current.get(range);
    if (cached && cached.expires > Date.now()) {
      setResult({ range, events: cached.events });
      return;
    }
    setResult(null);
    async function load() {
      try {
        const response = await fetch(`/api/events?range=${range}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.events)) {
          throw new Error("Unable to load sensor data. Please try again.");
        }
        if (controller.signal.aborted) return;
        cache.current.set(range, { events: data.events, expires: Date.now() + 60_000 });
        setResult({ range, events: data.events });
      } catch {
        if (!controller.signal.aborted) {
          setResult({ range, error: "Unable to load sensor data. Please try again." });
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [range, attempt]);

  const current = result?.range === range ? result : null;
  return (
    <div className="space-y-6">
      <TimeRangeFilter selectedRange={range} onRangeChange={setRange} />
      {current?.error ? (
        <div role="alert" className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-red-600">{current.error}</p>
          <button onClick={() => setAttempt((value) => value + 1)} className="mt-4 px-4 py-2 rounded-full bg-blue-500 text-white">Try again</button>
        </div>
      ) : current?.events ? (
        <MetricCharts events={current.events} />
      ) : (
        <ChartSkeleton />
      )}
    </div>
  );
}
