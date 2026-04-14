"use server";

const { ClashApi } = require("clash-of-clans-api");

import type { PlayerApiResponse } from "@/types/app";

export async function fetchPlayerByTag(
  tag: string
): Promise<{ success: true; player: PlayerApiResponse } | { success: false; error: string }> {
  const token = process.env.COC_API_TOKEN;

  if (!token) {
    return {
      success: false,
      error: "COC_API_TOKEN is not configured. Add it to your .env.local file.",
    };
  }

  // Normalise the tag: ensure it starts with #
  const normalized = tag.trim().startsWith("#") ? tag.trim() : `#${tag.trim()}`;

  try {
    const client = new ClashApi({ token });
    const player = (await client.playerByTag(normalized)) as PlayerApiResponse;
    return { success: true, player };
  } catch (err: unknown) {
    // request-promise rejects with a StatusCodeError on non-2xx responses
    if (err && typeof err === "object" && "statusCode" in err) {
      const status = (err as { statusCode: number }).statusCode;
      if (status === 404) return { success: false, error: `Player "${normalized}" not found.` };
      if (status === 403) return { success: false, error: "API token is invalid or unauthorised." };
      return { success: false, error: `API error ${status}.` };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error fetching player.",
    };
  }
}
