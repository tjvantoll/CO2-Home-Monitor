import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "../../utils/notehub";
import { isTimeRange } from "../../utils/timeRanges";

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get("range") ?? "24h";
  if (!isTimeRange(range)) {
    return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
  }
  try {
    const events = await getEvents(range, request.signal);
    return NextResponse.json({ events }, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60" },
    });
  } catch (error) {
    console.error("Events request failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Unable to load sensor data. Please try again." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
