import { NotehubEvent } from "../types/notehub";

async function getAccessToken(): Promise<string> {
  const token = process.env.NOTEHUB_PERSONAL_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      "Missing NOTEHUB_PERSONAL_ACCESS_TOKEN in environment variables"
    );
  }

  return token;
}

export async function getEvents(): Promise<NotehubEvent[]> {
  try {
    const accessToken = await getAccessToken();
    const projectUID = process.env.NOTEHUB_PROJECT_UID;

    if (!projectUID) {
      throw new Error("Missing Notehub project UID in environment variables");
    }

    const params = new URLSearchParams({
      sortOrder: "desc",
      sortBy: "captured",
      pageSize: "5000",
      files: "data.qo",
    });

    const response = await fetch(
      `https://api.notefile.net/v1/projects/${projectUID}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store", // Disable caching to always get fresh data
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Events request failed:", errorText);
      throw new Error("Failed to fetch events");
    }

    const data = await response.json();
    console.log(`Retrieved ${data.events?.length || 0} events`);
    return data.events || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
