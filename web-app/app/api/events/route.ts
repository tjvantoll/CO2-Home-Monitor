import { NextResponse } from "next/server";

async function getNotehubToken() {
  const response = await fetch("https://notehub.io/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.NOTEHUB_CLIENT_ID!,
      client_secret: process.env.NOTEHUB_CLIENT_SECRET!,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export async function GET() {
  try {
    const token = await getNotehubToken();
    const projectUID = process.env.NOTEHUB_PROJECT_UID;

    const response = await fetch(
      `https://api.notefile.net/v1/projects/${projectUID}/events?sortOrder=desc&sortBy=captured`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    // Log the first event to see its structure
    if (data.events && data.events.length > 0) {
      console.log(
        "API Response - First event:",
        JSON.stringify(data.events[0], null, 2)
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
