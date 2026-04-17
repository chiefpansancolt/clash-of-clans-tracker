"use server";

import { headers } from "next/headers";

const { ClashApi } = require("clash-of-clans-api");

import type { PlayerApiResponse } from "@/types/app";

// Module-level singleton: survives across requests in the same server process.
// Keyed by client IP → timestamp of last successful call.
const _lastCall = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 60 seconds

function getRateLimitResult(ip: string): { allowed: boolean; secondsRemaining: number } {
  const now = Date.now();
  const last = _lastCall.get(ip) ?? 0;
  const elapsed = now - last;
  if (elapsed < RATE_LIMIT_MS) {
    return { allowed: false, secondsRemaining: Math.ceil((RATE_LIMIT_MS - elapsed) / 1000) };
  }
  _lastCall.set(ip, now);
  return { allowed: true, secondsRemaining: 0 };
}

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

export async function fetchPlayerByTag(
  tag: string
): Promise<{ success: true; player: PlayerApiResponse } | { success: false; error: string }> {
  const ip = await getClientIp();
  const { allowed, secondsRemaining } = getRateLimitResult(ip);

  if (!allowed) {
    return {
      success: false,
      error: `Please wait ${secondsRemaining}s before fetching again.`,
    };
  }

  const token = process.env.COC_API_TOKEN;

  if (!token) {
    // Don't consume the rate limit slot for a config error
    _lastCall.delete(ip);
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
    // Don't consume the rate limit slot on API errors so the user can correct and retry
    _lastCall.delete(ip);
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
