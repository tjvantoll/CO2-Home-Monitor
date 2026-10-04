import type { NotehubEvent, NotehubEventsResponse } from "../types/notehub";
import { TIME_RANGES, type TimeRange } from "./timeRanges";

export async function getEvents(
  range: TimeRange = "24h",
  signal?: AbortSignal
): Promise<NotehubEvent[]> {
  const token = process.env.NOTEHUB_PERSONAL_ACCESS_TOKEN;
  const projectUID = process.env.NOTEHUB_PROJECT_UID;
  if (!token || !projectUID) {
    throw new Error("Missing Notehub configuration");
  }

  // Keep the window fixed across pages, and share upstream cache keys for a minute.
  const endDate = Math.floor(Date.now() / 60_000) * 60;
  const startDate = endDate - TIME_RANGES[range];
  const events: NotehubEvent[] = [];
  const deadline = AbortSignal.timeout(25_000);
  const requestSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;

  for (let pageNum = 1; ; pageNum++) {
    const params = new URLSearchParams({
      sortOrder: "asc",
      sortBy: "captured",
      dateType: "captured",
      startDate: String(startDate),
      endDate: String(endDate),
      pageSize: "1000",
      pageNum: String(pageNum),
      files: "data.qo",
      selectFields: "when,body,device,best_id",
    });
    const response = await fetch(
      `https://api.notefile.net/v1/projects/${projectUID}/events?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
        signal: requestSignal,
      }
    );
    if (!response.ok) {
      throw new Error(`Notehub events request failed (${response.status})`);
    }
    const data: NotehubEventsResponse = await response.json();
    if (!Array.isArray(data.events) || (data.has_more && !data.events.length)) {
      throw new Error("Invalid Notehub events response");
    }
    // Only send chart fields to the browser, even if the upstream API adds metadata.
    events.push(...data.events.map(({ when, body, device, best_id }) => ({
      when, body, device, best_id,
    })));
    if (!data.has_more) return events;
  }
}
