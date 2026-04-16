"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "coc_api_cooldown_until";

function getRemainingSeconds(): number {
  if (typeof window === "undefined") return 0;
  const until = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

interface ApiCooldown {
  secondsLeft: number;
  isOnCooldown: boolean;
  startCooldown: (seconds?: number) => void;
  handleError: (error: string) => string;
}

export function useApiCooldown(): ApiCooldown {
  const [secondsLeft, setSecondsLeft] = useState(getRemainingSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (initial: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(initial);
    timerRef.current = setInterval(() => {
      const remaining = getRemainingSeconds();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, 1000);
  };

  // On mount: if there's already an active cooldown, resume the countdown
  useEffect(() => {
    const remaining = getRemainingSeconds();
    if (remaining > 0) startTimer(remaining);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCooldown = (seconds = 60) => {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + seconds * 1000));
    startTimer(seconds);
  };

  const handleError = (error: string): string => {
    const match = error.match(/Please wait (\d+)s before fetching again/);
    if (match) startCooldown(parseInt(match[1], 10));
    return error;
  };

  return { secondsLeft, isOnCooldown: secondsLeft > 0, startCooldown, handleError };
}
