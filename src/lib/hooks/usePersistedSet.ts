"use client";

import { useState, useEffect } from "react";

export const usePersistedSet = (key: string): [Set<string>, (value: string) => void] => {
  const [set, setSet] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(key);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify([...set]));
  }, [key, set]);

  const toggle = (value: string) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return [set, toggle];
};
