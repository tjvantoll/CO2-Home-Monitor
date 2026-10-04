"use client";

import { useEffect, useState } from "react";
import { NotehubEvent } from "../types/notehub";
import MetricCharts from "./MetricCharts";

export default function EventList() {
  const [events, setEvents] = useState<NotehubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();

        if (response.ok) {
          setEvents(data.events || []);
        } else {
          setError(data.error || "Failed to fetch events");
        }
      } catch (error) {
        setError(
          "Failed to fetch events: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (events.length === 0) {
    return <div className="p-4">No events found</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Metrics</h2>
      <MetricCharts events={events} />
    </div>
  );
}
